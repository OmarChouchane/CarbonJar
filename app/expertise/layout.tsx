import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expertise',
  description: 'Learn about our expertise in carbon accounting and sustainability solutions.',
};

export default function ExpertiseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
