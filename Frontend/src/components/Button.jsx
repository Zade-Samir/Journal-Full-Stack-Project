import React from "react";
import { cn } from "../utils/cn";

export function Button({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2";
  
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-hover shadow-sm",
    secondary: "bg-input-bg text-text-primary border border-border/50 hover:border-brand/40 hover:text-brand",
    ghost: "bg-transparent text-text-secondary hover:bg-input-bg hover:text-text-primary",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    icon: "p-2",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
