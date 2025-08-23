"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { H1, H2 } from "@/components/Heading";
import SectionWrapper from "@/components/section-wrapper";
import Button from "@/components/button";
import { useUser } from "@clerk/nextjs";

type CarbonTopic = { topicId: string; name: string };

type Level = "beginner" | "intermediate" | "expert";

type Status = "Draft" | "Published" | "Archived";

export default function NewTrainingPage() {
  const router = useRouter();
  const { user } = useUser();

  // Form state aligned with schema
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<Level>("beginner");
  // Status is enforced server-side as Draft for mentors; no status picker here
  const [carbonTopicId, setCarbonTopicId] = useState<string>("");
  const [carbonAccountingFocus, setCarbonAccountingFocus] = useState(false);
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [whyThisCourse, setWhyThisCourse] = useState("");

  // UI state
  const [topics, setTopics] = useState<CarbonTopic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadTopics = async () => {
      try {
        setLoadingTopics(true);
        const res = await fetch("/api/carbon-topics", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load topics");
        const data: CarbonTopic[] = await res.json();
        if (!active) return;
        setTopics(data);
      } catch (e: any) {
        if (active) setErr(e?.message || "Failed to load topics");
      } finally {
        if (active) setLoadingTopics(false);
      }
    };
    loadTopics();
    return () => {
      active = false;
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErr(null);

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        level,
        // status is forced to Draft by the server for mentors
        carbonTopicId: carbonTopicId || null,
        carbonAccountingFocus,
        duration: duration.trim() || null,
        price: price.trim() || null,
        whyThisCourse: whyThisCourse.trim() || null,
      };

      const res = await fetch("/api/trainings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 403)
          throw new Error("Only mentors can create trainings");
        if (res.status === 401) throw new Error("Please sign in to continue");
        throw new Error("Failed to create training");
      }
      const created = await res.json();

      // Ensure it shows under "My Trainings": create a default session with me as instructor
      try {
        let myUserId: string | null = null;
        if (user) {
          const usersRes = await fetch("/api/users", { cache: "no-store" });
          const users: Array<{ userId: string; clerkId?: string | null }> =
            await usersRes.json();
          myUserId = users.find((u) => u.clerkId === user.id)?.userId ?? null;
        }
        const start = new Date();
        const end = new Date(start.getTime() + 60 * 60 * 1000); // +1h
        await fetch("/api/training-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: created.courseId,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            instructorId: myUserId,
            maxParticipants: null,
          }),
        });
      } catch (_) {
        // Non-fatal; course will still be created, user can add session later
      }

      router.push(`/mentor/trainings/${created.courseId}`);
    } catch (e: any) {
      setErr(e?.message || "Failed to create training");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="lg:mx-32 md:mx-12 mx-4 my-8 space-y-6">
      <SectionWrapper variant="green" className="py-8">
        <H1 className="text-white">New Training</H1>
        <H2 className="text-white/90 mt-2">
          Define your course details. Submissions start as Draft for admin
          approval.
        </H2>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Link href="/mentor/trainings">
            <Button secondary>Back to Trainings</Button>
          </Link>
        </div>
      </SectionWrapper>

      <SectionWrapper title="Create Training" className="bg-white">
        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-green">
                Title
              </label>
              <input
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-green focus:border-light-green/60"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Introduction to LCA"
                disabled={saving}
              />
              <p className="mt-1 text-xs text-gray-500">
                A clear, concise title works best.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-green">
                Level
              </label>
              <select
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-green focus:border-light-green/60"
                value={level}
                onChange={(e) => setLevel(e.target.value as Level)}
                disabled={saving}
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
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-green focus:border-light-green/60"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will learners get from this course?"
                disabled={saving}
              />
              <p className="mt-1 text-xs text-gray-500">
                This appears on the course page and cards.
              </p>
            </div>
            {/* Status is enforced as Draft for mentors; admins can adjust later */}
            <div>
              <label className="block text-sm font-medium text-green">
                Carbon Topic
              </label>
              <select
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-green focus:border-light-green/60 disabled:opacity-60"
                value={carbonTopicId}
                onChange={(e) => setCarbonTopicId(e.target.value)}
                disabled={loadingTopics || saving}
              >
                <option value="">None</option>
                {topics.map((t) => (
                  <option key={t.topicId} value={t.topicId}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="caf"
                type="checkbox"
                className="h-4 w-4 rounded border-green text-green focus:ring-light-green"
                checked={carbonAccountingFocus}
                onChange={(e) => setCarbonAccountingFocus(e.target.checked)}
                disabled={saving}
              />
              <label htmlFor="caf" className="text-sm text-green">
                Carbon accounting focus
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-green">
                Duration
              </label>
              <input
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-green focus:border-light-green/60"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 1 day (8 hours)"
                disabled={saving}
              />
              <p className="mt-1 text-xs text-gray-500">
                Format examples: 1 day (8 hours), 3 weeks, etc.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-green">
                Price
              </label>
              <input
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-green focus:border-light-green/60"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. €199 or 199 TND"
                disabled={saving}
              />
              <p className="mt-1 text-xs text-gray-500">
                Include currency or units as shown.
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-green">
                Why this course?
              </label>
              <textarea
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-green focus:border-light-green/60"
                rows={3}
                value={whyThisCourse}
                onChange={(e) => setWhyThisCourse(e.target.value)}
                placeholder="Explain the key benefits and outcomes."
                disabled={saving}
              />
              <p className="mt-1 text-xs text-gray-500">
                One or two sentences of value proposition.
              </p>
            </div>
          </div>

          {err && (
            <div className="text-red-600 text-sm border border-red-200 rounded-md px-3 py-2 bg-red-50">
              {err}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button primary disabled={saving || !title.trim()}>
              {saving ? "Creating…" : "Create Training"}
            </Button>
            <Link href="/mentor/trainings">
              <Button secondary disabled={saving}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </SectionWrapper>
    </div>
  );
}
