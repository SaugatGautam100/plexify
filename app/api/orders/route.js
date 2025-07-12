import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/order";
import Product from "@/models/product";
import User from "@/models/user";
import Seller from "@/models/seller";
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
    const status = searchParams.get('status');

    let query = {};
    
    if (session.user.userType === 'user') {
      query.userId = session.user.id;
    } else if (session.user.userType === 'seller') {
      // For sellers, find orders containing their products
      query['items.sellerId'] = session.user.id;
    }

    // Add status filter if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Order.countDocuments(query);

    // Transform orders to include proper id field
    const transformedOrders = orders.map(order => ({
      ...order,
      id: order._id.toString(),
      items: order.items.map(item => ({
        ...item,
        productId: item.productId.toString(),
        sellerId: item.sellerId.toString(),
      }))
    }));

    return NextResponse.json({
      orders: transformedOrders,
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

    // Update user's order history
    await User.findByIdAndUpdate(session.user.id, {
      $push: { orderHistory: order._id }
    });

    // Update sellers' order history and sales
    const sellerUpdates = {};
    for (const item of orderItems) {
      const sellerId = item.sellerId.toString();
      if (!sellerUpdates[sellerId]) {
        sellerUpdates[sellerId] = {
          orderValue: 0,
          itemCount: 0
        };
      }
      sellerUpdates[sellerId].orderValue += item.price * item.quantity;
      sellerUpdates[sellerId].itemCount += item.quantity;
    }

    // Update each seller's statistics
    for (const [sellerId, stats] of Object.entries(sellerUpdates)) {
      await Seller.findByIdAndUpdate(sellerId, {
        $inc: { 
          totalSales: stats.itemCount,
          totalRevenue: stats.orderValue 
        },
        $push: { orderHistory: order._id }
      });
    }

    // Transform response
    const responseOrder = {
      ...order.toObject(),
      id: order._id.toString(),
      items: order.items.map(item => ({
        ...item,
        productId: item.productId.toString(),
        sellerId: item.sellerId.toString(),
      }))
    };

    return NextResponse.json(
      { message: "Order created successfully", order: responseOrder },
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