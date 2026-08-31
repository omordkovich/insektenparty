import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "outline-danger";
export type ButtonSize = "md" | "lg" | "icon";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-leaf text-white font-bold hover:bg-leaf-dark",
  secondary: "bg-honey text-on-honey font-bold hover:bg-honey-dark hover:text-white",
  outline: "border border-leaf/30 font-semibold hover:bg-leaf/10",
  danger: "bg-danger text-white font-bold hover:bg-[var(--danger-dark)]",
  "outline-danger": "border border-danger/30 bg-white text-danger hover:bg-red-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "min-h-11 rounded-xl px-4",
  lg: "min-h-12 rounded-2xl px-6 text-base",
  icon: "min-h-11 min-w-11 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", children, className = "", type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex items-center justify-center transition disabled:opacity-50 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
});
