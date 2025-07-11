import { LucideIcon, ArrowRight, Clock, Users } from "lucide-react";

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
  className = "",
  duration = "4-6 weeks",
  level = "Intermediate",
  enrolled = 1247,
  tags = ["Leadership", "Sustainability"],
}: CourseRecommendationProps) {
  const handleClick = () => {
    if (href) {
      window.location.href = href;
    } else if (onExplore) {
      onExplore();
    }
  };

  return (
    <div className={`group relative ${className}`}>
      {/* Course Card */}
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-0 overflow-hidden border border-gray-100 group-hover:border-green/20">
        {/* Course Header with Gradient */}
        <div className="bg-gradient-to-tr from-green-500 to-green-800 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium border border-white/30">
                {level}
              </span>
            </div>

            <h3 className="text-xl font-bold mb-2 line-clamp-2 leading-tight font-Inter">
              {title}
            </h3>

            <div className="flex items-center space-x-4 text-white/80 text-sm">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {duration}
              </div>
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {enrolled.toLocaleString()} enrolled
              </div>
            </div>
          </div>
        </div>

        {/* Course Body */}
        <div className="p-6">
          {/* Description */}
          <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed font-Inter">
            {description}
          </p>

          {/* Skills Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  index === 0
                    ? "bg-green/10 text-green"
                    : index === 1
                    ? "bg-blue-50 text-blue-600"
                    : "bg-purple-50 text-purple-600"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={handleClick}
            className="w-full inline-flex items-center justify-center px-4 py-3 bg-green text-white rounded-xl hover:bg-green/90 transition-all duration-200 font-medium group-hover:shadow-lg font-Inter"
          >
            <span>Explore Course</span>
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
      </div>
    </div>
  );
}
