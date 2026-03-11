import { BadgeCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VerifiedBadgeProps {
  passedCount: number;
  className?: string;
  size?: "sm" | "md";
}

export function VerifiedBadge({
  passedCount,
  className,
  size = "sm",
}: VerifiedBadgeProps) {
  if (passedCount <= 0) return null;

  const sizeClass = size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <BadgeCheck
            className={`text-blue-500 shrink-0 ${sizeClass} ${className ?? ""}`}
            aria-label={`Passed ${passedCount} AI assessment${passedCount !== 1 ? "s" : ""}`}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>Passed {passedCount} AI assessment{passedCount !== 1 ? "s" : ""}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
