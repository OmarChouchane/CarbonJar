export interface Certificate {
  id: string;
  title: string;
  description?: string;
  issuedAt: string;
  certificateUrl: string;
}

export interface CertificateApiResponse {
  success: boolean;
  data: Certificate[];
  count: number;
}
