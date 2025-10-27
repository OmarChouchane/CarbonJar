'use client';

import { useEffect, useRef, useState } from 'react';

import type { PDFDocumentProxy } from 'pdfjs-dist';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Use pdfjs-dist worker via CDN to avoid bundling issues
GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

type PdfCanvasProps = {
  url: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function PdfCanvas({ url, className, style }: PdfCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let pdfDoc: PDFDocumentProxy | null = null;
    const render = async () => {
      try {
        setError(null);
        const loadingTask = getDocument({ url });
        pdfDoc = await loadingTask.promise;
        if (cancelled) return;
        const page = await pdfDoc.getPage(1);
        if (cancelled) return;

        const viewportBase = page.getViewport({ scale: 1 });
        const containerWidth = containerRef.current?.clientWidth ?? 0;
        const scale = containerWidth > 0 ? containerWidth / viewportBase.width : 1;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (e) {
        if (!cancelled) setError('Failed to load PDF preview');
      }
    };

    void render();
    const onResize = () => void render();
    window.addEventListener('resize', onResize);
    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
      void pdfDoc?.destroy();
    };
  }, [url]);

  return (
    <div ref={containerRef} className={className} style={style}>
      {error ? (
        <div className="text-sm text-slate-300">{error}</div>
      ) : (
        <canvas ref={canvasRef} className="block h-auto max-h-[73vh] w-full" />
      )}
    </div>
  );
}
