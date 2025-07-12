import { connectMongoDB } from "@/lib/mongodb";
import Product from "@/models/product";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET - Fetch single product
export async function GET(req, { params }) {
  try {
    await connectMongoDB();
    
    const product = await Product.findById(params.id).lean();
    
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Transform product to include id field and proper data types
    const transformedProduct = {
      ...product,
      id: product._id.toString(),
      specifications: product.specifications ? Object.fromEntries(product.specifications) : {},
      sellerId: product.sellerId.toString(),
    };

    return NextResponse.json({ product: transformedProduct });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { message: "Error fetching product" },
      { status: 500 }
    );
  }
}

// PUT - Update product (seller only)
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectMongoDB();
    
    const product = await Product.findById(params.id);
    
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Check if user owns this product
    if (product.sellerId.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Forbidden - You can only update your own products" },
        { status: 403 }
      );
    }

    const updateData = await req.json();
    
    // Validate required fields if they're being updated
    if (updateData.name !== undefined && !updateData.name.trim()) {
      return NextResponse.json(
        { message: "Product name cannot be empty" },
        { status: 400 }
      );
    }

    if (updateData.price !== undefined && updateData.price <= 0) {
      return NextResponse.json(
        { message: "Price must be greater than 0" },
        { status: 400 }
      );
    }

    if (updateData.stockQuantity !== undefined && updateData.stockQuantity < 0) {
      return NextResponse.json(
        { message: "Stock quantity cannot be negative" },
        { status: 400 }
      );
    }
    
    // Update inStock based on stockQuantity
    if (updateData.stockQuantity !== undefined) {
      updateData.inStock = updateData.stockQuantity > 0;
    }
    
    // Update main image from images array
    if (updateData.images && updateData.images.length > 0) {
      updateData.image = updateData.images[0];
    }

    // Convert specifications object to Map for MongoDB
    if (updateData.specifications && typeof updateData.specifications === 'object') {
      updateData.specifications = new Map(Object.entries(updateData.specifications));
    }

    // Update seller name if it has changed
    updateData.sellerName = session.user.businessName || session.user.name;

    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Transform response
    const responseProduct = {
      ...updatedProduct.toObject(),
      id: updatedProduct._id.toString(),
      specifications: updatedProduct.specifications ? Object.fromEntries(updatedProduct.specifications) : {},
    };

    return NextResponse.json({
      message: "Product updated successfully",
      product: responseProduct
    });
  } catch (error) {
    console.error("Error updating product:", error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { message: "Validation error", errors: validationErrors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Error updating product" },
      { status: 500 }
    );
  }
}

// DELETE - Delete product (seller only)
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectMongoDB();
    
    const product = await Product.findById(params.id);
    
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Check if user owns this product
    if (product.sellerId.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Forbidden - You can only delete your own products" },
        { status: 403 }
      );
    }

    // Soft delete by setting isActive to false
    await Product.findByIdAndUpdate(params.id, { isActive: false });

    return NextResponse.json({
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { message: "Error deleting product" },
      { status: 500 }
    );
  }
}