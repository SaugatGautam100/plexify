'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from "next-auth/react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '../ui/toaster';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast({
          title: 'Error',
          description: 'Invalid Credentials.',
          variant: 'destructive',
        });
        return;
      }

      router.push("/seller/dashboard");
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers for social login buttons
  const handleGoogleLogin = () => {
    // Implement Google login logic here
    console.log("Continue with Google clicked");
    toast({
      title: 'Google Login',
      description: 'Google login functionality not yet implemented.',
      variant: 'default',
    });
  };

  const handleGithubLogin = () => {
    // Implement Github login logic here
    console.log("Continue with Github clicked");
    toast({
      title: 'Github Login',
      description: 'Github login functionality not yet implemented.',
      variant: 'default',
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        {/* Separator */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or login with
            </span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="flex flex-col space-y-2">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {/* Google Logo SVG */}
            <svg
              className="h-4 w-4"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M44.5 20H24V28.5H35.5C34.7 32.7 31.3 35.5 27 35.5C21.5 35.5 17 31 17 25.5C17 20 21.5 15.5 27 15.5C30.3 15.5 32.9 17.5 34.5 19.5L39.5 14.5C36.5 11.5 32 9.5 27 9.5C16.5 9.5 8 18 8 28.5C8 39 16.5 47.5 27 47.5C37.5 47.5 44 39 44 28.5C44 27.5 43.9 26.5 43.8 25.5H24V20H44.5Z"
                fill="#4285F4"
              />
              <path
                d="M8 28.5C8 31.5 9.2 34.2 11.2 36.2L17.5 30.5C16.2 29.5 15.5 27.5 15.5 25.5C15.5 23.5 16.2 21.5 17.5 20.5L11.2 14.8C9.2 16.8 8 19.5 8 22.5"
                fill="#FBBC05"
              />
              <path
                d="M27 9.5C30.3 9.5 32.9 10.9 34.5 12.5L39.5 7.5C36.5 4.5 32 2.5 27 2.5C16.5 2.5 8 11 8 21.5C8 22.5 8.1 23.5 8.2 24.5L14.5 20.5C13.2 19.5 12.5 17.5 12.5 15.5C12.5 13.5 13.2 11.5 14.5 10.5L20.8 4.8C18.8 2.8 16.1 1.5 13.5 1.5"
                fill="#EA4335"
              />
              <path
                d="M44 28.5C44 27.5 43.9 26.5 43.8 25.5L24 25.5V20H44.5L44.5 20Z"
                fill="#34A853"
              />
            </svg>
            Continue with Google
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGithubLogin}
            disabled={isLoading}
          >
            {/* GitHub Logo SVG */}
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 0C5.372 0 0 5.372 0 12c0 5.303 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.725-4.043-1.612-4.043-1.612-.546-1.387-1.332-1.758-1.332-1.758-1.09-.745.08-.73.08-.73 1.205.085 1.838 1.238 1.838 1.238 1.07 1.835 2.809 1.305 3.49.998.108-.775.417-1.305.76-1.605-2.665-.3-5.464-1.33-5.464-5.93 0-1.31.465-2.38 1.235-3.22-.12-.3-.535-1.52.115-3.175 0 0 1.005-.32 3.3 1.23.955-.265 1.96-.4 2.96-.4s2.005.135 2.96.4c2.295-1.55 3.3-1.23 3.3-1.23.65 1.655.23 2.875.115 3.175.77.84 1.235 1.91 1.235 3.22 0 4.61-2.8 5.62-5.475 5.92.42.36.81 1.096.81 2.215 0 1.606-.015 2.895-.015 3.28 0 .318.21.69.825.57C20.565 21.79 24 17.3 24 12c0-6.628-5.372-12-12-12z"
              />
            </svg>
            Continue with Github
          </Button>
        </div>
      </CardContent>
      <Toaster />
    </Card>
  );
}
