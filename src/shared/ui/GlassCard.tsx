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
      className={`relative rounded-[2rem] border border-white/80 bg-white/80 shadow-petal ring-1 ring-white/60 sm:rounded-[2.5rem] sm:bg-white/65 sm:backdrop-blur-xl ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}
