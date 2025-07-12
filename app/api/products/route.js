import { connectMongoDB } from "@/lib/mongodb";
import Product from "@/models/product";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

// GET - Fetch all products with pagination and filters
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
    const minPrice = parseFloat(searchParams.get('minPrice')) || 0;
    const maxPrice = parseFloat(searchParams.get('maxPrice')) || 999999;
    const brand = searchParams.get('brand');

    // Build query
    let query = { isActive: true };
    
    // For seller's own products, show all including out of stock
    if (!sellerId) {
      query.inStock = true;
    }
    
    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(category, 'i') };
    }
    
    if (sellerId) {
      query.sellerId = sellerId;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } },
        { brand: { $regex: new RegExp(search, 'i') } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (brand) {
      query.brand = { $regex: new RegExp(brand, 'i') };
    }

    // Price range filter
    query.price = { $gte: minPrice, $lte: maxPrice };

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
      case 'popularity':
        sortObj.reviews = -1;
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

    // Transform products to include id field and ensure proper data types
    const transformedProducts = products.map(product => ({
      ...product,
      id: product._id.toString(),
      specifications: product.specifications ? Object.fromEntries(product.specifications) : {},
      sellerId: product.sellerId.toString(),
    }));

    // Get unique brands for filtering
    const brands = await Product.distinct('brand', { isActive: true, inStock: true });

    return NextResponse.json({
      products: transformedProducts,
      brands: brands.sort(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
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
        { message: "Missing required fields: name, description, category, brand" },
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

    if (productData.stockQuantity < 0) {
      return NextResponse.json(
        { message: "Stock quantity cannot be negative" },
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

    // Ensure arrays are properly formatted
    productData.features = productData.features || [];
    productData.tags = productData.tags || [];
    
    // Convert specifications object to Map for MongoDB
    if (productData.specifications && typeof productData.specifications === 'object') {
      productData.specifications = new Map(Object.entries(productData.specifications));
    }

    const product = await Product.create(productData);
    
    // Transform response
    const responseProduct = {
      ...product.toObject(),
      id: product._id.toString(),
      specifications: product.specifications ? Object.fromEntries(product.specifications) : {},
    };
    
    return NextResponse.json(
      { message: "Product created successfully", product: responseProduct },
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