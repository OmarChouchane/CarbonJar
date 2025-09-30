import { eq, and } from 'drizzle-orm';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import CredentialActions from '@/components/credential-actions';
import Footer from '@/components/footer';
import Navigation from '@/components/navigation';
import { getDb } from '@/lib/db/drizzle';
import * as schema from '@/lib/db/schema';
import { resolveCertificateAssetUrls } from '@/utils/certificateUtils';

type PageParams = {
  params: Promise<{ slug: string }>;
};

type CertificateRecord = typeof schema.certificates.$inferSelect;

type CourseInfo = Pick<
  typeof schema.courses.$inferSelect,
  'title' | 'description' | 'duration' | 'level'
>;

type LearnerInfo = Pick<
  typeof schema.authUsers.$inferSelect,
  'firstName' | 'lastName' | 'profileImageUrl' | 'email'
>;

type CredentialDetails = {
  certificate: CertificateRecord;
  course: CourseInfo | null;
  learner: LearnerInfo | null;
};

async function resolveSiteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  }
  const hdrs = await headers();
  const host = hdrs.get('x-forwarded-host') ?? hdrs.get('host');
  const proto = hdrs.get('x-forwarded-proto') ?? 'http';
  return host ? `${proto}://${host}` : '';
}

async function getCredentialDetails(slug: string): Promise<CredentialDetails | null> {
  const db = getDb();
  const row = await db
    .select({
      certificate: schema.certificates,
      course: {
        title: schema.courses.title,
        description: schema.courses.description,
        duration: schema.courses.duration,
        level: schema.courses.level,
      },
      learner: {
        firstName: schema.authUsers.firstName,
        lastName: schema.authUsers.lastName,
        profileImageUrl: schema.authUsers.profileImageUrl,
        email: schema.authUsers.email,
      },
    })
    .from(schema.certificates)
    .leftJoin(schema.courses, eq(schema.courses.courseId, schema.certificates.courseId))
    .leftJoin(schema.authUsers, eq(schema.authUsers.userId, schema.certificates.userId))
    .where(
      and(eq(schema.certificates.certificateSlug, slug), eq(schema.certificates.isRevoked, false)),
    )
    .limit(1);

  if (!row || row.length === 0) {
    return null;
  }

  return row[0];
}

