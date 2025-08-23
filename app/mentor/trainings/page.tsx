"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { H1, H2 } from "@/components/Heading";
import SectionWrapper from "@/components/section-wrapper";
import Button from "@/components/button";
import { BookOpen, BadgeCheck } from "lucide-react";

type Course = {
  courseId: string;
  title: string;
  description: string | null;
  level: "beginner" | "intermediate" | "expert";
  status: "Draft" | "Published" | "Archived";
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
          const resUsers = await fetch("/api/users?role=trainer", {
            cache: "no-store",
          });
          const users: Array<{ userId: string; clerkId?: string | null }> =
            await resUsers.json();
          myId = users.find((u) => u.clerkId === user.id)?.userId ?? null;
          if (!myId) {
            const resAdmins = await fetch("/api/users?role=admin", {
              cache: "no-store",
            });
            const admins: Array<{ userId: string; clerkId?: string | null }> =
              await resAdmins.json();
            myId = admins.find((u) => u.clerkId === user.id)?.userId ?? null;
          }
        }
        if (!active) return;
        setMeId(myId);

        const [resCourses, resSessions] = await Promise.all([
          fetch("/api/trainings", { cache: "no-store" }),
          fetch("/api/training-sessions", { cache: "no-store" }),
        ]);
        const allCourses: Course[] = await resCourses.json();
        const allSessions: any[] = await resSessions.json();
        const mappedSessions: Session[] = allSessions.map((s) => ({
          sessionId: s.sessionId,
          courseId: s.courseId,
          instructorId: s.instructorId ?? null,
        }));
        if (!active) return;
        setCourses(allCourses);
        setSessions(mappedSessions);
      } catch (e: any) {
        if (active) setErr(e?.message || "Failed to load trainings");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [user]);

  const myCourseIds = useMemo(() => {
    if (!meId) return new Set<string>();
    return new Set(
      sessions.filter((s) => s.instructorId === meId).map((s) => s.courseId)
    );
  }, [sessions, meId]);

  const myCourses = useMemo(() => {
    return courses.filter((c) => myCourseIds.has(c.courseId));
  }, [courses, myCourseIds]);

  // Helpers for styling badges
  const statusStyles = (status: Course["status"]) => {
    switch (status) {
      case "Published":
        return "bg-light-green text-green border border-light-green/70";
      case "Draft":
        return "bg-gray-100 text-gray-700 border border-gray-200";
      case "Archived":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const levelLabel = (lvl: Course["level"]) =>
    ({ beginner: "Beginner", intermediate: "Intermediate", expert: "Expert" }[
      lvl
    ]);

  return (
    <div className="lg:mx-32 md:mx-12 mx-4 my-8 space-y-6">
      <SectionWrapper variant="green" className="py-8">
        <H1 className="text-white">My Trainings</H1>
        <H2 className="text-white/90 mt-2">Create and manage your courses.</H2>
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
          <div className="text-gray-600 text-center py-8">
            No trainings yet. Click “New Training” to get started.
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {myCourses.map((c) => (
              <li key={c.courseId}>
                <div className="group relative h-full rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-light-green/20 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                  {/* Card body */}
                  <div className="p-5 flex flex-col h-full">
                    {/* Icon + Title */}
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 rounded-xl bg-light-green p-2 text-green border border-light-green/70">
                        <BookOpen size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-green text-base leading-6 line-clamp-2">
                          {c.title}
                        </div>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-3">
                          {c.description || "No description provided."}
                        </p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full bg-white text-gray-700 border border-gray-200">
                        {levelLabel(c.level)}
                      </span>
                      <span
                        className={`text-[11px] tracking-wide px-2.5 py-1 rounded-full ${statusStyles(
                          c.status
                        )}`}
                      >
                        {c.status}
                      </span>
                      {c.status === "Published" && (
                        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-green">
                          <BadgeCheck size={14} />
                          Live
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Course ID: {c.courseId.slice(0, 8)}…
                      </div>
                      <Link href={`/mentor/trainings/${c.courseId}`}>
                        <Button modifier="!py-1.5 !px-3">Manage</Button>
                      </Link>
                    </div>
                  </div>

                  {/* Hover ring */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-green/0 group-hover:ring-2 group-hover:ring-green/20 transition" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionWrapper>
    </div>
  );
}
