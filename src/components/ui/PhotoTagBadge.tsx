import { cn, TAG_COLORS } from "@/lib/utils";
import { PhotoTag } from "@/types";

interface PhotoTagBadgeProps {
  tag: PhotoTag;
  size?: "sm" | "md";
}

export function PhotoTagBadge({ tag, size = "sm" }: PhotoTagBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border font-medium rounded-md",
        TAG_COLORS[tag],
        size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      )}
    >
      {tag}
    </span>
  );
}
