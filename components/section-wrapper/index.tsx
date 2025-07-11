import { ReactNode } from "react";

interface SectionWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  variant?: "default" | "gradient" | "green";
}

export default function SectionWrapper({
  children,
  title,
  subtitle,
  className = "",
  variant = "default",
}: SectionWrapperProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "gradient":
        return " border border-green/20";
      case "green":
        return "bg-green border border-border-white";
      default:
        return "bg-white border border-gray-100";
    }
  };

  const getTitleClasses = () => {
    switch (variant) {
      case "green":
        return "text-white";
    
      default:
        return "text-green";
    }
  };

  return (
    <div
      className={`rounded-2xl shadow-lg p-6 ${getVariantClasses()} ${className}`}
    >
      {(title || subtitle) && (
        <div className={variant === "gradient" ? "text-center mb-6" : "mb-4"}>
          {title && (
            <h3
              className={`text-xl font-bold mb-2 font-Inter ${getTitleClasses()}`}
            >
              {title}
            </h3>
          )}
          {subtitle && <p className="text-gray-700 font-Inter">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
