import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({
      message: "Logout successful"
    });

    // Clear the seller token cookie
    response.cookies.set('seller-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Error during seller logout:", error);
    return NextResponse.json(
      { message: "An error occurred during logout." },
      { status: 500 }
    );
  }
}