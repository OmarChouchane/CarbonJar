import { H1, H3, H1Inter, SmallerH1 } from "@/components/Heading";
import Button from "@/components/button";
import EnrollButton from "@/components/enroll-button";
import Footer from "@/components/footer";
import Page from "@/components/page";
import Link from "next/link";
import { headers } from "next/headers";
//

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

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

type Module = {
  moduleId?: string;
  title?: string | null;
  description?: string | null;
  duration?: string | null;
  orderIndex?: number | null;
};

const levelLabel = (lvl: Course["level"]) =>
  ({ beginner: "Beginner", intermediate: "Intermediate", expert: "Expert" }[
    lvl
  ]);

async function getCourse(base: string, id: string): Promise<Course | null> {
  try {
    const res = await fetch(`${base}/api/trainings/${id}`, {
      cache: "no-store",
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    return (await res.json()) as Course;
  } catch {
    return null;
  }
}

async function getModules(base: string, id: string): Promise<Module[]> {
  try {
    const res = await fetch(`${base}/api/trainings/${id}/modules`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Module[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function TrainingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base = host
    ? `${proto}://${host}`
    : process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const course = await getCourse(base, id);
  if (!course) {
    return (
      <Page>
        <section className="w-full bg-green py-10 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <H1 className="text-white-light">Course not found</H1>
          </div>
        </section>
        <Footer />
      </Page>
    );
  }
  const modules = await getModules(base, id);

  return (
    <Page>
      {/* Hero */}
      <section className="w-full  py-8 md:py-10 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-3 text-green font-Inter text-sm">
            <Link href="/trainings" className="hover:underline">
              Trainings
            </Link>
            <span className="px-2">/</span>
            <span className="text-green">{course.title}</span>
          </div>
          <H1 className="text-green">{course.title}</H1>
        </div>
      </section>

      {/* Key facts strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg bg-light-green p-3">
            <div className="text-xs font-bold font-Inter uppercase text-black/80">
              Duration
            </div>
            <div className="font-Inter text-green mt-1">
              {course.duration || "Self-paced"}
            </div>
          </div>
          <div className="rounded-lg bg-light-green p-4">
            <div className="text-xs font-bold font-Inter uppercase text-black/80">
              Level
            </div>
            <div className="font-Inter text-green mt-1">
              {levelLabel(course.level)}
            </div>
          </div>
          <div className="rounded-lg bg-light-green p-4">
            <div className="text-xs font-bold font-Inter uppercase text-black/80">
              Price
            </div>
            <div className="font-Inter text-green mt-1">
              {course.price || "Contact us"}
            </div>
          </div>
          <div className="rounded-lg bg-light-green p-4">
            <div className="text-xs font-bold font-Inter uppercase text-black/80">
              Level
            </div>
            <div className="font-Inter text-green mt-1">{course.level}</div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <section className="rounded-xl border border-lighter-green bg-white p-6">
              <SmallerH1 className="mb-3">About this course</SmallerH1>
              {course.description ? (
                <H3 className="text-left">{course.description}</H3>
              ) : (
                <H3 className="text-left">No description provided.</H3>
              )}
            </section>

            {course.whyThisCourse && (
              <section className="rounded-xl border border-lighter-green bg-white p-6">
                <SmallerH1 className="mb-3">Why this course</SmallerH1>
                <H3 className="text-left">{course.whyThisCourse}</H3>
              </section>
            )}

            {/* What you'll learn */}
            <section className="rounded-xl border border-lighter-green bg-white p-6">
              <SmallerH1 className="mb-3">What you’ll learn</SmallerH1>
              {modules.length ? (
                <div className="flex flex-wrap gap-2">
                  {modules
                    .slice()
                    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                    .slice(0, 6)
                    .map((m, i) => (
                      <span
                        key={m.moduleId ?? i}
                        className="inline-block bg-light-green text-green px-3 py-1 rounded-full text-sm font-Inter font-semibold"
                      >
                        {m.title || `Module ${i + 1}`}
                      </span>
                    ))}
                </div>
              ) : (
                <H3 className="text-left">
                  Key learning outcomes will be provided soon.
                </H3>
              )}
            </section>

            {/* Syllabus */}
            {modules.length > 0 && (
              <section className="rounded-xl border border-lighter-green bg-white p-6">
                <SmallerH1 className="mb-4">Syllabus</SmallerH1>
                <ol className="space-y-3">
                  {modules
                    .slice()
                    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                    .map((m, idx) => (
                      <li
                        key={m.moduleId ?? idx}
                        className="rounded-lg border border-lighter-green p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-light-green text-green text-xs font-bold font-Inter">
                              {idx + 1}
                            </span>
                            <div>
                              <H1Inter className="text-left">
                                {m.title ?? `Module ${idx + 1}`}
                              </H1Inter>
                              {m.description ? (
                                <H3 className="text-left mt-1">
                                  {m.description}
                                </H3>
                              ) : null}
                            </div>
                          </div>
                          {m.duration && (
                            <span className="text-xs font-Inter bg-lighter-grey text-green px-2 py-1 rounded whitespace-nowrap">
                              {m.duration}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                </ol>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            <div className="rounded-xl border border-lighter-green bg-white p-6 sticky top-6 space-y-5">
              <div>
                <div className="text-xs font-Inter uppercase text-green/80">
                  Price
                </div>
                <div className="text-3xl font-Inter text-green mt-1">
                  {course.price || "Contact us"}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-lighter-green p-3">
                  <div className="text-xs font-Inter uppercase text-green/80">
                    Duration
                  </div>
                  <div className="font-Inter text-green">
                    {course.duration || "Self-paced"}
                  </div>
                </div>
                <div className="rounded-lg border border-lighter-green p-3">
                  <div className="text-xs font-Inter uppercase text-green/80">
                    Level
                  </div>
                  <div className="font-Inter text-green">
                    {levelLabel(course.level)}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-lighter-green p-4 bg-white">
                <div className="flex flex-wrap gap-2">
                  {[
                    "100% online",
                    "Learn at your own pace",
                    "Certificate available",
                  ].map((text, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-green text-white px-3 py-1 rounded-full text-xs font-Inter font-semibold"
                    >
                      {text}
                    </span>
                  ))}
                </div>
              </div>
              <EnrollButton courseId={course.courseId} />
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </Page>
  );
}
