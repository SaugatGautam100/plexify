import { connectMongoDB } from "@/lib/mongodb";
import Seller from "@/models/seller";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongoDB();
    const { email } = await req.json();
    const seller = await Seller.findOne({ email }).select("_id");
    console.log("seller: ", seller);
    return NextResponse.json({ seller });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "An error occurred while checking seller." },
      { status: 500 }
    );
  }
}