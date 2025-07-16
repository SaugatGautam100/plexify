'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LoginForm from '@/components/auth/login-form';
import { useFirebaseAuth } from '@/components/auth/firebase-auth-context';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useFirebaseAuth();
  const returnUrl = searchParams.get('returnUrl');

  useEffect(() => {
    if (!loading && user) {
      // If user is already logged in, redirect them
      const redirectUrl = returnUrl || '/';
      router.push(redirectUrl);
    }
  }, [user, loading, router, returnUrl]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome to Plexify</h1>
          <p className="text-gray-600 mt-2">Sign in with your phone number</p>
          {returnUrl && (
            <p className="text-sm text-blue-600 mt-2">
              Please login to continue
            </p>
          )}
        </div>

        <LoginForm />

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}