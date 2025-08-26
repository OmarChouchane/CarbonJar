import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trainings',
  description:
    'Explore our professional training programs in carbon accounting and sustainability.',
};

export default function TrainingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
