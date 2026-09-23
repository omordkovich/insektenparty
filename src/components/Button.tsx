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

// Hover darkens the base color via a brightness filter rather than
// swapping to the "-dark" CSS variable: that variable also serves as the
// heading/text color for the same hue (text-leaf-dark, text-honey-dark),
// which needs to go the *other* direction in a dark theme (lighter, not
// darker, for contrast against a black page) - a filter works either way.
const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-button-primary text-button-primary-text font-bold hover:brightness-90",
  secondary: "bg-button-secondary text-button-secondary-text font-bold hover:brightness-90",
  outline: "border border-leaf/30 font-semibold hover:bg-leaf/10",
  danger: "bg-danger text-white font-bold hover:bg-[var(--danger-dark)]",
  "outline-danger": "border border-danger/30 bg-surface text-danger hover:bg-danger/10",
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
