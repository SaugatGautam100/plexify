import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import Seller from "@/models/seller";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, name, userType, additionalData } = await req.json();

    await connectMongoDB();

    if (userType === 'seller') {
      // Create seller account
      const existingSeller = await Seller.findOne({ email });
      if (existingSeller) {
        return NextResponse.json(
          { message: "Seller with this email already exists." },
          { status: 400 }
        );
      }

      await Seller.create({
        name,
        email,
        phone: additionalData.phone || "",
        businessName: additionalData.businessName || "",
        businessAddress: additionalData.businessAddress || "",
        description: additionalData.description || "",
        password: "", // No password for social login
      });

      return NextResponse.json({ message: "Seller account created successfully." }, { status: 201 });
    } else {
      // Create user account
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { message: "User with this email already exists." },
          { status: 400 }
        );
      }

      await User.create({
        name,
        email,
        phone: additionalData.phone || "",
        address: additionalData.address || "",
        password: "", // No password for social login
      });

      return NextResponse.json({ message: "User account created successfully." }, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating social account:", error);
    return NextResponse.json(
      { message: "An error occurred while creating the account." },
      { status: 500 }
    );
  }
}