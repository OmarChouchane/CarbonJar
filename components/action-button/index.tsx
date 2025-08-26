import type { LucideIcon} from "lucide-react";
import { ChevronRight } from "lucide-react";

interface ActionButtonProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export default function ActionButton({
  title,
  description,
  icon: Icon,
  onClick,
  href,
  className = "",
}: ActionButtonProps) {
  const Component = href ? "a" : "button";
  const props = href ? { href } : { onClick };

  return (
    <Component
      {...props}
      className={`w-full flex items-center justify-between p-4 bg-green/5 hover:bg-green/10 rounded-xl transition-colors border border-green/20 ${className}`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-green/10 rounded-full flex items-center justify-center">
          <Icon className="w-5 h-5 text-green" />
        </div>
        <div className="text-left">
          <div className="font-medium text-gray-900 font-Inter">{title}</div>
          <div className="text-sm text-gray-600">{description}</div>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </Component>
  );
}
