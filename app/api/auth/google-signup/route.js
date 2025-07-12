import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import Seller from "@/models/seller";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, name, userType, additionalData } = await req.json();

    await connectMongoDB();

    if (userType === 'seller') {
      // Check if seller already exists
      const existingSeller = await Seller.findOne({ email });
      if (existingSeller) {
        return NextResponse.json(
          { message: "Seller with this email already exists." },
          { status: 400 }
        );
      }

      // Validate required seller fields
      if (!additionalData.businessName || !additionalData.businessAddress || !additionalData.phone) {
        return NextResponse.json(
          { message: "Business name, address, and phone are required for sellers." },
          { status: 400 }
        );
      }

      const seller = await Seller.create({
        name,
        email,
        phone: additionalData.phone,
        businessName: additionalData.businessName,
        businessAddress: additionalData.businessAddress,
        description: additionalData.description || "",
        password: "", // No password for social login
      });

      return NextResponse.json({ 
        message: "Seller account created successfully.",
        userType: 'seller',
        user: {
          id: seller._id.toString(),
          name: seller.name,
          email: seller.email,
          userType: 'seller'
        }
      }, { status: 201 });
    } else {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { message: "User with this email already exists." },
          { status: 400 }
        );
      }

      // Validate required user fields
      if (!additionalData.phone || !additionalData.address) {
        return NextResponse.json(
          { message: "Phone and address are required." },
          { status: 400 }
        );
      }

      const user = await User.create({
        name,
        email,
        phone: additionalData.phone,
        address: additionalData.address,
        password: "", // No password for social login
      });

      return NextResponse.json({ 
        message: "User account created successfully.",
        userType: 'user',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          userType: 'user'
        }
      }, { status: 201 });
    }
  } catch (error) {
    console.error("Error completing Google signup:", error);
    return NextResponse.json(
      { message: "An error occurred while creating the account." },
      { status: 500 }
    );
  }
}