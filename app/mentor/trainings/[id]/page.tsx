"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { H1, H2 } from "@/components/Heading";
import SectionWrapper from "@/components/section-wrapper";
import Button from "@/components/button";
import { useUser } from "@clerk/nextjs";

type Course = {
  courseId: string;
  title: string;
  description: string | null;
  duration: string | null;
  price: string | null;
  whyThisCourse: string | null;
  level: "beginner" | "intermediate" | "expert";
  status: "Draft" | "Published" | "Archived";
};

type Module = {
  moduleId?: string;
  title: string;
  content: string;
  contentType: "Video" | "Text" | "Quiz";
  order: number;
};

type Enrollment = {
  enrollmentId: string;
  userId: string;
  courseId: string;
  userName?: string | null;
  userLastName?: string | null;
  userEmail?: string | null;
  progressPercentage: number;
  completionStatus: string;
};

type Session = {
  sessionId: string;
  courseId: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  instructorId: string | null;
  maxParticipants: number | null;
  instructorName?: string | null;
};

export default function ManageTrainingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [resources, setResources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [meUserId, setMeUserId] = useState<string | null>(null);
  // New session form state
  const [newStart, setNewStart] = useState<string>(""); // datetime-local
  const [newEnd, setNewEnd] = useState<string>("");
  const [newMax, setNewMax] = useState<string>("");
  // Edit session state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStart, setEditStart] = useState<string>("");
  const [editEnd, setEditEnd] = useState<string>("");
  const [editMax, setEditMax] = useState<string>("");

  // Mini navbar setup
  const sections = [
    { id: "details", label: "Edit" },
    { id: "modules", label: "Modules" },
    { id: "sessions", label: "Sessions" },
    { id: "enrollments", label: "Enrolled Users" },
    { id: "resources", label: "Resources" },
  ] as const;
  const [activeSection, setActiveSection] =
    useState<(typeof sections)[number]["id"]>("details");

  // Show only the selected section from the mini navbar

  useEffect(() => {
    // Determine if current user is an admin (admins can change status)
    let mounted = true;
    const checkAdmin = async () => {
      try {
        if (!user?.id) return;
        // Fetch all users to determine my DB userId and admin role
        const res = await fetch("/api/users", { cache: "no-store" });
        if (!res.ok) return;
        const users: Array<{
          userId: string;
          clerkId?: string | null;
          role?: string | null;
        }> = await res.json();
        if (!mounted) return;
        const me = users.find((u) => u.clerkId === user.id);
        setMeUserId(me?.userId ?? null);
        setIsAdmin((me?.role ?? "") === "admin");
      } catch {
        /* noop */
      }
    };
    checkAdmin();
    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const [cRes, mRes, eRes, sRes] = await Promise.all([
          fetch(`/api/trainings/${id}`, { cache: "no-store" }),
          fetch(`/api/trainings/${id}/modules`, { cache: "no-store" }),
          fetch(`/api/enrollments`, { cache: "no-store" }),
          fetch(`/api/training-sessions`, { cache: "no-store" }),
        ]);
        if (!cRes.ok) throw new Error("Training not found");
        const c: Course = await cRes.json();
        const m: Module[] = await mRes.json();
        const eAll: any[] = await eRes.json();
        const sAll: any[] = await sRes.json();
        const e: Enrollment[] = eAll
          .filter((x) => x.courseId === id)
          .map((x) => ({
            enrollmentId: x.enrollmentId,
            userId: x.userId,
            courseId: x.courseId,
            userName: x.userName,
            userLastName: x.userLastName,
            userEmail: x.userEmail,
            progressPercentage: x.progressPercentage,
            completionStatus: x.completionStatus,
          }));
        const s: Session[] = sAll
          .filter((x) => x.courseId === id)
          .map((x) => ({
            sessionId: x.sessionId,
            courseId: x.courseId,
            startTime: x.startTime,
            endTime: x.endTime,
            instructorId: x.instructorId ?? null,
            maxParticipants: x.maxParticipants ?? null,
            instructorName: x.instructorName ?? null,
          }));
        if (!active) return;
        setCourse(c);
        setModules(m.sort((a, b) => a.order - b.order));
        setEnrollments(e);
        setSessions(
          s.sort(
            (a, b) =>
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          )
        );
      } catch (e: any) {
        if (active) setErr(e?.message || "Failed to load training");
      } finally {
        if (active) setLoading(false);
      }
    };
    if (id) load();
    return () => {
      active = false;
    };
  }, [id]);

  const updateCourse = async (patch: Partial<Course>) => {
    const res = await fetch(`/api/trainings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error("Failed to update training");
    const updated: Course = await res.json();
    setCourse(updated);
  };

  const saveModules = async () => {
    const res = await fetch(`/api/trainings/${id}/modules`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modules }),
    });
    if (!res.ok) throw new Error("Failed to save modules");
    const saved = await res.json();
    setModules(saved.sort((a: Module, b: Module) => a.order - b.order));
  };

  const setCompletion = async (enrollmentId: string, status: string) => {
    const res = await fetch(`/api/enrollments/${enrollmentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completionStatus: status }),
    });
    if (!res.ok) throw new Error("Failed to update completion");
    const updated = await res.json();
    setEnrollments((prev) =>
      prev.map((e) =>
        e.enrollmentId === updated.enrollmentId
          ? { ...e, completionStatus: updated.completionStatus }
          : e
      )
    );
  };

  const requestCertificate = async (enr: Enrollment) => {
    if (!course) return;
    // minimal POST to certificates API; mentor can refine later on dedicated UI
    const now = new Date();
    const res = await fetch(`/api/certificates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: enr.userId,
        courseId: course.courseId,
        fullName:
          `${enr.userName ?? ""} ${enr.userLastName ?? ""}`.trim() ||
          "Participant",
        title: course.title,
        description: course.description ?? "",
        courseStartDate: now.toISOString().slice(0, 10),
        courseEndDate: now.toISOString().slice(0, 10),
        issueDate: now.toISOString().slice(0, 10),
        validUntil: null,
        pdfUrl: "",
        certificateHash: "temp", // server generates
      }),
    });
    if (!res.ok) {
      alert("Failed to request certificate");
    } else {
      alert("Certificate requested/created");
    }
  };

  const addResource = (url: string) => {
    if (!url) return;
    setResources((prev) => Array.from(new Set([...prev, url])));
  };

  const removeResource = (url: string) => {
    setResources((prev) => prev.filter((u) => u !== url));
  };

  // Sessions CRUD helpers
  const createSession = async () => {
    if (!course) return;
    if (!newStart || !newEnd) {
      alert("Start and End time are required");
      return;
    }
    const payload = {
      courseId: course.courseId,
      startTime: new Date(newStart).toISOString(),
      endTime: new Date(newEnd).toISOString(),
      instructorId: meUserId,
      maxParticipants: newMax ? Number(newMax) : null,
    };
    const res = await fetch(`/api/training-sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      alert("Failed to create session");
      return;
    }
    const created: Session = await res.json();
    setSessions((prev) =>
      [...prev, created].sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )
    );
    setNewStart("");
    setNewEnd("");
    setNewMax("");
  };

  const startEditSession = (s: Session) => {
    setEditingId(s.sessionId);
    const toLocalInput = (iso: string) => {
      const d = new Date(iso);
      const pad = (n: number) => String(n).padStart(2, "0");
      const yyyy = d.getFullYear();
      const mm = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      const hh = pad(d.getHours());
      const min = pad(d.getMinutes());
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    };
    setEditStart(toLocalInput(s.startTime));
    setEditEnd(toLocalInput(s.endTime));
    setEditMax(s.maxParticipants != null ? String(s.maxParticipants) : "");
  };

  const saveEditSession = async () => {
    if (!editingId) return;
    const res = await fetch(`/api/training-sessions/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startTime: editStart ? new Date(editStart).toISOString() : undefined,
        endTime: editEnd ? new Date(editEnd).toISOString() : undefined,
        maxParticipants: editMax ? Number(editMax) : null,
      }),
    });
    if (!res.ok) {
      alert("Failed to update session");
      return;
    }
    const updated: Session = await res.json();
    setSessions((prev) =>
      prev
        .map((s) =>
          s.sessionId === updated.sessionId ? { ...s, ...updated } : s
        )
        .sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )
    );
    setEditingId(null);
    setEditStart("");
    setEditEnd("");
    setEditMax("");
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm("Delete this session?")) return;
    const res = await fetch(`/api/training-sessions/${sessionId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert("Failed to delete session");
      return;
    }
    setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
  };

  if (loading)
    return <div className="lg:mx-32 md:mx-12 mx-4 my-8">Loading…</div>;
  if (err)
    return (
      <div className="lg:mx-32 md:mx-12 mx-4 my-8 text-red-600">{err}</div>
    );
  if (!course)
    return <div className="lg:mx-32 md:mx-12 mx-4 my-8">Not found</div>;

  return (
    <div className="lg:mx-32 md:mx-12 mx-4 my-8 space-y-6">
      {/* Hero */}
      <SectionWrapper variant="green" className="py-8">
        <H1 className="text-white">Manage: {course.title}</H1>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full bg-white text-gray-800 border border-white/60">
            {course.level}
          </span>
          <span
            className={
              course.status === "Published"
                ? "text-[11px] tracking-wide px-2.5 py-1 rounded-full bg-light-green text-green border border-light-green/70"
                : course.status === "Draft"
                ? "text-[11px] tracking-wide px-2.5 py-1 rounded-full bg-white/90 text-gray-800 border border-white/60"
                : "text-[11px] tracking-wide px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200"
            }
          >
            {course.status}
          </span>
        </div>
        <H2 className="text-white/90 mt-2">
          Edit details, modules, and enrollments.
        </H2>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button
            secondary
            modifier="!text-red-600 !border-red-200 !bg-white"
            onClick={async () => {
              if (!confirm("Delete this training?")) return;
              const res = await fetch(`/api/trainings/${id}`, {
                method: "DELETE",
              });
              if (res.ok) router.push("/mentor/trainings");
            }}
          >
            Delete
          </Button>
        </div>
      </SectionWrapper>

      {/* Sticky mini navbar */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100">
        <nav className="max-w-screen-xl mx-auto px-2 sm:px-4">
          <ul className="flex gap-2 overflow-x-auto py-2">
            {sections.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setActiveSection(s.id)}
                  aria-current={activeSection === s.id ? "page" : undefined}
                  className={
                    activeSection === s.id
                      ? "text-green bg-light-green/60 border border-light-green rounded-full px-3 py-1 text-sm"
                      : "text-gray-700 hover:text-green border border-transparent hover:border-light-green rounded-full px-3 py-1 text-sm"
                  }
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Details */}
      {activeSection === "details" && (
        <div id="details">
          <SectionWrapper title="Details" className="bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green">
                  Title
                </label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-green focus:border-light-green/60"
                  value={course.title}
                  onChange={(e) =>
                    setCourse({ ...course, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green">
                  Level
                </label>
                <select
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-green focus:border-light-green/60"
                  value={course.level}
                  onChange={(e) =>
                    setCourse({
                      ...course,
                      level: e.target.value as Course["level"],
                    })
                  }
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-green">
                  Description
                </label>
                <textarea
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-green focus:border-light-green/60"
                  rows={4}
                  value={course.description ?? ""}
                  onChange={(e) =>
                    setCourse({ ...course, description: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green">
                  Status
                </label>
                <select
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-green focus:border-light-green/60"
                  value={course.status}
                  onChange={(e) =>
                    setCourse({
                      ...course,
                      status: e.target.value as Course["status"],
                    })
                  }
                  disabled={!isAdmin}
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
                {!isAdmin && (
                  <p className="mt-1 text-xs text-gray-500">
                    Only admins can change status. New trainings start as Draft
                    until approved.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-green">
                  Duration
                </label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-green focus:border-light-green/60"
                  value={course.duration ?? ""}
                  onChange={(e) =>
                    setCourse({ ...course, duration: e.target.value })
                  }
                  placeholder="e.g. 1 day (8 hours)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green">
                  Price
                </label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-green focus:border-light-green/60"
                  value={course.price ?? ""}
                  onChange={(e) =>
                    setCourse({ ...course, price: e.target.value })
                  }
                  placeholder="e.g. €199 or 199 TND"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-green">
                  Why this course?
                </label>
                <textarea
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-green focus:border-light-green/60"
                  rows={3}
                  value={course.whyThisCourse ?? ""}
                  onChange={(e) =>
                    setCourse({ ...course, whyThisCourse: e.target.value })
                  }
                  placeholder="Explain the key benefits and outcomes."
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3 justify-end">
              <Button
                primary
                onClick={() =>
                  updateCourse({
                    title: course.title,
                    description: course.description,
                    level: course.level,
                    status: course.status,
                    duration: course.duration,
                    price: course.price,
                    whyThisCourse: course.whyThisCourse,
                  })
                }
              >
                Save Details
              </Button>
            </div>
          </SectionWrapper>
        </div>
      )}

      {/* Sessions */}
      {activeSection === "sessions" && (
        <div id="sessions">
          <SectionWrapper title="Schedule Sessions" className="bg-white">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-sm font-medium text-green">
                    Start
                  </label>
                  <input
                    type="datetime-local"
                    className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-green focus:border-light-green/60"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green">
                    End
                  </label>
                  <input
                    type="datetime-local"
                    className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-green focus:border-light-green/60"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green">
                    Max participants
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-green focus:border-light-green/60"
                    value={newMax}
                    onChange={(e) => setNewMax(e.target.value)}
                    placeholder="e.g. 25"
                  />
                </div>
                <div className="md:col-span-2 flex items-end">
                  <Button primary onClick={createSession}>
                    Add Session
                  </Button>
                </div>
              </div>

              {sessions.length === 0 ? (
                <div className="text-gray-600">No sessions scheduled yet.</div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-green/10">
                  <table className="min-w-full text-sm">
                    <thead className="bg-light-green/40">
                      <tr className="text-left">
                        <th className="py-2 px-3 text-green">Start</th>
                        <th className="py-2 px-3 text-green">End</th>
                        <th className="py-2 px-3 text-green">Instructor</th>
                        <th className="py-2 px-3 text-green">Max</th>
                        <th className="py-2 px-3 text-green">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((s, i) => (
                        <tr
                          key={s.sessionId}
                          className={i % 2 ? "bg-white" : "bg-gray-50/60"}
                        >
                          <td className="py-2 px-3">
                            {editingId === s.sessionId ? (
                              <input
                                type="datetime-local"
                                className="border rounded px-2 py-1"
                                value={editStart}
                                onChange={(e) => setEditStart(e.target.value)}
                              />
                            ) : (
                              new Date(s.startTime).toLocaleString()
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {editingId === s.sessionId ? (
                              <input
                                type="datetime-local"
                                className="border rounded px-2 py-1"
                                value={editEnd}
                                onChange={(e) => setEditEnd(e.target.value)}
                              />
                            ) : (
                              new Date(s.endTime).toLocaleString()
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {s.instructorName || "—"}
                          </td>
                          <td className="py-2 px-3">
                            {editingId === s.sessionId ? (
                              <input
                                type="number"
                                className="border rounded px-2 py-1"
                                value={editMax}
                                onChange={(e) => setEditMax(e.target.value)}
                              />
                            ) : (
                              s.maxParticipants ?? "—"
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {editingId === s.sessionId ? (
                              <div className="flex gap-2">
                                <Button
                                  secondary
                                  modifier="!py-1 !px-3"
                                  onClick={saveEditSession}
                                >
                                  Save
                                </Button>
                                <Button
                                  secondary
                                  modifier="!py-1 !px-3"
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditStart("");
                                    setEditEnd("");
                                    setEditMax("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <Button
                                  secondary
                                  modifier="!py-1 !px-3"
                                  onClick={() => startEditSession(s)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  secondary
                                  modifier="!py-1 !px-3 !text-red-600 !border-red-200"
                                  onClick={() => deleteSession(s.sessionId)}
                                >
                                  Delete
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </SectionWrapper>
        </div>
      )}

      {/* Modules */}
      {activeSection === "modules" && (
        <div id="modules">
          <SectionWrapper title="Modules" className="bg-white">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">
                Define the learning units of this course.
              </p>
              <Button
                secondary
                modifier="!py-1 !px-3"
                onClick={() =>
                  setModules((prev) => [
                    ...prev,
                    {
                      title: "New Module",
                      content: "",
                      contentType: "Text",
                      order: prev.length + 1,
                    },
                  ])
                }
              >
                Add Module
              </Button>
            </div>
            <ul className="space-y-3">
              {modules.map((m, idx) => (
                <li
                  key={idx}
                  className="rounded-xl border border-green/10 p-3 space-y-2 bg-gray-50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-light-green focus:border-light-green/60"
                      value={m.title}
                      onChange={(e) =>
                        setModules((prev) =>
                          prev.map((x, i) =>
                            i === idx ? { ...x, title: e.target.value } : x
                          )
                        )
                      }
                    />
                    <select
                      className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-light-green focus:border-light-green/60"
                      value={m.contentType}
                      onChange={(e) =>
                        setModules((prev) =>
                          prev.map((x, i) =>
                            i === idx
                              ? {
                                  ...x,
                                  contentType: e.target
                                    .value as Module["contentType"],
                                }
                              : x
                          )
                        )
                      }
                    >
                      <option value="Text">Text</option>
                      <option value="Video">Video</option>
                      <option value="Quiz">Quiz</option>
                    </select>
                    <input
                      type="number"
                      className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-light-green focus:border-light-green/60"
                      value={m.order}
                      onChange={(e) =>
                        setModules((prev) =>
                          prev.map((x, i) =>
                            i === idx
                              ? { ...x, order: Number(e.target.value) }
                              : x
                          )
                        )
                      }
                    />
                    <Button
                      secondary
                      modifier="!py-1 !px-3 !text-red-600 !border-red-200"
                      onClick={() =>
                        setModules((prev) => prev.filter((_, i) => i !== idx))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                  <textarea
                    className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-light-green focus:border-light-green/60"
                    rows={3}
                    value={m.content}
                    onChange={(e) =>
                      setModules((prev) =>
                        prev.map((x, i) =>
                          i === idx ? { ...x, content: e.target.value } : x
                        )
                      )
                    }
                  />
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Button primary onClick={saveModules}>
                Save Modules
              </Button>
            </div>
          </SectionWrapper>
        </div>
      )}

      {/* Enrolled users */}
      {activeSection === "enrollments" && (
        <div id="enrollments">
          <SectionWrapper title="Enrolled Users" className="bg-white">
            {enrollments.length === 0 ? (
              <div className="text-gray-600">No enrollments yet.</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-green/10">
                <table className="min-w-full text-sm">
                  <thead className="bg-light-green/40">
                    <tr className="text-left">
                      <th className="py-2 px-3 text-green">Name</th>
                      <th className="py-2 px-3 text-green">Email</th>
                      <th className="py-2 px-3 text-green">Progress</th>
                      <th className="py-2 px-3 text-green">Status</th>
                      <th className="py-2 px-3 text-green">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((e, i) => (
                      <tr
                        key={e.enrollmentId}
                        className={i % 2 ? "bg-white" : "bg-gray-50/60"}
                      >
                        <td className="py-2 px-3">{`${e.userName ?? ""} ${
                          e.userLastName ?? ""
                        }`}</td>
                        <td className="py-2 px-3">{e.userEmail}</td>
                        <td className="py-2 px-3">{e.progressPercentage}%</td>
                        <td className="py-2 px-3">{e.completionStatus}</td>
                        <td className="py-2 px-3">
                          <div className="flex gap-2">
                            <Button
                              secondary
                              modifier="!py-1 !px-3 !text-green !border-green/30"
                              onClick={() =>
                                setCompletion(e.enrollmentId, "completed")
                              }
                            >
                              Mark Completed
                            </Button>
                            <Button
                              secondary
                              modifier="!py-1 !px-3 !text-blue-700 !border-blue-200"
                              onClick={() => requestCertificate(e)}
                            >
                              Request Certificate
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionWrapper>
        </div>
      )}

      {/* Resources */}
      {activeSection === "resources" && (
        <div id="resources">
          <SectionWrapper title="Resources" className="bg-white">
            <div className="flex gap-2">
              <input
                id="resInput"
                className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-green focus:border-light-green/60"
                placeholder="https://…"
              />
              <Button
                primary
                onClick={() => {
                  const el = document.getElementById(
                    "resInput"
                  ) as HTMLInputElement | null;
                  if (!el) return;
                  addResource(el.value.trim());
                  el.value = "";
                }}
              >
                Add
              </Button>
            </div>
            {resources.length === 0 ? (
              <div className="text-sm text-gray-600 mt-3">
                No resources added.
              </div>
            ) : (
              <ul className="space-y-2 mt-3">
                {resources.map((u) => (
                  <li key={u} className="flex items-center justify-between">
                    <a
                      className="text-blue-700 hover:underline"
                      href={u}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {u}
                    </a>
                    <Button
                      secondary
                      modifier="!py-1 !px-3 !text-red-600 !border-red-200"
                      onClick={() => removeResource(u)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-gray-500 mt-3">
              Note: This prototype stores resources client-side only. We can add
              a backend table later (training_resources) to persist
              uploads/links.
            </p>
          </SectionWrapper>
        </div>
      )}
    </div>
  );
}