function formatLongDate(value: Date | string | null | undefined, fallback: string | null = '—') {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getValidityWindow(cert: CertificateRecord) {
  const start = formatLongDate(cert.courseStartDate, null);
  const end = formatLongDate(cert.courseEndDate, null);
  if (start && end) {
    return `${start} → ${end}`;
  }
  if (start) return start;
  if (end) return end;
  return '—';
}

function buildLinkedInUrl({
  credentialUrl,
  certificate,
}: {
  credentialUrl: string;
  certificate: CertificateRecord;
}) {
  const params = new URLSearchParams();
  params.set('startTask', 'CERTIFICATION_NAME');
  params.set('name', certificate.title);
  const issueDate = certificate.issueDate ? new Date(certificate.issueDate) : null;
  if (issueDate && !Number.isNaN(issueDate.getTime())) {
    params.set('issueYear', String(issueDate.getUTCFullYear()));
    params.set('issueMonth', String(issueDate.getUTCMonth() + 1));
  }
  if (certificate.validUntil) {
    const valid = new Date(certificate.validUntil);
    if (!Number.isNaN(valid.getTime())) {
      params.set('expirationYear', String(valid.getUTCFullYear()));
      params.set('expirationMonth', String(valid.getUTCMonth() + 1));
    }
  }
  params.set('organizationName', certificate.issuerName ?? 'Carbon Jar');
  params.set('certUrl', credentialUrl);
  params.set('certId', certificate.certificateCode);

  const orgId = process.env.NEXT_PUBLIC_LINKEDIN_ORG_ID?.trim();
  if (orgId) {
    params.set('organizationId', orgId);
  }

  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const details = await getCredentialDetails(slug);
  if (!details) {
    return {
      title: 'Certificate not found',
      description: 'This credential could not be located.',
    };
  }

  const origin = await resolveSiteOrigin();
  const credentialUrl = origin ? `${origin}/certificates/${slug}` : `/certificates/${slug}`;
  const title = `${details.certificate.title} • Verified Credential`;
  const description =
    details.certificate.description ||
    `Verified credential issued to ${details.certificate.fullName} by ${details.certificate.issuerName}.`;
  const ogImage = origin ? `${origin}/images/images/card2.png` : '/images/images/card2.png';

  return {
    metadataBase: origin ? new URL(origin) : undefined,
    title,
    description,
    openGraph: {
      title,
      description,
      url: credentialUrl,
      type: 'article',
      siteName: 'Carbon Jar',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: details.certificate.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: credentialUrl,
    },
  };
}

export default async function CredentialPage({ params }: PageParams) {
  const { slug } = await params;
  const details = await getCredentialDetails(slug);

  if (!details) {
    notFound();
  }

  const { certificate, course, learner } = details;
  const origin = await resolveSiteOrigin();
  const credentialUrl = origin ? `${origin}/certificates/${slug}` : `/certificates/${slug}`;
  const linkedInUrl = buildLinkedInUrl({ credentialUrl, certificate });
  const assetUrls = resolveCertificateAssetUrls({
    pdfUrl: certificate.pdfUrl,
    slug,
    fallbackPreviewUrl: `/api/certificates/${slug}/preview`,
  });
  const previewUrl = assetUrls.previewUrl;
  const downloadUrl = assetUrls.downloadUrl;

  const learnerName =
    certificate.fullName ||
    [learner?.firstName, learner?.lastName].filter(Boolean).join(' ') ||
    'Credential holder';

  const validityWindow = getValidityWindow(certificate);
  const issueDate = formatLongDate(certificate.issueDate);
  const expiration = formatLongDate(certificate.validUntil, 'No expiration');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalCredential',
    name: certificate.title,
    description: certificate.description,
    issuer: {
      '@type': 'Organization',
      name: certificate.issuerName,
    },
    url: credentialUrl,
    credentialCategory: 'Professional Certificate',
    educationalLevel: course?.level ?? undefined,
    validFor: certificate.validUntil ? undefined : 'Permanently Valid',
    validIn: 'Worldwide',
    dateCreated:
      certificate.issueDate instanceof Date
        ? certificate.issueDate.toISOString()
        : new Date(certificate.issueDate).toISOString(),
    sameAs: credentialUrl,
    identifier: certificate.certificateCode,
    recognizedBy: {
      '@type': 'Organization',
      name: 'Carbon Jar',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      <main className="pt-20 pb-16">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Hero Header Section - Centered */}
          <div className="mb-16 text-center">
            <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
              {learner?.profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={learner.profileImageUrl}
                  alt={learnerName}
                  className="h-20 w-20 rounded-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {learnerName
                    .split(' ')
                    .map((word) => word.charAt(0))
                    .join('')
                    .slice(0, 2)}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Verified Credential
              </div>

              <h1 className="text-4xl leading-tight font-bold text-gray-900 md:text-5xl">
                {certificate.title}
              </h1>

              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                Issued to <span className="font-semibold text-gray-900">{learnerName}</span> by{' '}
                <span className="font-semibold text-gray-900">{certificate.issuerName}</span>
                {certificate.issuerRole && (
                  <span className="text-gray-500"> — {certificate.issuerRole}</span>
                )}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-8">
              <CredentialActions
                credentialUrl={credentialUrl}
                linkedInUrl={linkedInUrl}
                {...(downloadUrl ? { pdfUrl: downloadUrl } : {})}
              />
            </div>
          </div>

          {/* Certificate Details Cards */}
          <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <dt className="mb-2 text-sm font-medium text-gray-500">Issued On</dt>
              <dd className="text-xl font-semibold text-gray-900">{issueDate}</dd>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <dt className="mb-2 text-sm font-medium text-gray-500">Credential ID</dt>
              <dd className="font-mono text-xl font-semibold text-gray-900">
                {certificate.certificateCode}
              </dd>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <dt className="mb-2 text-sm font-medium text-gray-500">Duration</dt>
              <dd className="text-xl font-semibold text-gray-900">{course?.duration || '—'}</dd>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <dt className="mb-2 text-sm font-medium text-gray-500">Valid Until</dt>
              <dd className="text-xl font-semibold text-gray-900">{expiration}</dd>
            </div>
          </div>

          <div className="mb-12 grid gap-8 lg:grid-cols-2">
            {/* Credential Overview */}
            <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Credential Overview</h2>
              {certificate.description && (
                <p className="mb-6 leading-relaxed text-gray-600">{certificate.description}</p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-1 text-sm font-medium text-gray-500">Course</p>
                  <p className="font-semibold text-gray-900">
                    {course?.title || certificate.title}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-1 text-sm font-medium text-gray-500">Learning Window</p>
                  <p className="font-semibold text-gray-900">{validityWindow}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-1 text-sm font-medium text-gray-500">Level</p>
                  <p className="font-semibold text-gray-900">{course?.level || 'All levels'}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-1 text-sm font-medium text-gray-500">Issued By</p>
                  <p className="font-semibold text-gray-900">{certificate.issuerName}</p>
                  {certificate.issuerRole && (
                    <p className="text-sm text-gray-500">{certificate.issuerRole}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Verification */}
            <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Verification</h2>
              <p className="mb-6 leading-relaxed text-gray-600">
                Carbon Jar digitally signs every certificate and stores hashed copies to prevent
                tampering. Use the credential ID and URL below to verify authenticity.
              </p>
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-2 text-sm font-medium text-gray-500">Certificate Hash</p>
                  <p className="font-mono text-sm break-all text-gray-900">
                    {certificate.certificateHash}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-2 text-sm font-medium text-gray-500">Credential URL</p>
                  <p className="text-sm break-all text-emerald-600">{credentialUrl}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Certificate Preview */}
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900">Certificate Preview</h2>
              <p className="mt-2 text-gray-600">View the official certificate document</p>
            </div>
            {previewUrl ? (
              <div className="p-8">
                <div className="overflow-hidden rounded-lg bg-gray-50 shadow-inner">
                  <iframe
                    src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                    title={`${certificate.title} – certificate PDF`}
                    className="h-[800px] w-full border-0"
                  />
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="mb-4 text-gray-400">
                  <svg
                    className="mx-auto h-16 w-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600">Certificate preview unavailable</p>
              </div>
            )}
          </div>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </main>
      <Footer />
    </div>
  );
}
