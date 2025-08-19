"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Footer from "@/components/footer";
import ScrollProgress from "@/components/scroll";
import { H1, H2, H3, H1Inter, SmallerH1 } from "@/components/Heading";
import EnrollButton from "@/components/enroll-button";
import TextCard from "@/components/TextCard";
import StatisticBlock from "@/components/static-bloc2";
import FAQSection from "@/components/faq-section";
import Page from "@/components/page";
import { useRouter } from "next/navigation";

type Course = {
  courseId: string;
  title: string;
  description: string | null;
  carbonAccountingFocus: boolean | null;
  carbonTopicId: string | null;
  duration: string | null;
  price: string | null;
  whyThisCourse: string | null;
  level: "beginner" | "intermediate" | "expert";
  creationDate: string | null;
  lastUpdated: string | null;
  status: "Draft" | "Published" | "Archived";
};

export default function TrainingsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] =
    useState<Course["level"]>("beginner");
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/trainings", { cache: "no-store" });
        if (!res.ok)
          throw new Error(`Failed to fetch trainings: ${res.status}`);
        const data: Course[] = await res.json();
        console.log("Fetched trainings:", data);
        if (mounted) setCourses(data);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to load trainings";
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Load enrolled course IDs for the signed-in user
  useEffect(() => {
    let cancelled = false;
    const loadEnrollments = async () => {
      try {
        if (!user) {
          setEnrolledIds([]);
          return;
        }
        const usersRes = await fetch(`/api/users`, { cache: "no-store" });
        if (!usersRes.ok) return;
        const users = (await usersRes.json()) as Array<{
          userId: string;
          clerkId?: string | null;
        }>;
        const me = users.find((u) => u.clerkId === user.id);
        if (!me?.userId) return;
        const res = await fetch(`/api/enrollments`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as Array<{
          courseId: string;
          userId: string;
        }>;
        if (cancelled) return;
        const ids = data
          .filter((e) => e.userId === me.userId)
          .map((e) => e.courseId);
        setEnrolledIds(Array.from(new Set(ids)));
      } catch {
        // ignore
      }
    };
    loadEnrollments();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Only show published trainings
  const published = useMemo(
    () => courses.filter((c) => c.status === "Published"),
    [courses]
  );

  // Group by level
  // Selected-level filtered list for display

  const filtered = useMemo(
    () => published.filter((c) => c.level === selectedLevel),
    [published, selectedLevel]
  );

  const inHouse = [
    {
      title: "Enhanced Effectiveness",
      text: "Tailored to your organization’s specific needs, ensuring maximum relevance and impact.",
    },
    {
      title: "Convenience",
      text: "Conducted at your premises, eliminating the need for travel and accommodation.",
    },
    {
      title: "Exclusivity",
      text: "Open only to your employees, fostering a focused and cohesive learning environment.",
    },
    {
      title: "Cost Savings",
      text: "Reduces expenses related to travel and accommodation.",
    },
    {
      title: "Practical Understanding",
      text: "Hands-on training that directly applies to your operational context.",
    },
    {
      title: "Team Participation",
      text: "Allows a larger number of team members to participate, promoting collective growth.",
    },
  ];
  const publicTrainings = [
    {
      title: "Ideal for Smaller Groups",
      text: "Perfect for organizations with fewer participants.",
    },
    {
      title: "Diverse Course Offerings",
      text: "Access to a wide range of courses covering various topics.",
    },
    {
      title: "In-Depth Learning",
      text: "Detailed and comprehensive courses designed to provide thorough knowledge.",
    },
    {
      title: "Certification",
      text: "Participants receive certificates and qualifications upon completion, enhancing their professional credentials.",
    },
  ];
  const liveOnlineTrainings = [
    {
      title: "Convenience",
      text: "Participate from anywhere, eliminating the need for travel.",
    },
    {
      title: "Cost-Effective",
      text: "Reduces costs associated with travel and accommodation.",
    },
    {
      title: "Immediate Implementation",
      text: "Apply what you learn immediately in your work environment.",
    },
    {
      title: "Real-Time Interaction",
      text: "Engage with instructors and peers in real-time, ensuring an interactive learning experience.",
    },
    {
      title: "Certification",
      text: "Receive certification upon completion, validating your new skills and knowledge.",
    },
  ];

  return (
    <>
      <Page>
        <ScrollProgress />

        <main>
          <div>
            <header>
              <div className="mx-auto py-12 sm:px-4 lg:px-6 md:mb-2 sm:mb-4 lg:mt-4 md:mt-4 sm:mt-4">
                <br />
                <H1>Our Training Programs!</H1>
                <br />
                <H2>
                  At Carbon Jar, we provide professional training to enhance
                  your
                  <br />
                  team’s knowledge and skills.
                </H2>
              </div>

              {/* Removed corporate/student toggle; grouping by level below */}
            </header>
          </div>

          {/* Dynamic trainings list with level filters - full width green background */}
          <section className="w-full bg-green py-8 md:py-10 lg:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Level filters */}
              <div className="flex flex-wrap gap-3 justify-center items-center mb-8">
                {(
                  [
                    { key: "beginner", label: "Beginner" },
                    { key: "intermediate", label: "Intermediate" },
                    { key: "expert", label: "Expert" },
                  ] as const
                ).map((opt) => {
                  const active = selectedLevel === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSelectedLevel(opt.key)}
                      className={
                        `px-4 py-2 rounded-full border transition ` +
                        (active
                          ? "bg-light-green text-green border-green"
                          : "bg-transparent text-white border-border-white hover:bg-white/10")
                      }
                    >
                      <span className="font-Inter text-sm">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <H2 className="text-white-light">Loading trainings…</H2>
                </div>
              )}
              {!loading && error && (
                <div className="flex flex-col items-center py-12">
                  <H2 className="text-white-light">{error}</H2>
                  <H3 className="mt-2 text-white-light/80">
                    Please try again later.
                  </H3>
                </div>
              )}
              {!loading && !error && (
                <>
                  {published.length === 0 ? (
                    <div className="flex flex-col items-center py-12">
                      <H2 className="text-white-light">
                        No trainings available yet.
                      </H2>
                      <H3 className="mt-2 text-white-light/80">
                        Check back soon.
                      </H3>
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((c) => (
                          <div
                            key={c.courseId}
                            onClick={() =>
                              router.push(`/trainings/${c.courseId}`)
                            }
                            className="h-full flex flex-col items-start gap-3 rounded-xl border border-lighter-green bg-green-dark shadow-md p-5 cursor-pointer transition hover:shadow-2xl hover:bg-light-green/20"
                          >
                            <H1Inter className="text-left w-full text-white-light">
                              {c.title}
                            </H1Inter>

                            <div className="w-full mt-auto flex items-center justify-between pt-3">
                              <div className="flex flex-col items-start">
                                {enrolledIds.includes(c.courseId) && (
                                  <span className="mb-2 inline-block bg-light-green px-2.5 py-0.5 rounded-full text-[11px] font-Inter font-semibold text-green border border-green/50">
                                    Enrolled
                                  </span>
                                )}
                                <span className="font-Inter text-white-light text-sm">
                                  {c.price ? `Price: ${c.price}` : ""}
                                </span>
                              </div>
                              <EnrollButton
                                courseId={c.courseId}
                                fullWidth={false}
                                onEnrollmentSuccess={() => {
                                  setEnrolledIds((prev) =>
                                    prev.includes(c.courseId)
                                      ? prev
                                      : [...prev, c.courseId]
                                  );
                                }}
                                onUnenroll={() => {
                                  setEnrolledIds((prev) =>
                                    prev.filter((id) => id !== c.courseId)
                                  );
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
          <div>
            <section>
              <TextCard title="In-House Training" texts={inHouse} />
              <TextCard title="Public Training" texts={publicTrainings} />
              <TextCard
                title="Live Online Training"
                texts={liveOnlineTrainings}
              />
            </section>
          </div>
          <div>
            <section className="bg-light-green w-full lg:px-20 p-4 lg:pt-12 lg:mb-16">
              <SmallerH1 className="lg:m-8">
                Empowering Businesses with Efficient Trainings
              </SmallerH1>
              <br />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatisticBlock
                  number="+1000"
                  description="Hours of training"
                />
                <StatisticBlock number="+150" description="People trained" />
                <StatisticBlock number="+12" description="Trainings offered" />
                <StatisticBlock
                  number="+15"
                  description="Integrated workshops"
                />
                <br />
              </div>
              <H2 className="lg:px-32 lg:mx-32 lg:mb-12 text-left">
                <span className="font-bold">NOTE: </span>We’re committed to
                matching the prices of any competitors who may provide the same
                courses! If you’re considering booking multiple courses or have
                multiple attendees, we offer a discounted pricing structure.
                Please get in touch with our team for further details.
              </H2>
            </section>
          </div>

          <FAQSection />
        </main>

        <Footer />
      </Page>
    </>
  );
}
