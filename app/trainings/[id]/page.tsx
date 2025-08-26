import { headers } from 'next/headers';
import Link from 'next/link';

import EnrollButton from '@/components/enroll-button';
import Footer from '@/components/footer';
import { H1, H3, H1Inter, SmallerH1 } from '@/components/Heading';
import Page from '@/components/page';

//

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

type Course = {
  courseId: string;
  title: string;
  description: string | null;
  carbonAccountingFocus: boolean | null;
  carbonTopicId: string | null;
  duration: string | null;
  price: string | null;
  whyThisCourse: string | null;
  level: 'beginner' | 'intermediate' | 'expert';
  creationDate: string | null;
  lastUpdated: string | null;
  status: 'Draft' | 'Published' | 'Archived';
};

type Module = {
  moduleId?: string;
  title?: string | null;
  description?: string | null;
  duration?: string | null;
  orderIndex?: number | null;
};

type Session = {
  sessionId: string;
  courseId: string;
  startTime: string;
  endTime: string;
  instructorId: string | null;
  maxParticipants: number | null;
  instructorName?: string | null;
};

const levelLabel = (lvl: Course['level']) =>
  ({ beginner: 'Beginner', intermediate: 'Intermediate', expert: 'Expert' })[lvl];

async function getCourse(base: string, id: string): Promise<Course | null> {
  try {
    const res = await fetch(`${base}/api/trainings/${id}`, {
      cache: 'no-store',
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
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Module[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function getSessions(base: string, id: string): Promise<Session[]> {
  try {
    const res = await fetch(`${base}/api/trainings/${id}/sessions`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as unknown as Array<{
      sessionId: string;
      courseId: string;
      startTime: string;
      endTime: string;
      instructorId?: string | null;
      maxParticipants?: number | null;
      instructorName?: string | null;
    }>;
    return data.map((s) => ({
      sessionId: s.sessionId,
      courseId: s.courseId,
      startTime: s.startTime,
      endTime: s.endTime,
      instructorId: s.instructorId ?? null,
      maxParticipants: s.maxParticipants ?? null,
      instructorName: s.instructorName ?? null,
    }));
  } catch {
    return [];
  }
}

export default async function TrainingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const base = host
    ? `${proto}://${host}`
    : (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000');

  const course = await getCourse(base, id);
  if (!course) {
    return (
      <Page>
        <section className="bg-green w-full py-10 md:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <H1 className="text-white-light">Course not found</H1>
          </div>
        </section>
        <Footer />
      </Page>
    );
  }
  const [modules, sessions] = await Promise.all([getModules(base, id), getSessions(base, id)]);

  return (
    <Page>
      {/* Hero */}
      <section className="w-full py-8 md:py-10 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="text-green font-Inter mb-3 text-sm">
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
      <section className="mx-auto -mt-6 mb-2 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="bg-light-green rounded-lg p-3">
            <div className="font-Inter text-xs font-bold text-black/80 uppercase">Duration</div>
            <div className="font-Inter text-green mt-1">{course.duration || 'Self-paced'}</div>
          </div>
          <div className="bg-light-green rounded-lg p-4">
            <div className="font-Inter text-xs font-bold text-black/80 uppercase">Level</div>
            <div className="font-Inter text-green mt-1">{levelLabel(course.level)}</div>
          </div>
          <div className="bg-light-green rounded-lg p-4">
            <div className="font-Inter text-xs font-bold text-black/80 uppercase">Price</div>
            <div className="font-Inter text-green mt-1">{course.price || 'Contact us'}</div>
          </div>
          <div className="bg-light-green rounded-lg p-4">
            <div className="font-Inter text-xs font-bold text-black/80 uppercase">Level</div>
            <div className="font-Inter text-green mt-1">{course.level}</div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            {/* About */}
            <section className="border-lighter-green rounded-xl border bg-white p-6">
              <SmallerH1 className="mb-3">About this course</SmallerH1>
              {course.description ? (
                <H3 className="text-left">{course.description}</H3>
              ) : (
                <H3 className="text-left">No description provided.</H3>
              )}
            </section>

            {course.whyThisCourse && (
              <section className="border-lighter-green rounded-xl border bg-white p-6">
                <SmallerH1 className="mb-3">Why this course</SmallerH1>
                <H3 className="text-left">{course.whyThisCourse}</H3>
              </section>
            )}

            {/* What you'll learn */}
            <section className="border-lighter-green rounded-xl border bg-white p-6">
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
                        className="bg-light-green text-green font-Inter inline-block rounded-full px-3 py-1 text-sm font-semibold"
                      >
                        {m.title || `Module ${i + 1}`}
                      </span>
                    ))}
                </div>
              ) : (
                <H3 className="text-left">Key learning outcomes will be provided soon.</H3>
              )}
            </section>

            {/* Upcoming sessions for this course */}
            <section className="border-lighter-green rounded-xl border bg-white p-6">
              <SmallerH1 className="mb-3">Upcoming sessions</SmallerH1>
              {sessions.length === 0 ? (
                <H3 className="text-left">No upcoming sessions yet.</H3>
              ) : (
                <ul className="divide-lighter-green divide-y">
                  {sessions
                    .slice()
                    .sort(
                      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
                    )
                    .map((s) => (
                      <li
                        key={s.sessionId}
                        className="flex items-center justify-between gap-4 py-3"
                      >
                        <div>
                          <div className="font-Inter text-green">
                            {new Date(s.startTime).toLocaleString()} —{' '}
                            {new Date(s.endTime).toLocaleString()}
                          </div>
                          <div className="text-green/80 text-sm">
                            Instructor: {s.instructorName || 'TBA'}
                          </div>
                        </div>
                        {s.maxParticipants != null && (
                          <span className="font-Inter bg-light-green text-green rounded px-2 py-1 text-xs">
                            Max {s.maxParticipants}
                          </span>
                        )}
                      </li>
                    ))}
                </ul>
              )}
            </section>

            {/* Syllabus */}
            {modules.length > 0 && (
              <section className="border-lighter-green rounded-xl border bg-white p-6">
                <SmallerH1 className="mb-4">Syllabus</SmallerH1>
                <ol className="space-y-3">
                  {modules
                    .slice()
                    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                    .map((m, idx) => (
                      <li
                        key={m.moduleId ?? idx}
                        className="border-lighter-green rounded-lg border p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="bg-light-green text-green font-Inter mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                              {idx + 1}
                            </span>
                            <div>
                              <H1Inter className="text-left">
                                {m.title ?? `Module ${idx + 1}`}
                              </H1Inter>
                              {m.description ? (
                                <H3 className="mt-1 text-left">{m.description}</H3>
                              ) : null}
                            </div>
                          </div>
                          {m.duration && (
                            <span className="font-Inter bg-lighter-grey text-green rounded px-2 py-1 text-xs whitespace-nowrap">
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
            <div className="border-lighter-green sticky top-6 space-y-5 rounded-xl border bg-white p-6">
              <div>
                <div className="font-Inter text-green/80 text-xs uppercase">Price</div>
                <div className="font-Inter text-green mt-1 text-3xl">
                  {course.price || 'Contact us'}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="border-lighter-green rounded-lg border p-3">
                  <div className="font-Inter text-green/80 text-xs uppercase">Duration</div>
                  <div className="font-Inter text-green">{course.duration || 'Self-paced'}</div>
                </div>
                <div className="border-lighter-green rounded-lg border p-3">
                  <div className="font-Inter text-green/80 text-xs uppercase">Level</div>
                  <div className="font-Inter text-green">{levelLabel(course.level)}</div>
                </div>
              </div>

              <div className="border-lighter-green rounded-lg border bg-white p-4">
                <div className="flex flex-wrap gap-2">
                  {['100% online', 'Learn at your own pace', 'Certificate available'].map(
                    (text, idx) => (
                      <span
                        key={idx}
                        className="bg-green font-Inter inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
                      >
                        {text}
                      </span>
                    ),
                  )}
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
