import { useState } from 'react';

import { CheckCircle, Award, Eye } from 'lucide-react';

import CertificateModal from '@/components/certificate-modal';
import type { Certificate } from '@/types/certificate';

interface CertificateCardProps {
  certificate: Certificate;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function CertificateCard({ certificate }: CertificateCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const issuedDate = new Date(certificate.issuedAt);
  const issueYear = issuedDate.getUTCFullYear();
  const issueMonth = issuedDate.getUTCMonth() + 1; // 1-12
  const expiration = certificate.expirationAt ? new Date(certificate.expirationAt) : null;
  const expirationYear = expiration ? expiration.getUTCFullYear() : undefined;
  const expirationMonth = expiration ? expiration.getUTCMonth() + 1 : undefined;

  // Build LinkedIn Add to Profile link (prefilled)
  const addToProfileUrl = (() => {
    const params = new URLSearchParams();
    params.set('startTask', 'CERTIFICATION_NAME');
    params.set('name', certificate.title);
    const orgId = process.env.NEXT_PUBLIC_LINKEDIN_ORG_ID;
    if (orgId && orgId.trim().length > 0) {
      // If a LinkedIn Organization ID is provided, use it so LinkedIn auto-recognizes the company
      params.set('organizationId', orgId.trim());
    } else {
      // Fallback to organization name; LinkedIn may require user confirmation from dropdown
      params.set('organizationName', certificate.organizationName || 'Carbon Jar');
    }
    params.set('issueYear', String(issueYear));
    params.set('issueMonth', String(issueMonth));
    if (expirationYear && expirationMonth) {
      params.set('expirationYear', String(expirationYear));
      params.set('expirationMonth', String(expirationMonth));
    }
    if (certificate.certificateUrl) {
      params.set('certUrl', certificate.certificateUrl);
    }
    if (certificate.certId) {
      params.set('certId', certificate.certId);
    }
    return `https://www.linkedin.com/profile/add?${params.toString()}`;
  })();

  // Build a nicer public URL for sharing when possible
  // Removed share feature

  return (
    <>
      <div className="group relative">
        {/* Certificate Card */}
        <div className="group-hover:border-green/20 overflow-hidden rounded-2xl border border-gray-100 bg-white p-0 shadow-lg transition-all duration-300 hover:shadow-2xl">
          {/* Certificate Header with Gradient */}
          <div className="from-green to-green/80 relative overflow-hidden bg-gradient-to-r p-6 text-white">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-white/10"></div>
            <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-24 w-24 rounded-full bg-white/5"></div>

            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <span className="rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  <CheckCircle className="mr-1 inline h-3 w-3" />
                  Verified
                </span>
              </div>

              <h3 className="mb-2 line-clamp-2 text-xl leading-tight font-bold">
                {certificate.title}
              </h3>

              <p className="text-sm text-white/80">Issued on {formatDate(certificate.issuedAt)}</p>
            </div>
          </div>

          {/* Certificate Body */}
          <div className="p-6">
            {/* Description */}
            {certificate.description && (
              <p className="font-Inter mb-6 line-clamp-3 text-sm leading-relaxed text-gray-600">
                {certificate.description}
              </p>
            )}

            {/* Skills Tags */}
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="bg-green/10 text-green rounded-full px-3 py-1 text-xs font-medium">
                Sustainability
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                Leadership
              </span>
              <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
                Innovation
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-green hover:bg-green/90 font-Inter inline-flex flex-1 items-center justify-center rounded-xl px-4 py-3 font-medium text-white transition-all duration-200 group-hover:shadow-lg"
              >
                <Eye className="mr-2 h-4 w-4" />
                <span>View Certificate</span>
              </button>

              <a
                href={addToProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-Inter inline-flex items-center justify-center rounded-xl bg-[#0a66c2] px-4 py-3 font-medium text-white transition-all duration-200 group-hover:shadow-lg hover:bg-[#084d96]"
                title="Share"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span className="hidden sm:inline">Share</span>
              </a>
            </div>
          </div>

          {/* Hover Effect Overlay */}
          <div className="from-green/5 pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
        </div>
      </div>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        certificateUrl={certificate.certificateUrl}
        certificateTitle={certificate.title}
      />
    </>
  );
}
