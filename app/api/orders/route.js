import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/order";
import Product from "@/models/product";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

// GET - Fetch orders for user or seller
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectMongoDB();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (session.user.userType === 'user') {
      query.userId = session.user.id;
    } else if (session.user.userType === 'seller') {
      // For sellers, find orders containing their products
      query['items.sellerId'] = session.user.id;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Order.countDocuments(query);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Error fetching orders" },
      { status: 500 }
    );
  }
}

// POST - Create new order
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'user') {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectMongoDB();
    
    const orderData = await req.json();

    // Validate required fields
    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { message: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    if (!orderData.shippingAddress) {
      return NextResponse.json(
        { message: "Shipping address is required" },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Validate products and get current prices
    const orderItems = [];
    let subtotal = 0;

    for (const item of orderData.items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return NextResponse.json(
          { message: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }

      if (!product.inStock || product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { message: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      const orderItem = {
        productId: product._id,
        productName: product.name,
        productImage: product.image,
        price: product.price,
        quantity: item.quantity,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
      };

      orderItems.push(orderItem);
      subtotal += product.price * item.quantity;

      // Update product stock
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stockQuantity: -item.quantity },
        inStock: product.stockQuantity - item.quantity > 0
      });
    }

    const shipping = subtotal > 50 ? 0 : 10;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const order = await Order.create({
      orderNumber,
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      items: orderItems,
      subtotal,
      shipping,
      tax,
      total,
      paymentMethod: orderData.paymentMethod,
      shippingAddress: orderData.shippingAddress,
      status: 'confirmed',
      paymentStatus: 'paid',
    });

    return NextResponse.json(
      { message: "Order created successfully", order },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { message: "Error creating order" },
      { status: 500 }
    );
  }
}