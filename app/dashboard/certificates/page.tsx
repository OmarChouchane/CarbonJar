'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';

import { useUser } from '@clerk/nextjs';
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
} from 'lucide-react';
import Link from 'next/link';

import ActionButton from '@/components/action-button';
import CertificateCard from '@/components/certificate-card';
import CourseRecommendation from '@/components/course-recommendation';
import EmptyState from '@/components/empty-state';
import ErrorState from '@/components/error-state';
import Footer from '@/components/footer';
import { SmallerH1, H2 } from '@/components/Heading';
import LoadingState from '@/components/loading-state';
import Navigation from '@/components/navigation';
import SectionWrapper from '@/components/section-wrapper';
import StatsCard from '@/components/stats-card';
import type { Certificate } from '@/types/certificate';
import { resolveCertificateAssetUrls } from '@/utils/certificateUtils';

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
  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<string, number>>({});
  const [topicsById, setTopicsById] = useState<Record<string, string>>({});
  // Slider ref for recommendations
  const sliderRef = useRef<HTMLDivElement>(null);
  const scrollRecommendations = useCallback((dir: 'left' | 'right') => {
    const el = sliderRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const cardWidth = first?.clientWidth ?? 360;
    const gap = 24; // gap-6
    el.scrollBy({
      left: (dir === 'left' ? -1 : 1) * (cardWidth + gap),
      behavior: 'smooth',
    });
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Map Clerk user to internal userId
      const usersRes = await fetch('/api/users', { cache: 'no-store' });
      if (!usersRes.ok) throw new Error('Failed to load users');
      const users = (await usersRes.json()) as unknown as Array<{
        userId: string;
        clerkId?: string | null;
      }>;
      const me = user ? users.find((u) => u.clerkId === user.id) : null;
      if (!me) {
        setCertificates([]);
        return;
      }

      // Fetch all certificates and filter client-side by userId
      const certsRes = await fetch('/api/certificates', { cache: 'no-store' });
      if (!certsRes.ok) throw new Error('Failed to load certificates');
      const data = (await certsRes.json()) as unknown as ApiCertificate[];
      const origin = typeof window !== 'undefined' ? window.location.origin : '';

      const mine = data
        .filter((c) => c.userId === me.userId)
        .sort((a, b) => {
          const da = a.issueDate ? new Date(a.issueDate).getTime() : 0;
          const db = b.issueDate ? new Date(b.issueDate).getTime() : 0;
          return db - da;
        })
        .map<Certificate>((c) => {
          const assetUrls = resolveCertificateAssetUrls({
            pdfUrl: c.pdfUrl,
            slug: c.certificateSlug ?? null,
            fallbackPreviewUrl: c.certificateSlug
              ? `/api/certificates/${c.certificateSlug}/preview`
              : null,
          });

          return {
            id: c.certificateId,
            title: c.title,
            ...(c.description ? { description: c.description } : {}),
            issuedAt: c.issueDate,
            certificateUrl: assetUrls.downloadUrl ?? c.pdfUrl ?? '',
            certId: c.certificateCode,
            expirationAt: c.validUntil,
            // Always use company name for LinkedIn issuing organization
            organizationName: 'Carbon Jar',
            slug: c.certificateSlug,
            ...(c.certificateSlug
              ? {
                  credentialUrl: origin
                    ? `${origin}/certificates/${c.certificateSlug}`
                    : `/certificates/${c.certificateSlug}`,
                }
              : {}),
          } satisfies Certificate;
        });

      setCertificates(mine);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const refetchCertificates = useCallback(() => {
    void load();
  }, [load]);

  // Load recommendations from DB (courses API)
  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const res = await fetch('/api/trainings', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load trainings');
        const courses = (await res.json()) as unknown as Array<{
          courseId: string;
          title: string;
          description: string | null;
          duration: string | null;
          level: string | null;
          carbonTopicId?: string | null;
          status?: string | null;
          createdAt?: string | null;
          lastUpdated?: string | null;
        }>;

        // Prefer published courses, newest first
        const sorted = [...courses]
          .filter((c) => (c.status ? c.status === 'Published' : true))
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
          })),
        );
      } catch {
        // Fallback to empty if error; avoid crashing the page
        setRecommendations([]);
      }
    };
    void fetchTrainings();
  }, []);

  // Load enrollment counts for courses (DB-backed)
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await fetch('/api/enrollments', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load enrollments');
        const enrolls = (await res.json()) as unknown as Array<{
          courseId: string;
        }>;
        const counts = enrolls.reduce<Record<string, number>>((acc, e) => {
          if (e && e.courseId) acc[e.courseId] = (acc[e.courseId] || 0) + 1;
          return acc;
        }, {});
        setEnrollmentCounts(counts);
      } catch {
        setEnrollmentCounts({});
      }
    };
    void fetchEnrollments();
  }, []);

  // Load carbon topics to use as dynamic tags
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch('/api/carbon-topics', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load topics');
        const topics = (await res.json()) as unknown as Array<{
          topicId: string;
          name: string;
        }>;
        const map: Record<string, string> = {};
        topics.forEach((t) => {
          if (t && t.topicId) map[t.topicId] = t.name;
        });
        setTopicsById(map);
      } catch {
        setTopicsById({});
      }
    };
    void fetchTopics();
  }, []);

  // Quick actions (inlined, not from constants)
  const quickActions = useMemo(
    () => [
      {
        id: 'browse-courses',
        title: 'Browse Courses',
        description: 'Discover new training programs',
        href: '/trainings',
      },
      {
        id: 'download-certificates',
        title: 'Download All Certificates',
        description: 'Get PDF copies of all certificates',
      },
      {
        id: 'share-portfolio',
        title: 'Share Portfolio',
        description: 'Share your achievements online',
      },
    ],
    [],
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
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0],
        )
      : null;
    const latestCertificateDate = latestIssue
      ? latestIssue.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '—';
    const estimatedHours = totalCertificates * 4; // simple proxy if you want a rough estimate
    const completionRate = '100%'; // certificates imply completed trainings

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
      case 'browse-courses':
        return BookOpen;
      case 'download-certificates':
        return Download;
      case 'share-portfolio':
        return Share2;
      default:
        return BookOpen;
    }
  };

  if (loading) {
    return (
      <div className="bg-white-light min-h-screen">
        <Navigation />
        <LoadingState message="Loading certificates..." />
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white-light min-h-screen">
        <Navigation />
        <ErrorState error={error} onRetry={refetchCertificates} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <div className="from-green to-green/80 mb-8 bg-gradient-to-r py-16 text-white">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <SmallerH1 className="mb-4 text-white">My Certificates</SmallerH1>
              <H2 className="mb-6 text-white/90">Showcase Your Professional Achievements</H2>
              <p className="font-Inter mx-auto max-w-2xl text-sm text-white/80">
                Your earned certificates demonstrate your commitment to sustainable practices and
                environmental leadership. Share your achievements and continue growing your
                expertise.
              </p>

              {/* Stats Cards */}
              <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                <StatsCard
                  title="Certificates Earned"
                  value={stats.totalCertificates}
                  variant="hero"
                />
                <StatsCard title="Skills Mastered" value={stats.skillsMastered} variant="hero" />
                <StatsCard title="Completion Rate" value={stats.completionRate} variant="hero" />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16">
          {/* Filter & Action Bar */}
          <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center space-x-4">
              <h3 className="font-Inter text-2xl font-bold text-gray-900">Your Certificates</h3>
              <span className="bg-green/10 text-green rounded-full px-3 py-1 text-sm font-medium">
                {certificates.length} Total
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {certificates.length > 0 && (
                <button
                  className="font-Inter rounded-xl border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  onClick={() => {
                    // Best-effort open all available PDF URLs in new tabs
                    certificates.forEach((c) => {
                      if (c.certificateUrl)
                        window.open(c.certificateUrl, '_blank', 'noopener,noreferrer');
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
            <div className="py-20 text-center">
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
              <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
                {certificates.map((certificate) => (
                  <CertificateCard key={certificate.id} certificate={certificate} />
                ))}
              </div>

              {/* Quick Actions & Learning Overview */}
              <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
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
                      if (action.id === 'download-certificates') {
                        return (
                          <ActionButton
                            key={action.id}
                            {...commonProps}
                            onClick={() => {
                              certificates.forEach((c) => {
                                if (c.certificateUrl)
                                  window.open(c.certificateUrl, '_blank', 'noopener,noreferrer');
                              });
                            }}
                          />
                        );
                      }

                      if (action.id === 'share-portfolio') {
                        return (
                          <ActionButton
                            key={action.id}
                            {...commonProps}
                            onClick={() => {
                              const shareUrl = `${window.location.origin}/dashboard/certificates`;
                              if (navigator.share) {
                                navigator
                                  .share({
                                    title: 'My CarbonJar Certificates',
                                    text: 'Check out my certificates on CarbonJar',
                                    url: shareUrl,
                                  })
                                  .catch(() => {
                                    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                                      shareUrl,
                                    )}`;
                                    window.open(url, '_blank', 'noopener,noreferrer');
                                  });
                              } else {
                                const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                                  shareUrl,
                                )}`;
                                window.open(url, '_blank', 'noopener,noreferrer');
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
                  <div className="mb-4 flex items-center justify-between">
                    <div />
                    <Link
                      href="/trainings"
                      className="hover:text-green hover:bg-green/10 focus:text-green focus:bg-green/10 rounded px-2 py-1 text-sm font-medium transition-colors duration-200"
                    >
                      Explore more
                    </Link>
                  </div>

                  <div className="relative">
                    {/* Slider viewport */}
                    <div
                      ref={sliderRef}
                      className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2"
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
                        const desc = course.description || '';
                        const enrolled =
                          typeof enrollmentCounts[course.courseId] === 'number'
                            ? enrollmentCounts[course.courseId]
                            : undefined;
                        const topicName = course.carbonTopicId
                          ? topicsById[course.carbonTopicId]
                          : undefined;
                        const tags = topicName ? [topicName] : undefined;

                        const optionalProps = {
                          ...(duration ? { duration } : {}),
                          ...(levelLabel ? { level: levelLabel } : {}),
                          ...(typeof enrolled === 'number' ? { enrolled } : {}),
                          ...(tags ? { tags } : {}),
                        } as const;

                        return (
                          <div
                            key={course.courseId}
                            className="w-[320px] shrink-0 snap-start md:w-[360px]"
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
                        onClick={() => scrollRecommendations('left')}
                        className="text-green absolute top-1/2 left-0 -ml-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>‹
                      </button>
                      <button
                        type="button"
                        aria-label="Next"
                        onClick={() => scrollRecommendations('right')}
                        className="text-green absolute top-1/2 right-0 -mr-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow hover:bg-gray-50"
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
