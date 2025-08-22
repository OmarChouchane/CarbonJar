import type { Metadata } from "next";
import { getDb } from "@/lib/db/drizzle";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { headers } from "next/headers";

type Props = {
  params: { slug: string };
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
  const cert = await getCertificateBySlug(params.slug);
  const title = cert ? `${cert.title} • Certificate` : "Certificate";
  const description = cert?.description || "Verified training certificate.";
  const origin = (async () => {
    if (process.env.NEXT_PUBLIC_SITE_URL)
      return process.env.NEXT_PUBLIC_SITE_URL;
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "http";
    return host ? `${proto}://${host}` : "";
  })();
  const resolved = typeof origin === "string" ? origin : await origin;
  const pageUrl = `${resolved}/certificates/${params.slug}`;

  // Use an existing PNG so LinkedIn/Twitter render previews reliably
  const ogPrimary = `${resolved}/images/images/card2.png`;
  const ogFallback = `${resolved}/logoCarbonJar.svg`;

  return {
    // Helps Next.js build absolute URLs for meta tags when relative values are used
    metadataBase: resolved ? new URL(resolved) : undefined,
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "article",
      siteName: "Carbon Jar",
      images: [
        {
          url: ogPrimary,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: cert?.title || "Certificate",
        },
        { url: ogFallback, width: 512, height: 512, alt: "Carbon Jar" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogPrimary],
    },
  };
}

export default async function CertificatePublicPage({ params }: Props) {
  const cert = await getCertificateBySlug(params.slug);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      <Navigation />
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 pb-16">
          {!cert ? (
            <div className="max-w-3xl mx-auto text-center py-24">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Certificate not found
              </h1>
              <p className="text-gray-600">
                This certificate may have been moved or revoked.
              </p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {cert.title}
                </h1>
                {cert.description ? (
                  <p className="text-gray-600 max-w-3xl">{cert.description}</p>
                ) : null}
                <div className="mt-3 text-sm text-gray-500">
                  Issued on{" "}
                  {new Date(cert.issueDate as any).toLocaleDateString()} by{" "}
                  {cert.issuerName}
                </div>
              </div>

              {/* PDF Viewer */}
              {cert.pdfUrl ? (
                <div className="w-full h-[75vh] rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                  <iframe
                    src={`${cert.pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                    className="w-full h-full border-0"
                    title={cert.title}
                  />
                </div>
              ) : (
                <div className="p-8 bg-white rounded-xl border border-gray-200 text-gray-500">
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
