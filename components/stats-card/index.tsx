import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'hero';
  className?: string;
}

export default function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  variant = 'default',
  className = '',
}: StatsCardProps) {
  if (variant === 'hero') {
    return (
      <div
        className={`rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm ${className}`}
      >
        <div className="mb-2 text-3xl font-bold text-white">{value}</div>
        <div className="font-Inter text-white/80">{title}</div>
      </div>
    );
  }

  if (!Icon) {
    throw new Error('Icon is required for default variant');
  }

  return (
    <div className={`flex items-center justify-between rounded-xl bg-gray-50 p-4 ${className}`}>
      <div>
        <div className="font-Inter text-sm text-gray-600">{title}</div>
        <div className="text-green text-2xl font-bold">{value}</div>
        {description && <div className="font-Inter text-xs text-gray-500">{description}</div>}
      </div>
      <div className="bg-green/10 flex h-12 w-12 items-center justify-center rounded-full">
        <Icon className="text-green h-6 w-6" />
      </div>
    </div>
  );
}
