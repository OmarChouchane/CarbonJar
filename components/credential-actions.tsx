'use client';

import { useCallback, useState } from 'react';

import { Check, Copy, Download, Linkedin } from 'lucide-react';

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

  // no-op

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

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy Link'}
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
      </div>

      {pdfUrl ? (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
        >
          <Download className="h-4 w-4" />
          Download
        </a>
      ) : null}
    </div>
  );
}
