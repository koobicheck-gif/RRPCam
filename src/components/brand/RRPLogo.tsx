import { cn } from "@/lib/utils";

interface RRPLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  dark?: boolean;
}

export function RRPLogo({ size = "md", className, dark = false }: RRPLogoProps) {
  const sizes = {
    sm: { icon: "w-7 h-7", text: "text-base", sub: "text-[9px]" },
    md: { icon: "w-9 h-9", text: "text-xl", sub: "text-[10px]" },
    lg: { icon: "w-14 h-14", text: "text-3xl", sub: "text-sm" },
  };

  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Icon mark */}
      <div
        className={cn(
          s.icon,
          "rounded-lg flex items-center justify-center shrink-0",
          dark ? "bg-navy-700" : "bg-brand-red"
        )}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="w-4/5 h-4/5"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Roof silhouette */}
          <path
            d="M4 18L16 6L28 18H4Z"
            fill="white"
            fillOpacity="0.95"
          />
          <path
            d="M8 18V26H24V18"
            stroke="white"
            strokeWidth="2"
            strokeOpacity="0.7"
            fill="none"
          />
          {/* Camera lens */}
          <circle cx="16" cy="20" r="3.5" fill="white" fillOpacity="0.3" />
          <circle cx="16" cy="20" r="2" fill="white" fillOpacity="0.8" />
        </svg>
      </div>

      {/* Text */}
      <div className="leading-none">
        <div
          className={cn(
            s.text,
            "font-extrabold tracking-tight",
            dark ? "text-navy-700" : "text-white"
          )}
        >
          RRP
          <span className={dark ? "text-brand-red" : "text-red-300"}> Field</span>
        </div>
        <div
          className={cn(
            s.sub,
            "font-semibold tracking-widest uppercase mt-0.5",
            dark ? "text-gray-500" : "text-white/60"
          )}
        >
          Docs · Roof Repair Partners
        </div>
      </div>
    </div>
  );
}
