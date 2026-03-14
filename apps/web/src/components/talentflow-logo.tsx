import { cn } from "@/lib/utils";

interface TalentflowLogoProps {
  className?: string;
  size?: number;
  variant?: "icon" | "full";
}

/** Hexagon "T" mark — icon only */
function LogoIcon({
  size = 32,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M36 4 L64.8 20.5 L64.8 51.5 L36 68 L7.2 51.5 L7.2 20.5 Z"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
      />
      <path
        d="M36 14 L56.5 25.75 L56.5 46.25 L36 58 L15.5 46.25 L15.5 25.75 Z"
        fill="none"
        stroke={color}
        strokeWidth="0.8"
        opacity="0.18"
      />
      <line
        x1="22"
        y1="28"
        x2="50"
        y2="28"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="square"
      />
      <line
        x1="36"
        y1="28"
        x2="36"
        y2="51"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="square"
      />
      <circle cx="52" cy="50" r="2.5" fill={color} opacity="0.3" />
    </svg>
  );
}

export function TalentflowLogo({
  className,
  size = 32,
  variant = "full",
}: TalentflowLogoProps) {
  const color = "currentColor";

  if (variant === "icon") {
    return (
      <span className={cn("inline-flex items-center", className)}>
        <LogoIcon size={size} color={color} />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoIcon size={size} color={color} />
      <span
        className="font-bold tracking-tight"
        style={{
          fontSize: size * 0.6,
          color,
          fontFamily: "var(--font-geist-sans), sans-serif",
        }}
      >
        Talentflow
      </span>
    </span>
  );
}
