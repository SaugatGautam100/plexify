'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context'; // Keep if used elsewhere, but not directly for registration below
import { useToast } from '@/hooks/use-toast';
import { useForm } from "react-hook-form";
import { z } from "zod"; // For Zod validation
import { zodResolver } from "@hookform/resolvers/zod"; // For integrating Zod with react-hook-form
import { Toaster } from '../ui/toaster';
// Removed Chrome and Github imports from lucide-react as we'll use custom SVGs

// 1. Define your Zod schema for validation, including new fields for phone and address
const registerSchema = z.object({
  name: z.string()
    .min(1, "Full Name is required")
    .min(4, "Name must be at least 4 characters")
    .max(20, "Name must be at most 20 characters"),
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  phone: z.string()
    .min(10, "Phone number is required")
    .max(10, "Phone must be at most 10 characters")
    .regex(/^\+?[0-9]{7,15}$/, "Invalid phone number format"), // Basic phone number regex
  address: z.string()
    .min(1, "Address is required")
    .min(5, "Address must be at least 5 characters"),
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
    reset,        // Import reset function from react-hook-form
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    // Set default values if needed, otherwise form inputs will start empty
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
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
          phone: data.phone, // Include phone
          address: data.address, // Include address
          password: data.password,
        }),
      });

      if (res.ok) {
        toast({
          title: 'Success!',
          description: 'Account created successfully. Please log in.',
          variant: 'default', // Or 'success' if you have one
        });
        reset(); // Clear the form fields after successful submission
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
    if (errors.phone) errorMessages.push(errors.phone.message); // Add phone error
    if (errors.address) errorMessages.push(errors.address.message); // Add address error
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
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel" // Use type="tel" for phone numbers
              placeholder="98XXXXXXXX"
              {...register("phone")} // Register the new phone field
              // Add pattern for client-side validation and onInput for real-time filtering
              pattern="[0-9]*" // Allows only digits
              onInput={(e) => {
                // This will strip non-numeric characters as they are typed
                e.currentTarget.value = e.currentTarget.value.replace(/[^0-9+]/g, '');
              }}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              type="text"
              placeholder="tol, street, city, state, country"
              {...register("address")} // Register the new address field
            />
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address.message}</p>
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
            disabled={isLoading || isSubmitting}
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
