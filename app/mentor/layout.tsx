import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db/drizzle";
import { authUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export const metadata = {
  title: "Mentor Dashboard",
};

export default async function MentorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const db = getDb();
  const me = await db
    .select({ role: authUsers.role })
    .from(authUsers)
    .where(eq(authUsers.clerkId, clerkId))
    .limit(1);
  const role = me[0]?.role;
  if (role !== "trainer" && role !== "admin") {
    // Only trainers (mentors) and admins can access
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
