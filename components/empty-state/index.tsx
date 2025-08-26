import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  actionText,
  actionHref,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        {icon || <GraduationCap className="text-green mx-auto mb-6 h-24 w-24" />}
        <h3 className="text-green font-Inter mb-3 text-2xl font-semibold">{title}</h3>
        <p className="text-green/70 font-Inter mb-6">{description}</p>
        {actionText && actionHref && (
          <Link
            href={actionHref}
            className="bg-green hover:bg-green/90 font-Inter inline-flex items-center rounded-lg px-6 py-3 font-medium text-white transition-colors"
          >
            {actionText}
          </Link>
        )}
      </div>
    </div>
  );
}
