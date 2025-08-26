import type { Certificate } from "@/types/certificate";

export const calculateStats = (certificates: Certificate[]) => {
  return {
    totalCertificates: certificates.length,
    skillsMastered: Math.floor(certificates.length * 1.5),
    estimatedHours: Math.floor(certificates.length * 2.5),
    completionRate: "100%",
    latestCertificateDate:
      certificates.length > 0
        ? new Date(
            certificates[certificates.length - 1]?.issuedAt
          ).toLocaleDateString()
        : "None yet",
  };
};

export const formatCertificateDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

export const getCertificateCount = (certificates: Certificate[]): string => {
  const count = certificates.length;
  if (count === 0) return "No certificates";
  if (count === 1) return "1 certificate";
  return `${count} certificates`;
};
