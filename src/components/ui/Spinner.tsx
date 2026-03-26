import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: "white" | "navy" | "red" | "gray";
}

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-2",
};

const colorClasses = {
  white: "border-white/30 border-t-white",
  navy: "border-navy-200 border-t-navy-700",
  red: "border-red-200 border-t-brand-red",
  gray: "border-gray-200 border-t-gray-500",
};

export function Spinner({
  size = "md",
  className,
  color = "navy",
}: SpinnerProps) {
  return (
    <div
      className={cn(
        "rounded-full animate-spin",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <Spinner size="lg" color="navy" />
      <p className="text-sm text-gray-400">Loading...</p>
    </div>
  );
}
