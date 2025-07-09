import { connectMongoDB } from "@/lib/mongodb";
import Seller from "@/models/seller";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, phone, businessName, businessAddress, password, description } = await req.json();
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return NextResponse.json(
        { message: "Seller with this email already exists." },
        { status: 400 }
      );
    }
    
    // Create new seller
    await Seller.create({ 
      name, 
      email, 
      phone, 
      businessName, 
      businessAddress, 
      password: hashedPassword,
      description: description || ''
    });

    return NextResponse.json({ message: "Seller registered successfully." }, { status: 201 });
  } catch (error) {
    console.error("Error registering seller:", error);
    return NextResponse.json(
      { message: "An error occurred while registering the seller." },
      { status: 500 }
    );
  }
}