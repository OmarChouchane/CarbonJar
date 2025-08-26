import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

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
  className = '',
}: ActionButtonProps) {
  const Component = href ? 'a' : 'button';
  const props = href ? { href } : { onClick };

  return (
    <Component
      {...props}
      className={`bg-green/5 hover:bg-green/10 border-green/20 flex w-full items-center justify-between rounded-xl border p-4 transition-colors ${className}`}
    >
      <div className="flex items-center space-x-3">
        <div className="bg-green/10 flex h-10 w-10 items-center justify-center rounded-full">
          <Icon className="text-green h-5 w-5" />
        </div>
        <div className="text-left">
          <div className="font-Inter font-medium text-gray-900">{title}</div>
          <div className="text-sm text-gray-600">{description}</div>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400" />
    </Component>
  );
}
