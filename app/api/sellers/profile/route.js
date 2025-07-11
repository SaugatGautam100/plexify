import { connectMongoDB } from "@/lib/mongodb";
import Seller from "@/models/seller";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET - Get seller profile
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'seller') {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectMongoDB();
    
    const seller = await Seller.findById(session.user.id).select('-password').lean();
    
    if (!seller) {
      return NextResponse.json(
        { message: "Seller not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ seller });
  } catch (error) {
    console.error("Error fetching seller profile:", error);
    return NextResponse.json(
      { message: "Error fetching profile" },
      { status: 500 }
    );
  }
}

// PUT - Update seller profile
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'seller') {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectMongoDB();
    
    const updateData = await req.json();
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.email; // Email updates might need verification
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.isVerified; // Only admin can verify
    delete updateData.rating; // Rating is calculated
    delete updateData.totalSales; // Sales are calculated

    const updatedSeller = await Seller.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedSeller) {
      return NextResponse.json(
        { message: "Seller not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      seller: updatedSeller
    });
  } catch (error) {
    console.error("Error updating seller profile:", error);
    return NextResponse.json(
      { message: "Error updating profile" },
      { status: 500 }
    );
  }
}