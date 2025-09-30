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
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="pt-20 pb-16">
        {/* Hero Section with Green Background */}
        <div className="mb-8 bg-gradient-to-r from-green-600 to-green-500 py-16 text-white">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/20 shadow-lg ring-4 ring-white/20">
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
                <div className="inline-flex items-center rounded-full border border-white/40 bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified Credential
                </div>

                <h1 className="text-4xl leading-tight font-bold text-white lg:text-5xl">
                  {certificate.title}
                </h1>

                <p className="mx-auto max-w-2xl text-lg text-white/90">
                  Issued to <span className="font-semibold text-white">{learnerName}</span> by{' '}
                  <span className="font-semibold text-white">{certificate.issuerName}</span>
                  {certificate.issuerRole && (
                    <span className="text-white/80"> — {certificate.issuerRole}</span>
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

            {/* Key Details Cards - Centered in Hero */}
            <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 shadow-sm backdrop-blur-sm">
                <dt className="mb-1 text-xs font-medium text-white/80">Issued On</dt>
                <dd className="text-lg font-semibold text-white">{issueDate}</dd>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 shadow-sm backdrop-blur-sm">
                <dt className="mb-1 text-xs font-medium text-white/80">Credential ID</dt>
                <dd className="font-mono text-lg font-semibold text-white">
                  {certificate.certificateCode}
                </dd>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 shadow-sm backdrop-blur-sm">
                <dt className="mb-1 text-xs font-medium text-white/80">Duration</dt>
                <dd className="text-lg font-semibold text-white">{course?.duration || '—'}</dd>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 shadow-sm backdrop-blur-sm">
                <dt className="mb-1 text-xs font-medium text-white/80">Valid Until</dt>
                <dd className="text-lg font-semibold text-white">{expiration}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl px-4">
          {/* Main Content: Certificate Preview (Left) and Verification (Right) */}
          <div className="mb-12 grid gap-8 lg:grid-cols-2">
            {/* Certificate Preview - Left Side */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900">Certificate Preview</h2>
                <p className="mt-1 text-sm text-gray-600">View the official certificate document</p>
              </div>
              {previewUrl ? (
                <div className="p-6">
                  <div className="relative overflow-hidden rounded-lg border border-green-500/20 bg-slate-900/50 shadow-inner">
                    <iframe
                      src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=page-fit`}
                      title={`${certificate.title} – certificate PDF`}
                      className="h-[500px] w-full border-0"
                      style={{
                        aspectRatio: '210 / 297', // A4 aspect ratio
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <div className="mb-4 text-slate-400">
                    <svg
                      className="mx-auto h-12 w-12"
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
                  <p className="text-slate-300">Certificate preview unavailable</p>
                </div>
              )}
            </div>

            {/* Hero Info - Right Side */}
            <div className="space-y-6">
              {/* Profile and Title Section */}
              <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-8 shadow-sm backdrop-blur-sm">
                <div className="text-center">
                  <div className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg ring-4 ring-green-500/20">
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
                    <div className="inline-flex items-center rounded-full border border-green-500/40 bg-green-500/20 px-4 py-2 text-sm font-semibold text-green-400 backdrop-blur-sm">
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verified Credential
                    </div>

                    <h1 className="text-3xl leading-tight font-bold text-slate-50 lg:text-4xl">
                      {certificate.title}
                    </h1>

                    <p className="text-base text-slate-300">
                      Issued to <span className="font-semibold text-green-400">{learnerName}</span>{' '}
                      by{' '}
                      <span className="font-semibold text-green-400">{certificate.issuerName}</span>
                      {certificate.issuerRole && (
                        <span className="text-slate-400"> — {certificate.issuerRole}</span>
                      )}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6">
                    <CredentialActions
                      credentialUrl={credentialUrl}
                      linkedInUrl={linkedInUrl}
                      {...(downloadUrl ? { pdfUrl: downloadUrl } : {})}
                    />
                  </div>
                </div>
              </div>

              {/* Key Details - Compact Cards */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 shadow-sm backdrop-blur-sm">
                  <dt className="mb-1 text-xs font-medium text-slate-400">Issued On</dt>
                  <dd className="text-lg font-semibold text-slate-50">{issueDate}</dd>
                </div>
                <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 shadow-sm backdrop-blur-sm">
                  <dt className="mb-1 text-xs font-medium text-slate-400">Credential ID</dt>
                  <dd className="font-mono text-lg font-semibold text-green-400">
                    {certificate.certificateCode}
                  </dd>
                </div>
                <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 shadow-sm backdrop-blur-sm">
                  <dt className="mb-1 text-xs font-medium text-slate-400">Duration</dt>
                  <dd className="text-lg font-semibold text-slate-50">{course?.duration || '—'}</dd>
                </div>
                <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 shadow-sm backdrop-blur-sm">
                  <dt className="mb-1 text-xs font-medium text-slate-400">Valid Until</dt>
                  <dd className="text-lg font-semibold text-slate-50">{expiration}</dd>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Comprehensive Credential Information */}
          <div className="mb-6 rounded-xl border border-slate-700/50 bg-slate-800/30 p-8 shadow-sm backdrop-blur-sm">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Credential Details */}
              <div className="lg:col-span-2">
                <h2 className="mb-6 text-2xl font-bold text-slate-50">Credential Overview</h2>
                {certificate.description && (
                  <p className="mb-6 leading-relaxed text-slate-300">{certificate.description}</p>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-700/50 p-4">
                    <p className="mb-1 text-sm font-medium text-slate-400">Course</p>
                    <p className="font-semibold text-slate-50">
                      {course?.title || certificate.title}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-700/50 p-4">
                    <p className="mb-1 text-sm font-medium text-slate-400">Learning Window</p>
                    <p className="font-semibold text-slate-50">{validityWindow}</p>
                  </div>
                  <div className="rounded-lg bg-slate-700/50 p-4">
                    <p className="mb-1 text-sm font-medium text-slate-400">Level</p>
                    <p className="font-semibold text-slate-50">{course?.level || 'All levels'}</p>
                  </div>
                  <div className="rounded-lg bg-slate-700/50 p-4">
                    <p className="mb-1 text-sm font-medium text-slate-400">Issued By</p>
                    <p className="font-semibold text-slate-50">{certificate.issuerName}</p>
                    {certificate.issuerRole && (
                      <p className="text-sm text-slate-400">{certificate.issuerRole}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Verification */}
              <div className="lg:col-span-1">
                <h2 className="mb-6 text-2xl font-bold text-slate-50">Verification</h2>
                <p className="mb-6 leading-relaxed text-slate-300">
                  This credential is digitally verified and authenticated by Carbon Jar.
                </p>
                <div className="space-y-4">
                  <div className="rounded-lg bg-slate-700/50 p-4">
                    <p className="mb-2 text-sm font-medium text-slate-400">Credential URL</p>
                    <p className="text-sm break-all text-green-400">{credentialUrl}</p>
                  </div>
                  <div className="rounded-lg border border-green-500/40 bg-green-500/20 p-4">
                    <div className="flex items-center">
                      <svg
                        className="mr-2 h-5 w-5 text-green-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-green-400">Verified Authentic</p>
                        <p className="text-xs text-green-300">Tamper-proof digital signature</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
