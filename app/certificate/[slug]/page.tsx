import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

import Footer from '@/components/footer';
import Navigation from '@/components/navigation';
import { getDb } from '@/lib/db/drizzle';
import * as schema from '@/lib/db/schema';

// Route: /certificate/[slug]

type Props = {
  params: Promise<{ slug: string }>;
};

async function getCertificateBySlug(slug: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.certificates)
    .where(eq(schema.certificates.certificateSlug, slug))
    .limit(1);
  return rows[0] || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cert = await getCertificateBySlug(slug);
  const title = cert ? `${cert.title} • Certificate` : 'Certificate';
  const description = cert?.description || 'Verified training certificate.';
  const url = (async () => {
    if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
    const h = await headers();
    const host = h.get('x-forwarded-host') ?? h.get('host');
    const proto = h.get('x-forwarded-proto') ?? 'http';
    return host ? `${proto}://${host}` : '';
  })();
  const resolvedUrl = typeof url === 'string' ? url : await url;
  const pageUrl = `${resolvedUrl}/certificate/${slug}`;

  // Use an existing PNG in /public for reliable social previews (LinkedIn prefers PNG/JPG over SVG)
  const ogPrimary = `${resolvedUrl}/images/images/card2.png`;
  const ogFallback = `${resolvedUrl}/logoCarbonJar.svg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'article',
      siteName: 'Carbon Jar',
      images: [ogPrimary, ogFallback],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogPrimary],
    },
  };
}

export default async function CertificatePublicPage({ params }: Props) {
  const { slug } = await params;
  const cert = await getCertificateBySlug(slug);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 pb-16">
          {!cert ? (
            <div className="mx-auto max-w-3xl py-24 text-center">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Certificate not found</h1>
              <p className="text-gray-600">This certificate may have been moved or revoked.</p>
            </div>
          ) : (
            <div className="mx-auto max-w-5xl">
              <div className="mb-8">
                <h1 className="mb-2 text-3xl font-bold text-gray-900">{cert.title}</h1>
                {cert.description ? (
                  <p className="max-w-3xl text-gray-600">{cert.description}</p>
                ) : null}
                <div className="mt-3 text-sm text-gray-500">
                  Issued on {new Date(String(cert.issueDate)).toLocaleDateString()} by{' '}
                  {cert.issuerName}
                </div>
              </div>

              {cert.pdfUrl ? (
                <div className="h-[75vh] w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <iframe
                    src={`${cert.pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                    className="h-full w-full border-0"
                    title={cert.title}
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-white p-8 text-gray-500">
                  No certificate file available.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
