import type { ReactNode } from 'react';

import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import Footer from '@/components/footer';
import Navigation from '@/components/navigation';
import { getDb } from '@/lib/db/drizzle';
import { authUsers } from '@/lib/db/schema';

export const metadata = {
  title: 'Mentor Dashboard',
};

export default async function MentorLayout({ children }: { children: ReactNode }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const db = getDb();
  const me = await db
    .select({ role: authUsers.role })
    .from(authUsers)
    .where(eq(authUsers.clerkId, clerkId))
    .limit(1);
  const role = me[0]?.role;
  if (role !== 'trainer' && role !== 'admin') {
    // Only trainers (mentors) and admins can access
    redirect('/');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
