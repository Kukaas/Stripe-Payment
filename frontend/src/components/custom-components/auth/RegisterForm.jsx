import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormField } from "@/components/ui/form";
import { FormInput } from "@/components/custom-components/FormInput";
import CustomButton from "@/components/custom-components/CustomButton";
import { Link } from "react-router-dom";

// Define the form schema with Zod for validation
const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Must be a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z
    .string()
    .min(1, { message: "Please confirm your password" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the form with React Hook Form and Zod validation
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Form submission handler
  async function onSubmit(values) {
    setIsLoading(true);
    
    try {
      // Here you would typically call your API to register the user
      console.log("Form values:", values);
      
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to login page after successful registration
      // window.location.href = "/login";
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormInput
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              field={field}
              required
            />
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormInput
              label="Email"
              type="email"
              placeholder="Enter your email"
              field={field}
              required
            />
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormInput
              label="Password"
              type="password"
              placeholder="Create a password"
              field={field}
              required
            />
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormInput
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              field={field}
              required
            />
          )}
        />

        <div className="pt-2">
          <CustomButton
            type="submit"
            variant="gradient"
            size="lg"
            rounded="xl"
            fullWidth
            isLoading={isLoading}
            loadingText="Creating Account..."
          >
            Create Account
          </CustomButton>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary/90 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
}
