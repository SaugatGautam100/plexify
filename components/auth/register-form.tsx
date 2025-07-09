'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context'; // Keep if used elsewhere, but not directly for registration below
import { useToast } from '@/hooks/use-toast';
// REMOVE THIS LINE: Toaster should be in your root layout (app/layout.tsx or pages/_app.tsx)
// import { Toaster } from '../ui/toaster';
import { useForm } from "react-hook-form";
import { z } from "zod"; // For Zod validation
import { zodResolver } from "@hookform/resolvers/zod"; // For integrating Zod with react-hook-form
import { Toaster } from '../ui/toaster';

// 1. Define your Zod schema for validation
const registerSchema = z.object({
  name: z.string()
    .min(1, "Full Name is required")
    .min(4, "Name must be at least 4 characters")
    .max(20, "Name must be at most 20 characters"),
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z.string()
    .min(1, "Password is required")
    .min(4, "Password must be at least 4 characters")
    .max(20, "Password must be at most 20 characters"),
  confirmPassword: z.string()
    .min(1, "Confirm Password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], // This attaches the error to the confirmPassword field
});

// Infer the type of your form inputs from the schema
type RegisterFormInputs = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { login } = useAuth(); // Assuming this context is still relevant elsewhere

  // 2. Integrate react-hook-form with Zod resolver and specify the type
  const {
    register,
    handleSubmit, // Use handleSubmit from react-hook-form
    setError,     // Useful for setting server-side errors
    formState: { errors, isSubmitting },
    // Removed default `useState` for individual form fields as react-hook-form manages them
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    // Set default values if needed, otherwise form inputs will start empty
    defaultValues: {
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    }
  });

  // 3. Define the submission handler for valid form data
  const onSubmit = async (data: RegisterFormInputs) => {
    setIsLoading(true);

    try {
      // Check if user exists
      const resUserExists = await fetch("/api/userExists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }), // Use data.email from react-hook-form
      });

      const { user } = await resUserExists.json();

      if (user) {
        toast({
          title: 'Error',
          description: 'User with this email already exists.',
          variant: 'destructive',
        });
        setIsLoading(false); // Reset loading state on early exit
        return;
      }

      // Proceed with registration
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      if (res.ok) {
        toast({
          title: 'Success!',
          description: 'Account created successfully. Please log in.',
          variant: 'default', // Or 'success' if you have one
        });
        router.replace("/login"); // Redirect to login page
      } else {
        // Handle API errors that are not validation related (e.g., server failure)
        // Attempt to parse a message from the API response
        const errorData = await res.json().catch(() => ({ message: 'Server error' }));
        toast({
          title: 'Registration Failed',
          description: errorData.message || 'Something went wrong during registration.',
          variant: 'destructive',
        });
        console.error("User registration failed:", errorData);
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

  // 4. Define the error handler for invalid form submissions (client-side validation errors)
  const onError = (errors: any) => { // 'any' here is a quick fix, you can refine this type
    console.error("Form validation errors:", errors);

    // Collect all error messages to display in one toast, or just the first one
    const errorMessages: string[] = [];
    if (errors.name) errorMessages.push(errors.name.message);
    if (errors.email) errorMessages.push(errors.email.message);
    if (errors.password) errorMessages.push(errors.password.message);
    if (errors.confirmPassword) errorMessages.push(errors.confirmPassword.message);

    if (errorMessages.length > 0) {
      toast({
        title: 'Validation Error',
        // Join messages with a line break or just display the first one
        description: errorMessages.join('\n'),
        variant: 'destructive',
      });
    } else {
        // Fallback for unexpected error structure or no message provided
        toast({
            title: 'Validation Error',
            description: 'Please check all form fields for errors.',
            variant: 'destructive',
        });
    }
  };


  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>
          Create a new account to start shopping
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 5. Attach handleSubmit to the form, passing both success and error handlers */}
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              // 6. Register inputs with react-hook-form
              {...register("name")} // This connects the input to the 'name' field in your schema
              // Removed value and onChange, react-hook-form handles input state
            />
            {/* Correctly access and display the error message */}
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register("email")} // This connects the input to the 'email' field in your schema
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password")} // This connects the input to the 'password' field in your schema
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
              {...register("confirmPassword")} // This connects the input to the 'confirmPassword' field in your schema
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
            {isLoading || isSubmitting ? 'Creating Account...' : 'Register'}
          </Button>
        </form>
      </CardContent>
      <Toaster />
    </Card>
  );
}