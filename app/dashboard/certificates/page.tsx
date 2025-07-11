"use client";

import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import CertificateCard from "@/components/certificate-card";
import EmptyState from "@/components/empty-state";
import LoadingState from "@/components/loading-state";
import ErrorState from "@/components/error-state";
import StatsCard from "@/components/stats-card";
import ActionButton from "@/components/action-button";
import CourseRecommendation from "@/components/course-recommendation";
import SectionWrapper from "@/components/section-wrapper";
import { SmallerH1, H2 } from "@/components/Heading";
import { useCertificates } from "@/hooks/useCertificates";
import {
  COURSE_RECOMMENDATIONS,
  QUICK_ACTIONS,
} from "@/constants/certificatesData";
import { calculateStats } from "@/utils/certificateUtils";
import {
  Award,
  Clock,
  Calendar,
  BookOpen,
  Download,
  Share2,
} from "lucide-react";

export default function CertificatesDashboard() {
  const {
    certificates,
    loading,
    error,
    refetchCertificates,
    generateTestData,
  } = useCertificates();
  const stats = calculateStats(certificates);

  if (loading) {
    return (
      <div className="min-h-screen bg-white-light">
        <Navigation />
        <LoadingState message="Loading certificates..." />
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white-light">
        <Navigation />
        <ErrorState error={error} onRetry={refetchCertificates} />
        <Footer />
      </div>
    );
  }

  const getQuickActionIcon = (actionId: string) => {
    switch (actionId) {
      case "browse-courses":
        return BookOpen;
      case "download-certificates":
        return Download;
      case "share-portfolio":
        return Share2;
      default:
        return BookOpen;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      <Navigation />
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green to-green/80 text-white py-16 mb-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <SmallerH1 className="text-white mb-4">My Certificates</SmallerH1>
              <H2 className="text-white/90 mb-6">
                Showcase Your Professional Achievements
              </H2>
              <p className="text-white/80 text-sm max-w-2xl mx-auto font-Inter">
                Your earned certificates demonstrate your commitment to
                sustainable practices and environmental leadership. Share your
                achievements and continue growing your expertise.
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                <StatsCard
                  title="Certificates Earned"
                  value={stats.totalCertificates}
                  variant="hero"
                />
                <StatsCard
                  title="Skills Mastered"
                  value={stats.skillsMastered}
                  variant="hero"
                />
                <StatsCard
                  title="Completion Rate"
                  value={stats.completionRate}
                  variant="hero"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16">
          {/* Filter & Action Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center space-x-4">
              <h3 className="text-2xl font-bold text-gray-900 font-Inter">
                Your Certificates
              </h3>
              <span className="bg-green/10 text-green px-3 py-1 rounded-full text-sm font-medium">
                {certificates.length} Total
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {certificates.length === 0 && (
                <button
                  onClick={generateTestData}
                  className="px-6 py-3 bg-green text-white rounded-xl hover:bg-green/90 transition-all duration-200 font-medium font-Inter shadow-lg hover:shadow-xl"
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Generate Sample Data"}
                </button>
              )}

              {certificates.length > 0 && (
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium font-Inter">
                  Download All
                </button>
              )}
            </div>
          </div>

          {/* Certificates Content */}
          {certificates.length === 0 ? (
            <div className="text-center py-20">
              <EmptyState
                title="Start Your Learning Journey"
                description="Complete courses and training programs to earn certificates that showcase your expertise in sustainable practices and environmental leadership."
                actionText="Explore Training Programs"
                actionHref="/trainings"
              />
            </div>
          ) : (
            <>
              {/* Certificates Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
                {certificates.map((certificate) => (
                  <CertificateCard
                    key={certificate.id}
                    certificate={certificate}
                  />
                ))}
              </div>

              {/* Quick Actions & Learning Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Quick Actions */}
                <SectionWrapper title="Quick Actions">
                  <div className="space-y-3">
                    {QUICK_ACTIONS.map((action) => (
                      <ActionButton
                        key={action.id}
                        title={action.title}
                        description={action.description}
                        icon={getQuickActionIcon(action.id)}
                        href={action.href}
                      />
                    ))}
                  </div>
                </SectionWrapper>

                {/* Learning Overview */}
                <SectionWrapper title="Learning Overview" variant="green">
                  <div className="space-y-4">
                    <StatsCard
                      title="Total Certificates"
                      value={stats.totalCertificates}
                      icon={Award}
                    />
                    <StatsCard
                      title="Estimated Hours"
                      value={`${stats.estimatedHours}h`}
                      icon={Clock}
                    />
                    <StatsCard
                      title="Latest Certificate"
                      value={stats.latestCertificateDate}
                      icon={Calendar}
                    />
                  </div>
                </SectionWrapper>
              </div>

              {/* Recommended Next Steps */}
              <SectionWrapper
                title="Continue Your Journey"
                subtitle="Recommended courses and certifications based on your current progress"
                variant="gradient"
                className="p-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {COURSE_RECOMMENDATIONS.map((course) => (
                    <CourseRecommendation
                      key={course.id}
                      title={course.title}
                      description={course.description}
                      icon={course.icon}
                      href={course.href}
                      duration={course.duration}
                      level={course.level}
                      enrolled={course.enrolled}
                      tags={course.tags}
                    />
                  ))}
                </div>
              </SectionWrapper>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
