'use client';

import { useEffect, useMemo, useState } from 'react';

import { Loader2, X, ExternalLink, Download } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateUrl: string;
  certificateTitle: string;
  previewUrl?: string | undefined;
}

export default function CertificateModal({
  isOpen,
  onClose,
  certificateUrl,
  certificateTitle,
  previewUrl,
}: CertificateModalProps) {
  const EDGE_STORE_HOSTS = useMemo(() => new Set(['files.edgestore.dev']), []);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveUrl = useMemo(() => {
    const source = previewUrl || certificateUrl;
    if (!source) return null;

    try {
      const parsed = new URL(
        source,
        typeof window !== 'undefined' ? window.location.href : undefined,
      );
      if (EDGE_STORE_HOSTS.has(parsed.hostname)) {
        return `/api/certificates/proxy?url=${encodeURIComponent(parsed.toString())}`;
      }
      return parsed.toString();
    } catch {
      // Relative URLs or data/blob schemes should pass through unchanged
      if (source.startsWith('data:') || source.startsWith('blob:')) {
        return source;
      }

      // Treat relative paths as same-origin resources and leave untouched
      if (source.startsWith('/')) {
        return source;
      }

      // Default fallback: return original string
      return source;
    }
  }, [EDGE_STORE_HOSTS, certificateUrl, previewUrl]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setResolvedUrl(null);
      setLoading(false);
      setError(null);
      return;
    }

    if (!certificateUrl && !previewUrl) {
      setResolvedUrl(null);
      setLoading(false);
      setError('Certificate file is unavailable.');
      return;
    }

    if (!effectiveUrl) {
      setResolvedUrl(null);
      setLoading(false);
      setError('Certificate link could not be processed.');
      return;
    }

    let isCancelled = false;
    let objectUrl: string | null = null;
    const abortController = new AbortController();

    const usesSameOrigin = (urlToCheck: string) => {
      if (typeof window === 'undefined') return false;
      try {
        const url = new URL(urlToCheck, window.location.href);
        return url.origin === window.location.origin;
      } catch {
        return false;
      }
    };

    const assignResolvedUrl = (url: string) => {
      if (isCancelled) return;
      setResolvedUrl(url);
      setLoading(false);
      setError(null);
    };

    const loadCertificate = async () => {
      // Fast path for same-origin/data/blob URLs that won't trigger frame blocking
      if (
        effectiveUrl.startsWith('data:') ||
        effectiveUrl.startsWith('blob:') ||
        usesSameOrigin(effectiveUrl)
      ) {
        assignResolvedUrl(effectiveUrl);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(effectiveUrl, {
          signal: abortController.signal,
          cache: 'no-store',
        });

        if (!response.ok) {
          // Some CDNs return 304 for conditional requests; retry once with reload semantics.
          if (response.status === 304) {
            const retry = await fetch(effectiveUrl, {
              signal: abortController.signal,
              cache: 'reload',
            });

            if (retry.ok) {
              const blob = await retry.blob();
              objectUrl = URL.createObjectURL(blob);
              assignResolvedUrl(objectUrl);
              return;
            }
          }
          throw new Error(`Unable to fetch certificate (${response.status})`);
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        assignResolvedUrl(objectUrl);
      } catch (fetchError) {
        if (isCancelled) return;
        console.error('Failed to preload certificate for inline viewing:', fetchError);
        setResolvedUrl(null);
        setLoading(false);
        setError(
          "We couldn't display this certificate inline. Please use “Open in New Tab” or download it instead.",
        );
      }
    };

    void loadCertificate();

    return () => {
      isCancelled = true;
      abortController.abort();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [certificateUrl, effectiveUrl, isOpen, previewUrl]);

  const viewerSrc = useMemo(() => {
    if (!resolvedUrl) return null;
    const hasHash = resolvedUrl.includes('#');
    return hasHash ? resolvedUrl : `${resolvedUrl}#toolbar=1&navpanes=0&scrollbar=1`;
  }, [resolvedUrl]);

  if (!isOpen) return null;
  const downloadTarget = previewUrl || certificateUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative mx-4 h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4">
          <h2 className="text-green font-Inter truncate text-xl font-bold">{certificateTitle}</h2>
          <div className="flex items-center space-x-2">
            {/* Download Button */}
            <a
              href={downloadTarget || '#'}
              download
              className="text-green hover:bg-green/10 rounded-lg p-2 transition-colors"
              title="Download Certificate"
            >
              <Download className="h-5 w-5" />
            </a>

            {/* Open in New Tab */}
            <a
              href={downloadTarget || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green hover:bg-green/10 rounded-lg p-2 transition-colors"
              title="Open in New Tab"
            >
              <ExternalLink className="h-5 w-5" />
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="h-[calc(100%-64px)] w-full">
          {loading && (
            <div className="flex h-full w-full flex-col items-center justify-center space-y-4 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="font-Inter text-sm">Loading certificate…</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex h-full w-full flex-col items-center justify-center space-y-4 p-6 text-center">
              <p className="font-Inter text-sm text-gray-600">{error}</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href={downloadTarget || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green hover:bg-green/90 font-Inter rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors"
                >
                  Open in New Tab
                </a>
                <a
                  href={downloadTarget || '#'}
                  download
                  className="font-Inter border-green text-green hover:bg-green/10 rounded-xl border px-4 py-2 text-sm font-medium transition-colors"
                >
                  Download Certificate
                </a>
              </div>
            </div>
          )}

          {!loading && !error && viewerSrc && (
            <iframe
              src={viewerSrc}
              className="h-full w-full border-0"
              title={certificateTitle}
              loading="lazy"
            />
          )}
        </div>
      </div>
    </div>
  );
}
