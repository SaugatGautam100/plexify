import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function getSellerFromToken() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('seller-token');

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token.value, process.env.NEXTAUTH_SECRET || 'fallback-secret');
    
    if (decoded.type !== 'seller') {
      return null;
    }

    return {
      sellerId: decoded.sellerId,
      email: decoded.email,
    };
  } catch (error) {
    console.error('Error verifying seller token:', error);
    return null;
  }
}

export function createSellerToken(sellerId, email) {
  return jwt.sign(
    { 
      sellerId,
      email,
      type: 'seller'
    },
    process.env.NEXTAUTH_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
}