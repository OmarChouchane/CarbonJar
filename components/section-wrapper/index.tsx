import type { ReactNode } from 'react';

interface SectionWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  variant?: 'default' | 'gradient' | 'green';
}

export default function SectionWrapper({
  children,
  title,
  subtitle,
  className = '',
  variant = 'default',
}: SectionWrapperProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return ' border border-green/20';
      case 'green':
        return 'bg-green border border-border-white';
      default:
        return 'bg-white border border-gray-100';
    }
  };

  const getTitleClasses = () => {
    switch (variant) {
      case 'green':
        return 'text-white';

      default:
        return 'text-green';
    }
  };

  return (
    <div className={`rounded-2xl p-6 shadow-lg ${getVariantClasses()} ${className}`}>
      {(title || subtitle) && (
        <div className={variant === 'gradient' ? 'mb-6 text-center' : 'mb-4'}>
          {title && (
            <h3 className={`font-Inter mb-2 text-xl font-bold ${getTitleClasses()}`}>{title}</h3>
          )}
          {subtitle && <p className="font-Inter text-gray-700">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
