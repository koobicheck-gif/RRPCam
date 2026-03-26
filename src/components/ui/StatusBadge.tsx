import { cn, STATUS_COLORS, STATUS_DOT_COLORS } from "@/lib/utils";
import { ProjectStatus } from "@/types";

interface StatusBadgeProps {
  status: ProjectStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border font-medium rounded-full",
        STATUS_COLORS[status],
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      )}
    >
      <span
        className={cn(
          "rounded-full shrink-0",
          STATUS_DOT_COLORS[status],
          size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2"
        )}
      />
      {status}
    </span>
  );
}
