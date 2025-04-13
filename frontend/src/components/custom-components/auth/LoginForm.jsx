import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormField } from "@/components/ui/form";
import { FormInput } from "@/components/custom-components/FormInput";
import CustomButton from "../CustomButton";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "@/lib/hooks/api/authApi";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/AuthContext";

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
    const {setUser} = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

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
            const { email, password } = values;

            if (!email || !password) {
                toast.error("Please fill in all fields.");
                return;
            }

            const res = await loginUser(email, password);

            if(res.status === 200) {
              navigate("/dashboard");
              setUser(res.data.user);
              toast.success("Login successful!");
            }
        } catch (error) {
            console.error("Login failed:", error);
            if (error.response && error.response.status === 401) {
                toast.error("Invalid email or password.");
            } else {
                toast.error("An unexpected error occurred. Please try again later.");
            }
        } finally {
            setIsLoading(false);
        }
    }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">        
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
        </div>        
        <CustomButton
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
