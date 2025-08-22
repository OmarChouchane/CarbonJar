import { CheckCircle, Award, Eye } from "lucide-react";
import type { Certificate } from "@/types/certificate";
import { useState } from "react";
import CertificateModal from "@/components/certificate-modal";

interface CertificateCardProps {
  certificate: Certificate;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function CertificateCard({ certificate }: CertificateCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const issuedDate = new Date(certificate.issuedAt);
  const issueYear = issuedDate.getUTCFullYear();
  const issueMonth = issuedDate.getUTCMonth() + 1; // 1-12
  const expiration = certificate.expirationAt
    ? new Date(certificate.expirationAt)
    : null;
  const expirationYear = expiration ? expiration.getUTCFullYear() : undefined;
  const expirationMonth = expiration ? expiration.getUTCMonth() + 1 : undefined;

  // Build LinkedIn Add to Profile link (prefilled)
  const addToProfileUrl = (() => {
    const params = new URLSearchParams();
    params.set("startTask", "CERTIFICATION_NAME");
    params.set("name", certificate.title);
    const orgId = process.env.NEXT_PUBLIC_LINKEDIN_ORG_ID;
    if (orgId && orgId.trim().length > 0) {
      // If a LinkedIn Organization ID is provided, use it so LinkedIn auto-recognizes the company
      params.set("organizationId", orgId.trim());
    } else {
      // Fallback to organization name; LinkedIn may require user confirmation from dropdown
      params.set(
        "organizationName",
        certificate.organizationName || "Carbon Jar"
      );
    }
    params.set("issueYear", String(issueYear));
    params.set("issueMonth", String(issueMonth));
    if (expirationYear && expirationMonth) {
      params.set("expirationYear", String(expirationYear));
      params.set("expirationMonth", String(expirationMonth));
    }
    if (certificate.certificateUrl) {
      params.set("certUrl", certificate.certificateUrl);
    }
    if (certificate.certId) {
      params.set("certId", certificate.certId);
    }
    return `https://www.linkedin.com/profile/add?${params.toString()}`;
  })();

  // Build a nicer public URL for sharing when possible
  // Removed share feature

  return (
    <>
      <div className="group relative">
        {/* Certificate Card */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-0 overflow-hidden border border-gray-100 group-hover:border-green/20">
          {/* Certificate Header with Gradient */}
          <div className="bg-gradient-to-r from-green to-green/80 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium border border-white/30">
                  <CheckCircle className="h-3 w-3 mr-1 inline" />
                  Verified
                </span>
              </div>

              <h3 className="text-xl font-bold mb-2 line-clamp-2 leading-tight">
                {certificate.title}
              </h3>

              <p className="text-white/80 text-sm">
                Issued on {formatDate(certificate.issuedAt)}
              </p>
            </div>
          </div>

          {/* Certificate Body */}
          <div className="p-6">
            {/* Description */}
            {certificate.description && (
              <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed font-Inter">
                {certificate.description}
              </p>
            )}

            {/* Skills Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-green/10 text-green px-3 py-1 rounded-full text-xs font-medium">
                Sustainability
              </span>
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                Leadership
              </span>
              <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-medium">
                Innovation
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-green text-white rounded-xl hover:bg-green/90 transition-all duration-200 font-medium group-hover:shadow-lg font-Inter"
              >
                <Eye className="h-4 w-4 mr-2" />
                <span>View Certificate</span>
              </button>

              <a
                href={addToProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-3 bg-[#0a66c2] text-white rounded-xl hover:bg-[#084d96] transition-all duration-200 font-medium group-hover:shadow-lg font-Inter"
                title="Share"
              >
                <svg
                  className="h-4 w-4 mr-2"
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
          <div className="absolute inset-0 bg-gradient-to-r from-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
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
