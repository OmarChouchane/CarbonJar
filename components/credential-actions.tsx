'use client';

import { useCallback, useMemo, useState } from 'react';

import { Check, Copy, Download, Share2, Linkedin } from 'lucide-react';

interface CredentialActionsProps {
  credentialUrl: string;
  pdfUrl?: string;
  linkedInUrl: string;
}

export default function CredentialActions({
  credentialUrl,
  pdfUrl,
  linkedInUrl,
}: CredentialActionsProps) {
  const [copied, setCopied] = useState(false);

  const shareFallbackUrl = useMemo(() => {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(credentialUrl)}`;
  }, [credentialUrl]);

  const handleCopy = useCallback(() => {
    void (async () => {
      try {
        await navigator.clipboard.writeText(credentialUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        setCopied(false);
      }
    })();
  }, [credentialUrl]);

  const handleShare = useCallback(() => {
    void (async () => {
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({
            title: 'Carbon Jar Credential',
            text: 'View my verified credential on Carbon Jar',
            url: credentialUrl,
          });
          return;
        } catch {
          // ignore and fall back to LinkedIn share link
        }
      }
      window.open(shareFallbackUrl, '_blank', 'noopener,noreferrer');
    })();
  }, [credentialUrl, shareFallbackUrl]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        {copied ? 'Copied!' : 'Copy Link'}
      </button>

      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>

      <a
        href={linkedInUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0a66c2] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#094f98]"
      >
        <Linkedin className="h-4 w-4" />
        Add to LinkedIn
      </a>

      {pdfUrl ? (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
        >
          <Download className="h-4 w-4" />
          Download
        </a>
      ) : null}
    </div>
  );
}
