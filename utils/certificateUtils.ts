import type { Certificate } from '@/types/certificate';

export const calculateStats = (certificates: Certificate[]) => {
  return {
    totalCertificates: certificates.length,
    skillsMastered: Math.floor(certificates.length * 1.5),
    estimatedHours: Math.floor(certificates.length * 2.5),
    completionRate: '100%',
    latestCertificateDate:
      certificates.length > 0
        ? new Date(certificates[certificates.length - 1]?.issuedAt).toLocaleDateString()
        : 'None yet',
  };
};

export const formatCertificateDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

export const getCertificateCount = (certificates: Certificate[]): string => {
  const count = certificates.length;
  if (count === 0) return 'No certificates';
  if (count === 1) return '1 certificate';
  return `${count} certificates`;
};

const EDGE_STORE_HOSTS = ['files.edgestore.dev'];

const isEdgeStoreHost = (hostname: string) => {
  const normalized = hostname.toLowerCase();
  return EDGE_STORE_HOSTS.some(
    (allowed) => normalized === allowed || normalized.endsWith(`.${allowed}`),
  );
};

export type CertificateAssetSource = 'missing' | 'edge-store' | 'remote' | 'relative';

export interface CertificateAssetResolution {
  previewUrl: string | null;
  downloadUrl: string | null;
  source: CertificateAssetSource;
}

export function resolveCertificateAssetUrls({
  pdfUrl,
  slug,
  fallbackPreviewUrl,
}: {
  pdfUrl?: string | null;
  slug?: string | null;
  fallbackPreviewUrl?: string | null;
}): CertificateAssetResolution {
  const raw = pdfUrl?.trim();
  if (!raw) {
    return {
      previewUrl: null,
      downloadUrl: null,
      source: 'missing',
    };
  }

  const fallback = fallbackPreviewUrl ?? (slug ? `/api/certificates/${slug}/preview` : null);

  try {
    const parsed = new URL(raw);
    if (isEdgeStoreHost(parsed.hostname)) {
      const proxied = `/api/certificates/proxy?url=${encodeURIComponent(parsed.toString())}`;
      return {
        previewUrl: proxied,
        downloadUrl: proxied,
        source: 'edge-store',
      };
    }

    return {
      previewUrl: fallback ?? parsed.toString(),
      downloadUrl: parsed.toString(),
      source: 'remote',
    };
  } catch {
    if (raw.startsWith('/')) {
      return {
        previewUrl: raw,
        downloadUrl: raw,
        source: 'relative',
      };
    }
  }

  return {
    previewUrl: fallback,
    downloadUrl: fallback,
    source: 'remote',
  };
}
