import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

function FormField({
  ...props
}) {
  return (
    <Controller {...props} />
  )
}

function FormItem({
  className,
  ...props
}) {
  return (
    <div data-slot="form-item" className={cn("space-y-2", className)} {...props} />
  )
}

function FormLabel({
  className,
  ...props
}) {
  return (
    <Label
      data-slot="form-label"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function FormControl({
  ...props
}) {
  return (
    <Slot data-slot="form-control" {...props} />
  )
}

function FormDescription({
  className,
  ...props
}) {
  return (
    <p
      data-slot="form-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function FormMessage({
  className,
  children,
  ...props
}) {
  const { error } = useFormContext()
  
  // Get all errors from the form
  const message = error?.message

  if (!message && !children) {
    return null
  }

  return (
    <p
      data-slot="form-message"
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {children || message}
    </p>
  )
}

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
}
