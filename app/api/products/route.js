import { connectMongoDB } from "@/lib/mongodb";
import Product from "@/models/product";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

// GET - Fetch all products with optional filters
export async function GET(req) {
  try {
    await connectMongoDB();
    
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sellerId = searchParams.get('sellerId');
    const limit = parseInt(searchParams.get('limit')) || 12;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    let query = { isActive: true, inStock: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (sellerId) {
      query.sellerId = sellerId;
      // For seller's own products, show all including out of stock
      delete query.inStock;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    let sortObj = {};
    switch (sortBy) {
      case 'price':
        sortObj.price = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'rating':
        sortObj.rating = -1;
        break;
      case 'name':
        sortObj.name = sortOrder === 'asc' ? 1 : -1;
        break;
      default:
        sortObj.createdAt = -1;
    }

    const products = await Product.find(query)
      .sort(sortObj)
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Product.countDocuments(query);

    // Transform products to include id field
    const transformedProducts = products.map(product => ({
      ...product,
      id: product._id.toString(),
    }));

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Error fetching products" },
      { status: 500 }
    );
  }
}

// POST - Create new product (seller only)
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is a seller
    if (session.user?.userType !== 'seller') {
      return NextResponse.json(
        { message: "Only sellers can add products" },
        { status: 403 }
      );
    }
    await connectMongoDB();
    
    const productData = await req.json();

    // Validate required fields
    if (!productData.name || !productData.description || !productData.category || !productData.brand) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!productData.images || productData.images.length === 0) {
      return NextResponse.json(
        { message: "At least one product image is required" },
        { status: 400 }
      );
    }

    if (productData.price <= 0) {
      return NextResponse.json(
        { message: "Price must be greater than 0" },
        { status: 400 }
      );
    }
    
    // Add seller information
    productData.sellerId = session.user.id;
    productData.sellerName = session.user.businessName || session.user.name;
    
    // Set inStock based on stockQuantity
    productData.inStock = productData.stockQuantity > 0;
    
    // Set main image from images array
    if (productData.images && productData.images.length > 0) {
      productData.image = productData.images[0];
    }

    // Set default values
    productData.rating = 0;
    productData.reviews = 0;
    productData.isActive = true;
    const product = await Product.create(productData);
    
    return NextResponse.json(
      { message: "Product created successfully", product },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { message: "Validation error", errors: validationErrors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Error creating product" },
      { status: 500 }
    );
  }
}