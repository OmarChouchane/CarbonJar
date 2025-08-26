import Head from 'next/head';

import Navigation from '@/components/navigation';

interface IProps {
  children: React.ReactNode;
}

const Page = ({ children }: IProps) => (
  <div>
    <Head>
      <link rel="icon" href="/logoCarbonJar.svg" />
    </Head>
    <div className="flex min-h-screen flex-col">
      <Navigation />
      {children}
    </div>
  </div>
);

export default Page;
