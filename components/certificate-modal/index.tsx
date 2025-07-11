"use client";

import { X, ExternalLink, Download } from "lucide-react";
import { useEffect } from "react";

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
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-6xl h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-green truncate font-Inter">
            {certificateTitle}
          </h2>
          <div className="flex items-center space-x-2">
            {/* Download Button */}
            <a
              href={certificateUrl}
              download
              className="p-2 text-green hover:bg-green/10 rounded-lg transition-colors"
              title="Download Certificate"
            >
              <Download className="h-5 w-5" />
            </a>

            {/* Open in New Tab */}
            <a
              href={certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-green hover:bg-green/10 rounded-lg transition-colors"
              title="Open in New Tab"
            >
              <ExternalLink className="h-5 w-5" />
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="w-full h-[calc(100%-64px)]">
          <iframe
            src={`${certificateUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            className="w-full h-full border-0"
            title={certificateTitle}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
