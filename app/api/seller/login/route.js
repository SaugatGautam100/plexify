import { connectMongoDB } from "@/lib/mongodb";
import Seller from "@/models/seller";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Connect to MongoDB
    await connectMongoDB();
    
    // Find seller by email
    const seller = await Seller.findOne({ email });
    
    if (!seller) {
      return NextResponse.json(
        { message: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Check if seller is active
    if (!seller.isActive) {
      return NextResponse.json(
        { message: "Account is deactivated. Please contact support." },
        { status: 401 }
      );
    }

    // Verify password
    const passwordsMatch = await bcrypt.compare(password, seller.password);
    
    if (!passwordsMatch) {
      return NextResponse.json(
        { message: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        sellerId: seller._id,
        email: seller.email,
        type: 'seller'
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Return seller data (excluding password)
    const sellerData = {
      id: seller._id,
      name: seller.name,
      email: seller.email,
      phone: seller.phone,
      businessName: seller.businessName,
      businessAddress: seller.businessAddress,
      description: seller.description,
      rating: seller.rating,
      totalSales: seller.totalSales,
      isVerified: seller.isVerified,
      createdAt: seller.createdAt,
    };

    const response = NextResponse.json({
      message: "Login successful",
      seller: sellerData,
      token
    });

    // Set HTTP-only cookie for token
    response.cookies.set('seller-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Error during seller login:", error);
    return NextResponse.json(
      { message: "An error occurred during login." },
      { status: 500 }
    );
  }
}