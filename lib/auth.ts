import { auth, currentUser } from '@clerk/nextjs/server';

export type Role = 'admin' | 'trainer' | 'trainee' | 'user';

export async function requireAuth(opts?: { roles?: Role[] }) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 });
  }
  if (opts?.roles?.length) {
    // Prefer role claim from Clerk public metadata (set during signup/webhook)
    type Claims = {
      publicMetadata?: { role?: Role };
      orgRole?: Role;
      [k: string]: unknown;
    };
    const claims = sessionClaims as Claims | null | undefined;
    const role = claims?.publicMetadata?.role ?? claims?.orgRole;
    if (!role || !opts.roles.includes(role)) {
      throw Object.assign(new Error('Forbidden'), { status: 403 });
    }
  }
  return { userId } as const;
}

export async function getUserOrThrow() {
  const user = await currentUser();
  if (!user) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 });
  }
  return user;
}
