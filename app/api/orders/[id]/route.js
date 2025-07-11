import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/order";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET - Fetch single order
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectMongoDB();
    
    const order = await Order.findById(params.id).lean();
    
    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this order
    if (session.user.userType === 'user' && order.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    if (session.user.userType === 'seller') {
      const hasSellerItems = order.items.some(item => item.sellerId.toString() === session.user.id);
      if (!hasSellerItems) {
        return NextResponse.json(
          { message: "Forbidden" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { message: "Error fetching order" },
      { status: 500 }
    );
  }
}

// PUT - Update order status (seller only)
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'seller') {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectMongoDB();
    
    const order = await Order.findById(params.id);
    
    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // Check if seller has items in this order
    const hasSellerItems = order.items.some(item => item.sellerId.toString() === session.user.id);
    if (!hasSellerItems) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const updateData = await req.json();
    
    // Update allowed fields
    const allowedUpdates = ['status', 'trackingNumber', 'deliveryPartner', 'estimatedDelivery', 'cancellationReason'];
    const updates = {};
    
    for (const field of allowedUpdates) {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    }

    // Set timestamps based on status
    if (updateData.status === 'delivered') {
      updates.deliveredAt = new Date();
    } else if (updateData.status === 'cancelled') {
      updates.cancelledAt = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      updates,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      message: "Order updated successfully",
      order: updatedOrder
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { message: "Error updating order" },
      { status: 500 }
    );
  }
}