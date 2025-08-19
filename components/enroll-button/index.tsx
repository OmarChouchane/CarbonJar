"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Button from "@/components/button";

type EnrollButtonProps = {
  courseId: string;
  onEnrollmentSuccess?: () => void;
  fullWidth?: boolean;
  onUnenroll?: () => void;
};

export default function EnrollButton({
  courseId,
  onEnrollmentSuccess,
  fullWidth = true,
  onUnenroll,
}: EnrollButtonProps) {
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);

  // Precompute redirect URL for sign-in
  const redirectUrl = useMemo(() => `/trainings/${courseId}`, [courseId]);

  // Check if already enrolled on mount (and when user changes)
  useEffect(() => {
    let cancelled = false;
    const checkEnrollment = async () => {
      try {
        // If not authenticated yet, skip check
        if (!user) return;

        // Map Clerk user to internal user
        const usersRes = await fetch(`/api/users`, { cache: "no-store" });
        if (!usersRes.ok) return;
        const users = (await usersRes.json()) as Array<{
          userId: string;
          clerkId?: string | null;
        }>;
        const me = users.find((u) => u.clerkId === user.id);
        if (!me?.userId) return;

        const res = await fetch(`/api/enrollments`, { cache: "no-store" });
        if (!res.ok) return; // silently ignore
        const data = (await res.json()) as Array<{
          enrollmentId: string;
          courseId: string;
          userId: string;
        }>;
        if (cancelled) return;
        if (Array.isArray(data)) {
          const match = data.find(
            (e) => e.courseId === courseId && e.userId === me.userId
          );
          setIsEnrolled(Boolean(match));
          setEnrollmentId(match?.enrollmentId ?? null);
        }
      } catch {
        // no-op
      }
    };
    checkEnrollment();
    return () => {
      cancelled = true;
    };
  }, [user, courseId]);

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // If already enrolled, short-circuit
      if (isEnrolled) return;

      // Map Clerk user to internal user by fetching existing users
      const usersRes = await fetch(`/api/users`, { cache: "no-store" });
      if (!usersRes.ok) {
        throw new Error("Failed to fetch users.");
      }
      const users = (await usersRes.json()) as Array<{
        userId: string;
        clerkId?: string | null;
      }>;
      const me = users.find((u) => u.clerkId === user.id);
      if (!me?.userId) {
        throw new Error("User record not found. Please try again later.");
      }

      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId, userId: me.userId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to enroll.");
      }

      setIsEnrolled(true);
      if (onEnrollmentSuccess) {
        onEnrollmentSuccess();
      }
      // Refresh server components that may depend on enrollment
      try {
        router.refresh();
      } catch {}
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnenroll = async () => {
    if (!user || !enrollmentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to unenroll.");
      }
      setIsEnrolled(false);
      setEnrollmentId(null);
      if (onUnenroll) onUnenroll();
      try {
        router.refresh();
      } catch {}
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEnrolled) {
    return (
      <div className="space-y-2">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleUnenroll();
          }}
          disabled={isLoading}
          modifier={fullWidth ? "w-full" : undefined}
        >
          {isLoading ? "Processing..." : "Unenroll"}
        </Button>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <Button
        secondary
        modifier={fullWidth ? "w-full" : undefined}
        onClick={(e) => {
          e.stopPropagation();
          handleEnroll();
        }}
        disabled={isLoading}
      >
        {isLoading ? "Enrolling..." : "Enroll"}
      </Button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
