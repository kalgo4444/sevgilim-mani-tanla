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
      className={`relative rounded-[2rem] border border-white/70 bg-white/55 shadow-petal backdrop-blur-xl ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}
