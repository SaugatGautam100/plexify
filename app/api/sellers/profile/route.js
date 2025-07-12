import { connectMongoDB } from "@/lib/mongodb";
import Seller from "@/models/seller";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

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
    
    const seller = await Seller.findById(session.user.id)
      .select('-password')
      .populate('orderHistory')
      .lean();
    
    if (!seller) {
      return NextResponse.json(
        { message: "Seller not found" },
        { status: 404 }
      );
    }

    // Transform seller data
    const transformedSeller = {
      ...seller,
      id: seller._id.toString(),
      orderHistory: seller.orderHistory ? seller.orderHistory.map(order => ({
        ...order,
        id: order._id.toString()
      })) : []
    };

    return NextResponse.json({ seller: transformedSeller });
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
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.isVerified; // Only admin can verify
    delete updateData.rating; // Rating is calculated
    delete updateData.totalSales; // Sales are calculated
    delete updateData.orderHistory;

    // Validate email format if being updated
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return NextResponse.json(
          { message: "Invalid email format" },
          { status: 400 }
        );
      }

      // Check if email is already taken by another seller
      const existingSeller = await Seller.findOne({ 
        email: updateData.email, 
        _id: { $ne: session.user.id } 
      });
      
      if (existingSeller) {
        return NextResponse.json(
          { message: "Email is already taken" },
          { status: 400 }
        );
      }
    }

    // Validate phone format if being updated
    if (updateData.phone) {
      const phoneRegex = /^\+?[0-9]{7,15}$/;
      if (!phoneRegex.test(updateData.phone)) {
        return NextResponse.json(
          { message: "Invalid phone number format" },
          { status: 400 }
        );
      }
    }

    // Validate required business fields
    if (updateData.businessName !== undefined && !updateData.businessName.trim()) {
      return NextResponse.json(
        { message: "Business name cannot be empty" },
        { status: 400 }
      );
    }

    if (updateData.businessAddress !== undefined && !updateData.businessAddress.trim()) {
      return NextResponse.json(
        { message: "Business address cannot be empty" },
        { status: 400 }
      );
    }

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

    // Transform response
    const responseSeller = {
      ...updatedSeller.toObject(),
      id: updatedSeller._id.toString(),
    };

    return NextResponse.json({
      message: "Profile updated successfully",
      seller: responseSeller
    });
  } catch (error) {
    console.error("Error updating seller profile:", error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { message: "Validation error", errors: validationErrors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Error updating profile" },
      { status: 500 }
    );
  }
}

// PATCH - Change password
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'seller') {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectMongoDB();
    
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { message: "New password must be at least 4 characters long" },
        { status: 400 }
      );
    }

    const seller = await Seller.findById(session.user.id);
    
    if (!seller) {
      return NextResponse.json(
        { message: "Seller not found" },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, seller.password);
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await Seller.findByIdAndUpdate(session.user.id, {
      password: hashedNewPassword
    });

    return NextResponse.json({
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { message: "Error updating password" },
      { status: 500 }
    );
  }
}