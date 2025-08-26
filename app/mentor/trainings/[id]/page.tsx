'use client';

import { useEffect, useState } from 'react';

import { useUser } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';

import Button from '@/components/button';
import { H1, H2 } from '@/components/Heading';
import SectionWrapper from '@/components/section-wrapper';

type Course = {
  courseId: string;
  title: string;
  description: string | null;
  duration: string | null;
  price: string | null;
  whyThisCourse: string | null;
  level: 'beginner' | 'intermediate' | 'expert';
  status: 'Draft' | 'Published' | 'Archived';
};

type Module = {
  moduleId?: string;
  title: string;
  content: string;
  contentType: 'Video' | 'Text' | 'Quiz';
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
  const [newStart, setNewStart] = useState<string>(''); // datetime-local
  const [newEnd, setNewEnd] = useState<string>('');
  const [newMax, setNewMax] = useState<string>('');
  // Edit session state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStart, setEditStart] = useState<string>('');
  const [editEnd, setEditEnd] = useState<string>('');
  const [editMax, setEditMax] = useState<string>('');

  // Mini navbar setup
  const sections = [
    { id: 'details', label: 'Edit' },
    { id: 'modules', label: 'Modules' },
    { id: 'sessions', label: 'Sessions' },
    { id: 'enrollments', label: 'Enrolled Users' },
    { id: 'resources', label: 'Resources' },
  ] as const;
  const [activeSection, setActiveSection] = useState<(typeof sections)[number]['id']>('details');

  // Show only the selected section from the mini navbar

  useEffect(() => {
    // Determine if current user is an admin (admins can change status)
    let mounted = true;
    const checkAdmin = async () => {
      try {
        if (!user?.id) return;
        // Fetch all users to determine my DB userId and admin role
        const res = await fetch('/api/users', { cache: 'no-store' });
        if (!res.ok) return;
        const users = (await res.json()) as unknown as Array<{
          userId: string;
          clerkId?: string | null;
          role?: string | null;
        }>;
        if (!mounted) return;
        const me = users.find((u) => u.clerkId === user.id);
        setMeUserId(me?.userId ?? null);
        setIsAdmin((me?.role ?? '') === 'admin');
      } catch {
        /* noop */
      }
    };
    void checkAdmin();
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
          fetch(`/api/trainings/${id}`, { cache: 'no-store' }),
          fetch(`/api/trainings/${id}/modules`, { cache: 'no-store' }),
          fetch(`/api/enrollments`, { cache: 'no-store' }),
          fetch(`/api/training-sessions`, { cache: 'no-store' }),
        ]);
        if (!cRes.ok) throw new Error('Training not found');
        const c = (await cRes.json()) as unknown as Course;
        const m = (await mRes.json()) as unknown as Module[];
        const eAll = (await eRes.json()) as unknown as Array<{
          enrollmentId: string;
          userId: string;
          courseId: string;
          userName?: string | null;
          userLastName?: string | null;
          userEmail?: string | null;
          progressPercentage: number;
          completionStatus: string;
        }>;
        const sAll = (await sRes.json()) as unknown as Array<{
          sessionId: string;
          courseId: string;
          startTime: string;
          endTime: string;
          instructorId?: string | null;
          maxParticipants?: number | null;
          instructorName?: string | null;
        }>;
        const e: Enrollment[] = eAll
          .filter((x) => x.courseId === id)
          .map((x) => ({
            enrollmentId: x.enrollmentId,
            userId: x.userId,
            courseId: x.courseId,
            userName: x.userName ?? null,
            userLastName: x.userLastName ?? null,
            userEmail: x.userEmail ?? null,
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
        setModules(m.sort((a: Module, b: Module) => a.order - b.order));
        setEnrollments(e);
        setSessions(
          s.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
        );
      } catch (e: unknown) {
        if (active) setErr(e instanceof Error ? e.message : 'Failed to load training');
      } finally {
        if (active) setLoading(false);
      }
    };
    if (id) void load();
    return () => {
      active = false;
    };
  }, [id]);

  const updateCourse = async (patch: Partial<Course>) => {
    const res = await fetch(`/api/trainings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error('Failed to update training');
    const updated = (await res.json()) as unknown as Course;
    setCourse(updated);
  };

  const saveModules = async () => {
    const res = await fetch(`/api/trainings/${id}/modules`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modules }),
    });
    if (!res.ok) throw new Error('Failed to save modules');
    const saved = (await res.json()) as unknown as Module[];
    setModules(saved.sort((a, b) => a.order - b.order));
  };

  const setCompletion = async (enrollmentId: string, status: string) => {
    const res = await fetch(`/api/enrollments/${enrollmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completionStatus: status }),
    });
    if (!res.ok) throw new Error('Failed to update completion');
    const updated = (await res.json()) as unknown as Enrollment;
    setEnrollments((prev) =>
      prev.map((e) =>
        e.enrollmentId === updated.enrollmentId
          ? { ...e, completionStatus: updated.completionStatus }
          : e,
      ),
    );
  };

  const requestCertificate = async (enr: Enrollment) => {
    if (!course) return;
    // minimal POST to certificates API; mentor can refine later on dedicated UI
    const now = new Date();
    const res = await fetch(`/api/certificates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: enr.userId,
        courseId: course.courseId,
        fullName: `${enr.userName ?? ''} ${enr.userLastName ?? ''}`.trim() || 'Participant',
        title: course.title,
        description: course.description ?? '',
        courseStartDate: now.toISOString().slice(0, 10),
        courseEndDate: now.toISOString().slice(0, 10),
        issueDate: now.toISOString().slice(0, 10),
        validUntil: null,
        pdfUrl: '',
        certificateHash: 'temp', // server generates
      }),
    });
    if (!res.ok) {
      alert('Failed to request certificate');
    } else {
      alert('Certificate requested/created');
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
      alert('Start and End time are required');
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      alert('Failed to create session');
      return;
    }
    const created = (await res.json()) as unknown as Session;
    setSessions((prev) =>
      [...prev, created].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      ),
    );
    setNewStart('');
    setNewEnd('');
    setNewMax('');
  };

  const startEditSession = (s: Session) => {
    setEditingId(s.sessionId);
    const toLocalInput = (iso: string) => {
      const d = new Date(iso);
      const pad = (n: number) => String(n).padStart(2, '0');
      const yyyy = d.getFullYear();
      const mm = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      const hh = pad(d.getHours());
      const min = pad(d.getMinutes());
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    };
    setEditStart(toLocalInput(s.startTime));
    setEditEnd(toLocalInput(s.endTime));
    setEditMax(s.maxParticipants != null ? String(s.maxParticipants) : '');
  };

  const saveEditSession = async () => {
    if (!editingId) return;
    const res = await fetch(`/api/training-sessions/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startTime: editStart ? new Date(editStart).toISOString() : undefined,
        endTime: editEnd ? new Date(editEnd).toISOString() : undefined,
        maxParticipants: editMax ? Number(editMax) : null,
      }),
    });
    if (!res.ok) {
      alert('Failed to update session');
      return;
    }
    const updated = (await res.json()) as unknown as Session;
    setSessions((prev) =>
      prev
        .map((s) => (s.sessionId === updated.sessionId ? { ...s, ...updated } : s))
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    );
    setEditingId(null);
    setEditStart('');
    setEditEnd('');
    setEditMax('');
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Delete this session?')) return;
    const res = await fetch(`/api/training-sessions/${sessionId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      alert('Failed to delete session');
      return;
    }
    setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
  };

  if (loading) return <div className="mx-4 my-8 md:mx-12 lg:mx-32">Loading…</div>;
  if (err) return <div className="mx-4 my-8 text-red-600 md:mx-12 lg:mx-32">{err}</div>;
  if (!course) return <div className="mx-4 my-8 md:mx-12 lg:mx-32">Not found</div>;

  return (
    <div className="mx-4 my-8 space-y-6 md:mx-12 lg:mx-32">
      {/* Hero */}
      <SectionWrapper variant="green" className="py-8">
        <H1 className="text-white">Manage: {course.title}</H1>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full border border-white/60 bg-white px-2.5 py-1 text-[11px] tracking-wide text-gray-800 uppercase">
            {course.level}
          </span>
          <span
            className={
              course.status === 'Published'
                ? 'bg-light-green text-green border-light-green/70 rounded-full border px-2.5 py-1 text-[11px] tracking-wide'
                : course.status === 'Draft'
                  ? 'rounded-full border border-white/60 bg-white/90 px-2.5 py-1 text-[11px] tracking-wide text-gray-800'
                  : 'rounded-full border border-yellow-200 bg-yellow-100 px-2.5 py-1 text-[11px] tracking-wide text-yellow-800'
            }
          >
            {course.status}
          </span>
        </div>
        <H2 className="mt-2 text-white/90">Edit details, modules, and enrollments.</H2>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button
            secondary
            modifier="!text-red-600 !border-red-200 !bg-white"
            onClick={() => {
              void (async () => {
                if (!confirm('Delete this training?')) return;
                const res = await fetch(`/api/trainings/${id}`, {
                  method: 'DELETE',
                });
                if (res.ok) router.push('/mentor/trainings');
              })();
            }}
          >
            Delete
          </Button>
        </div>
      </SectionWrapper>

      {/* Sticky mini navbar */}
      <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur">
        <nav className="mx-auto max-w-screen-xl px-2 sm:px-4">
          <ul className="flex gap-2 overflow-x-auto py-2">
            {sections.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setActiveSection(s.id)}
                  aria-current={activeSection === s.id ? 'page' : undefined}
                  className={
                    activeSection === s.id
                      ? 'text-green bg-light-green/60 border-light-green rounded-full border px-3 py-1 text-sm'
                      : 'hover:text-green hover:border-light-green rounded-full border border-transparent px-3 py-1 text-sm text-gray-700'
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
      {activeSection === 'details' && (
        <div id="details">
          <SectionWrapper title="Details" className="bg-white">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-green block text-sm font-medium">Title</label>
                <input
                  className="focus:ring-light-green focus:border-light-green/60 mt-1 w-full rounded border px-3 py-2 focus:ring-2 focus:outline-none"
                  value={course.title}
                  onChange={(e) => setCourse({ ...course, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-green block text-sm font-medium">Level</label>
                <select
                  className="focus:ring-light-green focus:border-light-green/60 mt-1 w-full rounded border px-3 py-2 focus:ring-2 focus:outline-none"
                  value={course.level}
                  onChange={(e) =>
                    setCourse({
                      ...course,
                      level: e.target.value as Course['level'],
                    })
                  }
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-green block text-sm font-medium">Description</label>
                <textarea
                  className="focus:ring-light-green focus:border-light-green/60 mt-1 w-full rounded border px-3 py-2 focus:ring-2 focus:outline-none"
                  rows={4}
                  value={course.description ?? ''}
                  onChange={(e) => setCourse({ ...course, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-green block text-sm font-medium">Status</label>
                <select
                  className="focus:ring-light-green focus:border-light-green/60 mt-1 w-full rounded border px-3 py-2 focus:ring-2 focus:outline-none"
                  value={course.status}
                  onChange={(e) =>
                    setCourse({
                      ...course,
                      status: e.target.value as Course['status'],
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
                    Only admins can change status. New trainings start as Draft until approved.
                  </p>
                )}
              </div>
              <div>
                <label className="text-green block text-sm font-medium">Duration</label>
                <input
                  className="focus:ring-light-green focus:border-light-green/60 mt-1 w-full rounded border px-3 py-2 focus:ring-2 focus:outline-none"
                  value={course.duration ?? ''}
                  onChange={(e) => setCourse({ ...course, duration: e.target.value })}
                  placeholder="e.g. 1 day (8 hours)"
                />
              </div>
              <div>
                <label className="text-green block text-sm font-medium">Price</label>
                <input
                  className="focus:ring-light-green focus:border-light-green/60 mt-1 w-full rounded border px-3 py-2 focus:ring-2 focus:outline-none"
                  value={course.price ?? ''}
                  onChange={(e) => setCourse({ ...course, price: e.target.value })}
                  placeholder="e.g. €199 or 199 TND"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-green block text-sm font-medium">Why this course?</label>
                <textarea
                  className="focus:ring-light-green focus:border-light-green/60 mt-1 w-full rounded border px-3 py-2 focus:ring-2 focus:outline-none"
                  rows={3}
                  value={course.whyThisCourse ?? ''}
                  onChange={(e) => setCourse({ ...course, whyThisCourse: e.target.value })}
                  placeholder="Explain the key benefits and outcomes."
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <Button
                primary
                onClick={() =>
                  void updateCourse({
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
      {activeSection === 'sessions' && (
        <div id="sessions">
          <SectionWrapper title="Schedule Sessions" className="bg-white">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                <div>
                  <label className="text-green block text-sm font-medium">Start</label>
                  <input
                    type="datetime-local"
                    className="focus:ring-light-green focus:border-light-green/60 mt-1 w-full rounded border px-3 py-2 focus:ring-2 focus:outline-none"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-green block text-sm font-medium">End</label>
                  <input
                    type="datetime-local"
                    className="focus:ring-light-green focus:border-light-green/60 mt-1 w-full rounded border px-3 py-2 focus:ring-2 focus:outline-none"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-green block text-sm font-medium">Max participants</label>
                  <input
                    type="number"
                    min={1}
                    className="focus:ring-light-green focus:border-light-green/60 mt-1 w-full rounded border px-3 py-2 focus:ring-2 focus:outline-none"
                    value={newMax}
                    onChange={(e) => setNewMax(e.target.value)}
                    placeholder="e.g. 25"
                  />
                </div>
                <div className="flex items-end md:col-span-2">
                  <Button
                    primary
                    onClick={() => {
                      void createSession();
                    }}
                  >
                    Add Session
                  </Button>
                </div>
              </div>

              {sessions.length === 0 ? (
                <div className="text-gray-600">No sessions scheduled yet.</div>
              ) : (
                <div className="border-green/10 overflow-x-auto rounded-xl border">
                  <table className="min-w-full text-sm">
                    <thead className="bg-light-green/40">
                      <tr className="text-left">
                        <th className="text-green px-3 py-2">Start</th>
                        <th className="text-green px-3 py-2">End</th>
                        <th className="text-green px-3 py-2">Instructor</th>
                        <th className="text-green px-3 py-2">Max</th>
                        <th className="text-green px-3 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((s, i) => (
                        <tr key={s.sessionId} className={i % 2 ? 'bg-white' : 'bg-gray-50/60'}>
                          <td className="px-3 py-2">
                            {editingId === s.sessionId ? (
                              <input
                                type="datetime-local"
                                className="rounded border px-2 py-1"
                                value={editStart}
                                onChange={(e) => setEditStart(e.target.value)}
                              />
                            ) : (
                              new Date(s.startTime).toLocaleString()
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {editingId === s.sessionId ? (
                              <input
                                type="datetime-local"
                                className="rounded border px-2 py-1"
                                value={editEnd}
                                onChange={(e) => setEditEnd(e.target.value)}
                              />
                            ) : (
                              new Date(s.endTime).toLocaleString()
                            )}
                          </td>
                          <td className="px-3 py-2">{s.instructorName || '—'}</td>
                          <td className="px-3 py-2">
                            {editingId === s.sessionId ? (
                              <input
                                type="number"
                                className="rounded border px-2 py-1"
                                value={editMax}
                                onChange={(e) => setEditMax(e.target.value)}
                              />
                            ) : (
                              (s.maxParticipants ?? '—')
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {editingId === s.sessionId ? (
                              <div className="flex gap-2">
                                <Button
                                  secondary
                                  modifier="!py-1 !px-3"
                                  onClick={() => {
                                    void saveEditSession();
                                  }}
                                >
                                  Save
                                </Button>
                                <Button
                                  secondary
                                  modifier="!py-1 !px-3"
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditStart('');
                                    setEditEnd('');
                                    setEditMax('');
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
                                  onClick={() => {
                                    void deleteSession(s.sessionId);
                                  }}
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
      {activeSection === 'modules' && (
        <div id="modules">
          <SectionWrapper title="Modules" className="bg-white">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-gray-600">Define the learning units of this course.</p>
              <Button
                secondary
                modifier="!py-1 !px-3"
                onClick={() =>
                  setModules((prev) => [
                    ...prev,
                    {
                      title: 'New Module',
                      content: '',
                      contentType: 'Text',
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
                  className="border-green/10 space-y-2 rounded-xl border bg-gray-50 p-3"
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <input
                      className="focus:ring-light-green focus:border-light-green/60 rounded border px-2 py-1 focus:ring-2 focus:outline-none"
                      value={m.title}
                      onChange={(e) =>
                        setModules((prev) =>
                          prev.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)),
                        )
                      }
                    />
                    <select
                      className="focus:ring-light-green focus:border-light-green/60 rounded border px-2 py-1 focus:ring-2 focus:outline-none"
                      value={m.contentType}
                      onChange={(e) =>
                        setModules((prev) =>
                          prev.map((x, i) =>
                            i === idx
                              ? {
                                  ...x,
                                  contentType: e.target.value as Module['contentType'],
                                }
                              : x,
                          ),
                        )
                      }
                    >
                      <option value="Text">Text</option>
                      <option value="Video">Video</option>
                      <option value="Quiz">Quiz</option>
                    </select>
                    <input
                      type="number"
                      className="focus:ring-light-green focus:border-light-green/60 rounded border px-2 py-1 focus:ring-2 focus:outline-none"
                      value={m.order}
                      onChange={(e) =>
                        setModules((prev) =>
                          prev.map((x, i) =>
                            i === idx ? { ...x, order: Number(e.target.value) } : x,
                          ),
                        )
                      }
                    />
                    <Button
                      secondary
                      modifier="!py-1 !px-3 !text-red-600 !border-red-200"
                      onClick={() => setModules((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      Remove
                    </Button>
                  </div>
                  <textarea
                    className="focus:ring-light-green focus:border-light-green/60 w-full rounded border px-2 py-1 focus:ring-2 focus:outline-none"
                    rows={3}
                    value={m.content}
                    onChange={(e) =>
                      setModules((prev) =>
                        prev.map((x, i) => (i === idx ? { ...x, content: e.target.value } : x)),
                      )
                    }
                  />
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Button
                primary
                onClick={() => {
                  void saveModules();
                }}
              >
                Save Modules
              </Button>
            </div>
          </SectionWrapper>
        </div>
      )}

      {/* Enrolled users */}
      {activeSection === 'enrollments' && (
        <div id="enrollments">
          <SectionWrapper title="Enrolled Users" className="bg-white">
            {enrollments.length === 0 ? (
              <div className="text-gray-600">No enrollments yet.</div>
            ) : (
              <div className="border-green/10 overflow-x-auto rounded-xl border">
                <table className="min-w-full text-sm">
                  <thead className="bg-light-green/40">
                    <tr className="text-left">
                      <th className="text-green px-3 py-2">Name</th>
                      <th className="text-green px-3 py-2">Email</th>
                      <th className="text-green px-3 py-2">Progress</th>
                      <th className="text-green px-3 py-2">Status</th>
                      <th className="text-green px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((e, i) => (
                      <tr key={e.enrollmentId} className={i % 2 ? 'bg-white' : 'bg-gray-50/60'}>
                        <td className="px-3 py-2">{`${e.userName ?? ''} ${
                          e.userLastName ?? ''
                        }`}</td>
                        <td className="px-3 py-2">{e.userEmail}</td>
                        <td className="px-3 py-2">{e.progressPercentage}%</td>
                        <td className="px-3 py-2">{e.completionStatus}</td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <Button
                              secondary
                              modifier="!py-1 !px-3 !text-green !border-green/30"
                              onClick={() => {
                                void setCompletion(e.enrollmentId, 'completed');
                              }}
                            >
                              Mark Completed
                            </Button>
                            <Button
                              secondary
                              modifier="!py-1 !px-3 !text-blue-700 !border-blue-200"
                              onClick={() => {
                                void requestCertificate(e);
                              }}
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
      {activeSection === 'resources' && (
        <div id="resources">
          <SectionWrapper title="Resources" className="bg-white">
            <div className="flex gap-2">
              <input
                id="resInput"
                className="focus:ring-light-green focus:border-light-green/60 flex-1 rounded border px-3 py-2 focus:ring-2 focus:outline-none"
                placeholder="https://…"
              />
              <Button
                primary
                onClick={() => {
                  const el = document.getElementById('resInput') as HTMLInputElement | null;
                  if (!el) return;
                  addResource(el.value.trim());
                  el.value = '';
                }}
              >
                Add
              </Button>
            </div>
            {resources.length === 0 ? (
              <div className="mt-3 text-sm text-gray-600">No resources added.</div>
            ) : (
              <ul className="mt-3 space-y-2">
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
            <p className="mt-3 text-xs text-gray-500">
              Note: This prototype stores resources client-side only. We can add a backend table
              later (training_resources) to persist uploads/links.
            </p>
          </SectionWrapper>
        </div>
      )}
    </div>
  );
}
