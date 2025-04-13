import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormField } from "@/components/ui/form";
import { FormInput } from "@/components/custom-components/FormInput";
import CustomButton from "../CustomButton";
import { Link } from "react-router-dom";

// Define the form schema with Zod for validation
const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Must be a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Initialize the form with React Hook Form and Zod validation
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Form submission handler
  async function onSubmit(values) {
    setIsLoading(true);
    
    try {
      // Here you would typically call your API to authenticate the user
      console.log("Form values:", values);
      
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to dashboard or home page after successful login
      // window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">        <FormField
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
              placeholder="Enter your password"
              field={field}
              required
            />
          )}
        />

        <div className="flex justify-end">
          <a
            href="#"
            className="text-sm font-medium text-primary hover:text-primary/90 transition-colors"
          >
            Forgot password?
          </a>
        </div>        <CustomButton
          type="submit"
          variant="gradient"
          size="lg"
          rounded="xl"
          fullWidth
          isLoading={isLoading}
          loadingText="Signing in..."
        >
          Sign in
        </CustomButton>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-primary hover:text-primary/90 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
}
