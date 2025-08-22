"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
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
import type { Certificate } from "@/types/certificate";
import {
  Award,
  Clock,
  Calendar,
  BookOpen,
  Download,
  Share2,
  GraduationCap,
  Leaf,
  Building,
} from "lucide-react";

type ApiCertificate = {
  certificateId: string;
  userId: string;
  courseId: string;
  fullName: string;
  title: string;
  description: string;
  courseStartDate: string; // ISO
  courseEndDate: string; // ISO
  issueDate: string; // ISO
  validUntil: string | null; // ISO
  issuerName: string;
  issuerRole: string;
  certificateCode: string;
  certificateSlug: string;
  pdfUrl: string;
  certificateHash: string;
  isRevoked: boolean;
  revokedReason: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export default function CertificatesDashboard() {
  const { user } = useUser();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<
    Array<{
      courseId: string;
      title: string;
      description: string | null;
      duration: string | null;
      level: string | null;
      carbonTopicId?: string | null;
      status?: string | null;
      createdAt?: string | null;
      lastUpdated?: string | null;
    }>
  >([]);
  const [enrollmentCounts, setEnrollmentCounts] = useState<
    Record<string, number>
  >({});
  const [topicsById, setTopicsById] = useState<Record<string, string>>({});
  // Slider ref for recommendations
  const sliderRef = useRef<HTMLDivElement>(null);
  const scrollRecommendations = useCallback((dir: "left" | "right") => {
    const el = sliderRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const cardWidth = first?.clientWidth ?? 360;
    const gap = 24; // gap-6
    el.scrollBy({
      left: (dir === "left" ? -1 : 1) * (cardWidth + gap),
      behavior: "smooth",
    });
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Map Clerk user to internal userId
      const usersRes = await fetch("/api/users", { cache: "no-store" });
      if (!usersRes.ok) throw new Error("Failed to load users");
      const users: Array<{ userId: string; clerkId?: string | null }> =
        await usersRes.json();
      const me = user ? users.find((u) => u.clerkId === user.id) : null;
      if (!me) {
        setCertificates([]);
        return;
      }

      // Fetch all certificates and filter client-side by userId
      const certsRes = await fetch("/api/certificates", { cache: "no-store" });
      if (!certsRes.ok) throw new Error("Failed to load certificates");
      const data: ApiCertificate[] = await certsRes.json();

      const mine = data
        .filter((c) => c.userId === me.userId)
        .sort((a, b) => {
          const da = a.issueDate ? new Date(a.issueDate).getTime() : 0;
          const db = b.issueDate ? new Date(b.issueDate).getTime() : 0;
          return db - da;
        })
        .map<Certificate>((c) => ({
          id: c.certificateId,
          title: c.title,
          ...(c.description ? { description: c.description } : {}),
          issuedAt: c.issueDate,
          certificateUrl: c.pdfUrl || "",
          certId: c.certificateCode,
          expirationAt: c.validUntil,
          // Always use company name for LinkedIn issuing organization
          organizationName: "Carbon Jar",
          slug: c.certificateSlug,
        }));

      setCertificates(mine);
    } catch (e: any) {
      setError(e?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const refetchCertificates = useCallback(() => {
    load();
  }, [load]);

  // Load recommendations from DB (courses API)
  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const res = await fetch("/api/trainings", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load trainings");
        const courses: Array<any> = await res.json();

        // Prefer published courses, newest first
        const sorted = [...courses]
          .filter((c) => (c.status ? c.status === "Published" : true))
          .sort((a, b) => {
            const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return db - da;
          });

        setRecommendations(
          sorted.map((c) => ({
            courseId: c.courseId,
            title: c.title,
            description: c.description ?? null,
            duration: c.duration ?? null,
            level: c.level ?? null,
            carbonTopicId: c.carbonTopicId ?? null,
            status: c.status ?? null,
            createdAt: c.createdAt ?? null,
            lastUpdated: c.lastUpdated ?? null,
          }))
        );
      } catch (e) {
        // Fallback to empty if error; avoid crashing the page
        setRecommendations([]);
      }
    };
    fetchTrainings();
  }, []);

  // Load enrollment counts for courses (DB-backed)
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await fetch("/api/enrollments", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load enrollments");
        const enrolls: Array<{ courseId: string }> = await res.json();
        const counts = enrolls.reduce<Record<string, number>>((acc, e) => {
          if (e && e.courseId) acc[e.courseId] = (acc[e.courseId] || 0) + 1;
          return acc;
        }, {});
        setEnrollmentCounts(counts);
      } catch {
        setEnrollmentCounts({});
      }
    };
    fetchEnrollments();
  }, []);

  // Load carbon topics to use as dynamic tags
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch("/api/carbon-topics", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load topics");
        const topics: Array<{ topicId: string; name: string }> =
          await res.json();
        const map: Record<string, string> = {};
        topics.forEach((t) => {
          if (t && t.topicId) map[t.topicId] = t.name;
        });
        setTopicsById(map);
      } catch {
        setTopicsById({});
      }
    };
    fetchTopics();
  }, []);

  // Quick actions (inlined, not from constants)
  const quickActions = useMemo(
    () => [
      {
        id: "browse-courses",
        title: "Browse Courses",
        description: "Discover new training programs",
        href: "/trainings",
      },
      {
        id: "download-certificates",
        title: "Download All Certificates",
        description: "Get PDF copies of all certificates",
      },
      {
        id: "share-portfolio",
        title: "Share Portfolio",
        description: "Share your achievements online",
      },
    ],
    []
  );

  // Simple stats derived from real data
  const stats = useMemo(() => {
    const totalCertificates = certificates.length;
    const titleSet = new Set(certificates.map((c) => c.title));
    const skillsMastered = titleSet.size; // proxy based on unique titles
    const latestIssue = certificates.length
      ? new Date(
          certificates
            .map((c) => c.issuedAt)
            .filter(Boolean)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
        )
      : null;
    const latestCertificateDate = latestIssue
      ? latestIssue.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";
    const estimatedHours = totalCertificates * 4; // simple proxy if you want a rough estimate
    const completionRate = "100%"; // certificates imply completed trainings

    return {
      totalCertificates,
      skillsMastered,
      latestCertificateDate,
      estimatedHours,
      completionRate,
    };
  }, [certificates]);

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
              {certificates.length > 0 && (
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium font-Inter"
                  onClick={() => {
                    // Best-effort open all available PDF URLs in new tabs
                    certificates.forEach((c) => {
                      if (c.certificateUrl)
                        window.open(
                          c.certificateUrl,
                          "_blank",
                          "noopener,noreferrer"
                        );
                    });
                  }}
                >
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
                    {quickActions.map((action) => {
                      const commonProps = {
                        title: action.title,
                        description: action.description,
                        icon: getQuickActionIcon(action.id),
                      } as const;

                      // Wire up special behavior
                      if (action.id === "download-certificates") {
                        return (
                          <ActionButton
                            key={action.id}
                            {...commonProps}
                            onClick={() => {
                              certificates.forEach((c) => {
                                if (c.certificateUrl)
                                  window.open(
                                    c.certificateUrl,
                                    "_blank",
                                    "noopener,noreferrer"
                                  );
                              });
                            }}
                          />
                        );
                      }

                      if (action.id === "share-portfolio") {
                        return (
                          <ActionButton
                            key={action.id}
                            {...commonProps}
                            onClick={() => {
                              const shareUrl = `${window.location.origin}/dashboard/certificates`;
                              if (navigator.share) {
                                navigator
                                  .share({
                                    title: "My CarbonJar Certificates",
                                    text: "Check out my certificates on CarbonJar",
                                    url: shareUrl,
                                  })
                                  .catch(() => {
                                    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                                      shareUrl
                                    )}`;
                                    window.open(
                                      url,
                                      "_blank",
                                      "noopener,noreferrer"
                                    );
                                  });
                              } else {
                                const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                                  shareUrl
                                )}`;
                                window.open(
                                  url,
                                  "_blank",
                                  "noopener,noreferrer"
                                );
                              }
                            }}
                          />
                        );
                      }

                      return (
                        <ActionButton
                          key={action.id}
                          {...commonProps}
                          {...(action.href ? { href: action.href } : {})}
                        />
                      );
                    })}
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
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div />
                    <a
                      href="/trainings"
                      className="text-sm font-medium transition-colors duration-200 hover:text-green hover:bg-green/10 rounded px-2 py-1 focus:text-green focus:bg-green/10"
                    >
                      Explore more
                    </a>
                  </div>

                  <div className="relative">
                    {/* Slider viewport */}
                    <div
                      ref={sliderRef}
                      className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
                    >
                      {recommendations.map((course, idx) => {
                        const icons = [GraduationCap, Leaf, Building] as const;
                        const Icon = icons[idx % icons.length];
                        const href = `/trainings/${course.courseId}`;
                        const duration = course.duration || undefined;
                        const levelLabel = course.level
                          ? String(course.level).charAt(0).toUpperCase() +
                            String(course.level).slice(1)
                          : undefined;
                        const desc = course.description || "";
                        const enrolled =
                          typeof enrollmentCounts[course.courseId] === "number"
                            ? enrollmentCounts[course.courseId]
                            : undefined;
                        const topicName = course.carbonTopicId
                          ? topicsById[course.carbonTopicId]
                          : undefined;
                        const tags = topicName ? [topicName] : undefined;

                        const optionalProps = {
                          ...(duration ? { duration } : {}),
                          ...(levelLabel ? { level: levelLabel } : {}),
                          ...(typeof enrolled === "number" ? { enrolled } : {}),
                          ...(tags ? { tags } : {}),
                        } as const;

                        return (
                          <div
                            key={course.courseId}
                            className="snap-start shrink-0 w-[320px] md:w-[360px]"
                          >
                            <CourseRecommendation
                              title={course.title}
                              description={desc}
                              icon={Icon}
                              href={href}
                              {...optionalProps}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Controls */}
                    <div className="hidden md:block">
                      <button
                        type="button"
                        aria-label="Previous"
                        onClick={() => scrollRecommendations("left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 h-10 w-10 rounded-full bg-white text-green shadow hover:bg-gray-50 border border-gray-200 flex items-center justify-center"
                      >
                        <span className="sr-only">Previous</span>‹
                      </button>
                      <button
                        type="button"
                        aria-label="Next"
                        onClick={() => scrollRecommendations("right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 h-10 w-10 rounded-full bg-white text-green shadow hover:bg-gray-50 border border-gray-200 flex items-center justify-center"
                      >
                        <span className="sr-only">Next</span>›
                      </button>
                    </div>
                  </div>
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
