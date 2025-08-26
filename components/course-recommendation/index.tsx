import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Clock, Users } from 'lucide-react';

interface CourseRecommendationProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onExplore?: () => void;
  href?: string;
  className?: string;
  duration?: string;
  level?: string;
  enrolled?: number;
  tags?: string[];
}

export default function CourseRecommendation({
  title,
  description,
  icon: Icon,
  onExplore,
  href,
  className = '',
  duration,
  level,
  enrolled,
  tags,
}: CourseRecommendationProps) {
  const handleClick = () => {
    if (href) {
      window.location.href = href;
    } else if (onExplore) {
      onExplore();
    }
  };

  return (
    <div className={`group relative h-full ${className}`}>
      {/* Course Card */}
      <div className="group-hover:border-green/20 flex h-[420px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-0 shadow-lg transition-all duration-300 hover:shadow-2xl">
        {/* Course Header with Gradient */}
        <div className="relative h-50 overflow-hidden bg-gradient-to-tr from-green-500 to-green-800 p-6 pt-2 text-white">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-white/10"></div>
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-24 w-24 rounded-full bg-white/5"></div>

          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
                <Icon className="h-6 w-6 text-white" />
              </div>
              {level ? (
                <span className="rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  {level}
                </span>
              ) : null}
            </div>

            <h3 className="font-Inter line-clamp-2 pt-2 text-2xl leading-tight font-bold">
              {title}
            </h3>

            <div className="mt-5 flex w-full items-center justify-between text-sm text-white/80">
              {duration ? (
                <div className="flex items-center text-left">
                  <Clock className="mr-1 h-3 w-3" />
                  {duration}
                </div>
              ) : null}
              {typeof enrolled === 'number' ? (
                <div className="ml-auto flex items-center text-right">
                  <Users className="mr-1 h-3 w-3" />
                  {enrolled.toLocaleString()} enrolled
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Course Body */}
        <div className="flex flex-1 flex-col p-6">
          {/* Description */}
          <p className="font-Inter mb-6 line-clamp-3 text-sm leading-relaxed text-gray-600">
            {description}
          </p>

          {/* Skills Tags */}
          {tags && tags.length > 0 ? (
            <div className="mb-6 flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    index === 0
                      ? 'bg-green/10 text-green'
                      : index === 1
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-purple-50 text-purple-600'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {/* Action Button */}
          <button
            onClick={handleClick}
            className="bg-green hover:bg-green/90 font-Inter mt-auto inline-flex w-full items-center justify-center rounded-xl px-4 py-3 font-medium text-white transition-all duration-200 group-hover:shadow-lg"
          >
            <span>Explore Course</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Hover Effect Overlay */}
        <div className="from-green/5 pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
      </div>
    </div>
  );
}
