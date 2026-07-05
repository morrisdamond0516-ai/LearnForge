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
      <defs>
        <linearGradient id="cap-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(280 60% 62%)" />
          <stop offset="50%" stopColor="hsl(216 55% 65%)" />
          <stop offset="100%" stopColor="hsl(152 55% 48%)" />
        </linearGradient>
      </defs>
      {/* Mortarboard top — purple → green gradient */}
      <path d="M22 6 40 13 22 20 4 13Z" fill="url(#cap-gradient)" />
      <circle cx="22" cy="12" r="1.5" fill="hsl(var(--accent))" />
      {/* Hood/gown arc */}
      <path
        d="M10 16v7.5C10 23.5 15 28 22 28s12-4.5 12-4.5V16"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tassel stem */}
      <path
        d="M40 13v12"
        stroke="hsl(152 55% 48%)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Tassel ball */}
      <circle cx="40" cy="27" r="2.4" fill="hsl(152 55% 48%)" />
      {/* Sparkle */}
      <path
        d="M46 4l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"
        fill="hsl(var(--accent))"
      />
    </svg>
  );
}
