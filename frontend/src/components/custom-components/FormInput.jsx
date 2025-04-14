import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

/**
 * FormInput - A reusable form input component
 * 
 * @param {Object} props
 * @param {string} props.name - The name of the input field
 * @param {string} props.label - The label for the input field
 * @param {string} props.type - The type of input (e.g., "text", "email", "password")
 * @param {string} props.placeholder - The placeholder text
 * @param {Object} props.field - The field object from React Hook Form (contains value, onChange, onBlur, etc.)
 * @param {string} props.className - Additional class names for the input
 * @param {Object} props.formItemProps - Additional props for the FormItem component
 * @param {string} props.labelClassName - Additional class names for the label
 * @param {boolean} props.hideLabel - Whether to visually hide the label (accessibility)
 * @param {boolean} props.required - Whether the field is required
 */
const FormInput = forwardRef(({
  name,
  label,
  type = "text",
  placeholder,
  field,
  className,
  formItemProps,
  labelClassName,
  hideLabel = false,
  required = false,
  error,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Determine the effective input type (for password toggling)
  const inputType = type === "password" 
    ? (showPassword ? "text" : "password") 
    : type;

  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    if (type === "password") {
      setShowPassword(!showPassword);
    }
  };

  return (
    <FormItem {...formItemProps}>
      {label && (
        <FormLabel 
          className={cn(
            hideLabel && "sr-only", 
            labelClassName
          )}
        >
          {label}{required && <span className="text-destructive ml-1">*</span>}
        </FormLabel>
      )}
        <div className="relative">
        <FormControl>
          <Input
            ref={ref}
            name={name || field?.name}
            placeholder={placeholder}
            type={inputType}
            value={field?.value}
            onChange={field?.onChange}
            onBlur={field?.onBlur}
            className={cn(
              "h-11",
              type === "password" && "pr-10", 
              className
            )}
            {...props}
          />
        </FormControl>
        
        {type === "password" && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={togglePasswordVisibility}
            tabIndex={-1} // So it doesn't interfere with tab navigation
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        )}
      </div>
      
      <FormMessage className="flex justify-start">
        {error && <span>{error}</span>}
      </FormMessage>
    </FormItem>
  );
});

FormInput.displayName = "FormInput";

export { FormInput };
