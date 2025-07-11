'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toaster } from '../ui/toaster';
import { signIn } from "next-auth/react";

const registerSchema = z.object({
  name: z.string()
    .min(1, "Full Name is required")
    .min(4, "Name must be at least 4 characters")
    .max(20, "Name must be at most 20 characters"),
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  phone: z.string()
    .min(10, "Phone number of 10 characters is required")
    .max(10, "Phone must be 10 characters")
    .regex(/^\+?[0-9]{7,15}$/, "Invalid phone number format"),
  businessName: z.string()
    .min(1, "Business Name is required")
    .min(2, "Business Name must be at least 2 characters")
    .max(50, "Business Name must be at most 50 characters"),
  businessAddress: z.string()
    .min(1, "Business Address is required")
    .min(5, "Business Address must be at least 5 characters"),
  description: z.string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
  password: z.string()
    .min(1, "Password is required")
    .min(4, "Password must be at least 4 characters")
    .max(20, "Password must be at most 20 characters"),
  confirmPassword: z.string()
    .min(1, "Confirm Password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export default function SellerRegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      businessName: "",
      businessAddress: "",
      description: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    setIsLoading(true);

    try {
      const resSellerExists = await fetch("/api/seller/exists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const { seller } = await resSellerExists.json();

      if (seller) {
        toast({
          title: 'Error',
          description: 'Seller with this email already exists.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const res = await fetch("/api/seller/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          businessName: data.businessName,
          businessAddress: data.businessAddress,
          description: data.description,
          password: data.password,
        }),
      });

      if (res.ok) {
        toast({
          title: 'Success!',
          description: 'Seller account created successfully. Please log in.',
          variant: 'default',
        });
        reset();
        router.replace("/seller/login");
      } else {
        const errorData = await res.json().catch(() => ({ message: 'Server error' }));
        toast({
          title: 'Registration Failed',
          description: errorData.message || 'Something went wrong during registration.',
          variant: 'destructive',
        });
        console.error("Seller registration failed:", errorData);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      console.error("Error during registration: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (errors: any) => {
    console.error("Form validation errors:", errors);

    const errorMessages: string[] = [];
    if (errors.name) errorMessages.push(errors.name.message);
    if (errors.email) errorMessages.push(errors.email.message);
    if (errors.phone) errorMessages.push(errors.phone.message);
    if (errors.businessName) errorMessages.push(errors.businessName.message);
    if (errors.businessAddress) errorMessages.push(errors.businessAddress.message);
    if (errors.description) errorMessages.push(errors.description.message);
    if (errors.password) errorMessages.push(errors.password.message);
    if (errors.confirmPassword) errorMessages.push(errors.confirmPassword.message);

    if (errorMessages.length > 0) {
      toast({
        title: 'Validation Error',
        description: errorMessages.join('\n'),
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please check all form fields for errors.',
        variant: 'destructive',
      });
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/seller/dashboard" });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Google signup failed. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("github", { callbackUrl: "/seller/dashboard" });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'GitHub signup failed. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Register as Seller</CardTitle>
        <CardDescription>
          Create a seller account to start selling on our platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seller@business.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="98XXXXXXXX"
              {...register("phone")}
              pattern="[0-9]*"
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/[^0-9+]/g, '');
              }}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              type="text"
              placeholder="Your Business Name"
              {...register("businessName")}
            />
            {errors.businessName && (
              <p className="text-red-500 text-sm">{errors.businessName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessAddress">Business Address</Label>
            <Textarea
              id="businessAddress"
              placeholder="Street, City, State, Country"
              {...register("businessAddress")}
              rows={3}
            />
            {errors.businessAddress && (
              <p className="text-red-500 text-sm">{errors.businessAddress.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Business Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Tell us about your business..."
              {...register("description")}
              rows={3}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
            {isLoading || isSubmitting ? 'Creating Seller Account...' : 'Register as Seller'}
          </Button>
        </form>

        {/* Separator */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="flex flex-col space-y-2">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
            disabled={isLoading || isSubmitting}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGithubLogin}
            disabled={isLoading || isSubmitting}
          >
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
            Continue with GitHub
          </Button>
        </div>
      </CardContent>
      <Toaster />
    </Card>
  );
}