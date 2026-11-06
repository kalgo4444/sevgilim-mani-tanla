import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type GlassCardProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function GlassCard<T extends ElementType = "div">({
  as,
  children,
  className = "",
  ...rest
}: GlassCardProps<T>) {
  const Component: ElementType = as ?? "div";
  return (
    <Component
      className={`relative rounded-[2rem] sm:rounded-[2.5rem] border border-white/80 bg-white/65 shadow-petal backdrop-blur-2xl ring-1 ring-white/60 transition-shadow ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}
