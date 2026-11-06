interface HeartShapeProps {
  className?: string;
  filled?: boolean;
}

/** Decorative heart. Always aria-hidden. */
export function HeartShape({ className, filled = true }: HeartShapeProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 20.6s-7.4-4.5-9.6-9.1C.8 8.2 2.6 4.4 6.2 4c2.1-.2 4 .8 5.8 2.9C13.8 4.8 15.7 3.8 17.8 4c3.6.4 5.4 4.2 3.8 7.5-2.2 4.6-9.6 9.1-9.6 9.1Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.4}
        strokeLinejoin="round"
      />
    </svg>
  );
}
