import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  variant?: "default" | "hero";
  className?: string;
}

export default function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  variant = "default",
  className = "",
}: StatsCardProps) {
  if (variant === "hero") {
    return (
      <div
        className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 ${className}`}
      >
        <div className="text-3xl font-bold text-white mb-2">{value}</div>
        <div className="text-white/80 font-Inter">{title}</div>
      </div>
    );
  }

  if (!Icon) {
    throw new Error("Icon is required for default variant");
  }

  return (
    <div
      className={`flex items-center justify-between p-4 bg-gray-50 rounded-xl ${className}`}
    >
      <div>
        <div className="text-sm text-gray-600 font-Inter">{title}</div>
        <div className="text-2xl font-bold text-green">{value}</div>
        {description && (
          <div className="text-xs text-gray-500 font-Inter">{description}</div>
        )}
      </div>
      <div className="w-12 h-12 bg-green/10 rounded-full flex items-center justify-center">
        <Icon className="w-6 h-6 text-green" />
      </div>
    </div>
  );
}
