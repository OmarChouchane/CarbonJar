'use client';

import { useEffect } from 'react';

import { X, ExternalLink, Download } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateUrl: string;
  certificateTitle: string;
}

export default function CertificateModal({
  isOpen,
  onClose,
  certificateUrl,
  certificateTitle,
}: CertificateModalProps) {
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

  if (!isOpen) return null;

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
              href={certificateUrl}
              download
              className="text-green hover:bg-green/10 rounded-lg p-2 transition-colors"
              title="Download Certificate"
            >
              <Download className="h-5 w-5" />
            </a>

            {/* Open in New Tab */}
            <a
              href={certificateUrl}
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
          <iframe
            src={`${certificateUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            className="h-full w-full border-0"
            title={certificateTitle}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
