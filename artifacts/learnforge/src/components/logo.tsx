export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 52 34"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M22 6 40 13 22 20 4 13Z" fill="currentColor" />
      <circle cx="22" cy="12" r="1.5" fill="hsl(var(--accent))" />
      <path
        d="M10 16v7.5C10 23.5 15 28 22 28s12-4.5 12-4.5V16"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M40 13v12"
        stroke="hsl(var(--accent))"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="40" cy="27" r="2.4" fill="hsl(var(--accent))" />
      <path
        d="M46 4l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"
        fill="hsl(var(--accent))"
      />
    </svg>
  );
}
