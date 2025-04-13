import React from "react";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Define button variants using class-variance-authority
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-300/30",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-8 px-2 text-xs",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-8 py-6 text-base",
        icon: "h-10 w-10",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        lg: "rounded-lg",
        xl: "rounded-xl",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
      fullWidth: false,
    },
  }
);

/**
 * Enhanced Button component based on ShadcN UI Button
 * 
 * @param {Object} props
 * @param {string} props.variant - Button style variant
 * @param {string} props.size - Button size
 * @param {string} props.rounded - Border radius style
 * @param {boolean} props.fullWidth - Whether button takes full width
 * @param {boolean} props.isLoading - Whether to show loading spinner
 * @param {React.ReactNode} props.loadingText - Text to show when loading
 * @param {React.ReactNode} props.leftIcon - Icon to show on left side
 * @param {React.ReactNode} props.rightIcon - Icon to show on right side
 * @param {string} props.className - Additional CSS classes
 */
const CustomButton = React.forwardRef(({
  className,
  variant,
  size,
  rounded,
  fullWidth,
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  children,
  ...props
}, ref) => {
  return (
    <ShadcnButton
      ref={ref}
      className={cn(
        buttonVariants({
          variant,
          size,
          rounded,
          fullWidth,
          className,
        })
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <Loader2 className={cn("h-4 w-4 animate-spin", loadingText && "mr-2")} />
      )}
      {!isLoading && leftIcon && (
        <span className={cn("mr-2")}>{leftIcon}</span>
      )}
      {isLoading && loadingText ? loadingText : children}
      {!isLoading && rightIcon && (
        <span className={cn("ml-2")}>{rightIcon}</span>
      )}
    </ShadcnButton>
  );
});

CustomButton.displayName = "CustomButton";

export { CustomButton, buttonVariants };
export default CustomButton;
