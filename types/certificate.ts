export interface Certificate {
  id: string;
  title: string;
  description?: string;
  issuedAt: string;
  certificateUrl: string;
  // Optional fields for integrations (e.g., LinkedIn Add to Profile)
  certId?: string; // e.g., certificateCode
  expirationAt?: string | null; // ISO string
  organizationName?: string; // e.g., "Carbon Jar"
  slug?: string; // certificateSlug for pretty URLs
}

export interface CertificateApiResponse {
  success: boolean;
  data: Certificate[];
  count: number;
}
