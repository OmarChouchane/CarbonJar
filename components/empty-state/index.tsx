import { GraduationCap } from "lucide-react";
import Link from "next/link";

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
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md mx-auto">
        {icon || (
          <GraduationCap className="h-24 w-24 mx-auto mb-6 text-green" />
        )}
        <h3 className="text-2xl font-semibold text-green mb-3 font-Inter">
          {title}
        </h3>
        <p className="text-green/70 mb-6 font-Inter">{description}</p>
        {actionText && actionHref && (
          <Link
            href={actionHref}
            className="inline-flex items-center px-6 py-3 bg-green text-white rounded-lg hover:bg-green/90 transition-colors font-medium font-Inter"
          >
            {actionText}
          </Link>
        )}
      </div>
    </div>
  );
}
