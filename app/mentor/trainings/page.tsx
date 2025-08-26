'use client';

import { useEffect, useMemo, useState } from 'react';

import { useUser } from '@clerk/nextjs';
import { BookOpen, BadgeCheck } from 'lucide-react';
import Link from 'next/link';

import Button from '@/components/button';
import { H1, H2 } from '@/components/Heading';
import SectionWrapper from '@/components/section-wrapper';

type Course = {
  courseId: string;
  title: string;
  description: string | null;
  level: 'beginner' | 'intermediate' | 'expert';
  status: 'Draft' | 'Published' | 'Archived';
};

type Session = {
  sessionId: string;
  courseId: string;
  instructorId: string | null;
};

export default function MentorTrainingsPage() {
  const { user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [meId, setMeId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setErr(null);
        // Map Clerk user to internal user id (trainer or admin)
        let myId: string | null = null;
        if (user) {
          const resUsers = await fetch('/api/users?role=trainer', {
            cache: 'no-store',
          });
          const users = (await resUsers.json()) as unknown as Array<{
            userId: string;
            clerkId?: string | null;
          }>;
          myId = users.find((u) => u.clerkId === user.id)?.userId ?? null;
          if (!myId) {
            const resAdmins = await fetch('/api/users?role=admin', {
              cache: 'no-store',
            });
            const admins = (await resAdmins.json()) as unknown as Array<{
              userId: string;
              clerkId?: string | null;
            }>;
            myId = admins.find((u) => u.clerkId === user.id)?.userId ?? null;
          }
        }
        if (!active) return;
        setMeId(myId);

        const [resCourses, resSessions] = await Promise.all([
          fetch('/api/trainings', { cache: 'no-store' }),
          fetch('/api/training-sessions', { cache: 'no-store' }),
        ]);
        const allCourses = (await resCourses.json()) as unknown as Course[];
        const allSessions = (await resSessions.json()) as unknown as Array<{
          sessionId: string;
          courseId: string;
          instructorId?: string | null;
        }>;
        const mappedSessions: Session[] = allSessions.map((s) => ({
          sessionId: s.sessionId,
          courseId: s.courseId,
          instructorId: s.instructorId ?? null,
        }));
        if (!active) return;
        setCourses(allCourses);
        setSessions(mappedSessions);
      } catch (e: unknown) {
        if (active) setErr(e instanceof Error ? e.message : 'Failed to load trainings');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [user]);

  const myCourseIds = useMemo(() => {
    if (!meId) return new Set<string>();
    return new Set(sessions.filter((s) => s.instructorId === meId).map((s) => s.courseId));
  }, [sessions, meId]);

  const myCourses = useMemo(() => {
    return courses.filter((c) => myCourseIds.has(c.courseId));
  }, [courses, myCourseIds]);

  // Helpers for styling badges
  const statusStyles = (status: Course['status']) => {
    switch (status) {
      case 'Published':
        return 'bg-light-green text-green border border-light-green/70';
      case 'Draft':
        return 'bg-gray-100 text-gray-700 border border-gray-200';
      case 'Archived':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const levelLabel = (lvl: Course['level']) =>
    ({ beginner: 'Beginner', intermediate: 'Intermediate', expert: 'Expert' })[lvl];

  return (
    <div className="mx-4 my-8 space-y-6 md:mx-12 lg:mx-32">
      <SectionWrapper variant="green" className="py-8">
        <H1 className="text-white">My Trainings</H1>
        <H2 className="mt-2 text-white/90">Create and manage your courses.</H2>
        <div className="mt-4 flex items-center justify-center">
          <Link href="/mentor/trainings/new">
            <Button modifier="bg-white text-green !border-green hover:bg-green hover:text-white hover:border-green">
              New Training
            </Button>
          </Link>
        </div>
      </SectionWrapper>

      <SectionWrapper title="Your Courses" className="bg-white">
        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : err ? (
          <div className="text-red-600">{err}</div>
        ) : myCourses.length === 0 ? (
          <div className="py-8 text-center text-gray-600">
            No trainings yet. Click “New Training” to get started.
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {myCourses.map((c) => (
              <li key={c.courseId}>
                <div className="group to-light-green/20 relative h-full rounded-2xl border border-gray-100 bg-gradient-to-br from-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                  {/* Card body */}
                  <div className="flex h-full flex-col p-5">
                    {/* Icon + Title */}
                    <div className="flex items-start gap-3">
                      <div className="bg-light-green text-green border-light-green/70 shrink-0 rounded-xl border p-2">
                        <BookOpen size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-green line-clamp-2 text-base leading-6 font-semibold">
                          {c.title}
                        </div>
                        <p className="mt-1 line-clamp-3 text-sm text-gray-600">
                          {c.description || 'No description provided.'}
                        </p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="mt-4 flex items-center gap-2">
                      <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] tracking-wide text-gray-700 uppercase">
                        {levelLabel(c.level)}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] tracking-wide ${statusStyles(
                          c.status,
                        )}`}
                      >
                        {c.status}
                      </span>
                      {c.status === 'Published' && (
                        <span className="text-green ml-auto inline-flex items-center gap-1 text-[11px]">
                          <BadgeCheck size={14} />
                          Live
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="text-xs text-gray-500">
                        Course ID: {c.courseId.slice(0, 8)}…
                      </div>
                      <Link href={`/mentor/trainings/${c.courseId}`}>
                        <Button modifier="!py-1.5 !px-3">Manage</Button>
                      </Link>
                    </div>
                  </div>

                  {/* Hover ring */}
                  <div className="ring-green/0 group-hover:ring-green/20 pointer-events-none absolute inset-0 rounded-2xl ring-0 transition group-hover:ring-2" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionWrapper>
    </div>
  );
}
