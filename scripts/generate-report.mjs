#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeHtml(s) {
  const str = typeof s === 'string' ? s : String(s ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const [inputArg, outputArg, titleArg] = process.argv.slice(2);
  const defaultIn = path.join(repoRoot, 'docs', 'Technical-Report.md');
  const defaultOut = path.join(repoRoot, 'docs', 'Technical-Report.pdf');
  const mdPath = inputArg ? path.resolve(repoRoot, inputArg) : defaultIn;
  const outPdf = outputArg ? path.resolve(repoRoot, outputArg) : defaultOut;
  const outDir = path.dirname(outPdf);
  const title = titleArg || path.basename(mdPath).replace(/\.md$/i, '').replace(/[-_]/g, ' ') + '';

  // Render mermaid code blocks into <div class="mermaid"> for client-side rendering
  marked.use({
    renderer: {
      code(code, info) {
        const lang = (typeof info === 'string' ? info : '').trim().toLowerCase();
        if (lang === 'mermaid') {
          return `<div class="mermaid">\n${code}\n</div>`;
        }
        const safe = escapeHtml(code);
        const cls = lang ? ` class="language-${lang}"` : '';
        return `<pre><code${cls}>${safe}</code></pre>`;
      },
    },
  });

  const md = await fs.readFile(mdPath, 'utf8');
  const htmlBody = marked.parse(md);

  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --text: #111827;
      --muted: #374151;
      --border: #e5e7eb;
      --accent: #17412d;
    }
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif; color: var(--text); margin: 2rem; }
    h1, h2, h3 { color: var(--accent); }
    h1 { font-size: 1.8rem; margin-bottom: 0.25rem; }
    h2 { font-size: 1.3rem; margin-top: 1.6rem; }
    h3 { font-size: 1.1rem; margin-top: 1rem; }
    p, li { line-height: 1.45; }
    code, pre { background: #f8fafc; border: 1px solid var(--border); border-radius: 6px; }
    pre { padding: 0.75rem; overflow: auto; }
    table { border-collapse: collapse; margin: 1rem 0; width: 100%; }
    th, td { border: 1px solid var(--border); padding: 0.5rem 0.6rem; text-align: left; }
    hr { border: none; border-top: 1px solid var(--border); margin: 1.5rem 0; }
    .footer { margin-top: 2rem; font-size: 0.85rem; color: var(--muted); }
    @page { size: A4; margin: 18mm 14mm; }
    @media print { a { color: inherit; text-decoration: none; } }
    /* Mermaid tweaks */
    .mermaid { background: #fff; border: 1px solid var(--border); border-radius: 6px; padding: 8px; margin: 12px 0; }
  </style>
  <script type="module">
    // Load Mermaid dynamically to render diagrams in headless Chrome
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true, theme: 'default' });
    window.__mermaid__ = mermaid;
  </script>
</head>
<body>
${htmlBody}
<div class="footer">Generated on ${new Date().toISOString()}</div>
</body>
</html>`;

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await fs.mkdir(outDir, { recursive: true });
  // Wait for Mermaid diagrams to render (if any)
  try {
    await page.waitForFunction(
      () =>
        typeof window !== 'undefined' &&
        document.querySelectorAll('.mermaid').length > 0 &&
        Array.from(document.querySelectorAll('.mermaid')).every((d) => d.querySelector('svg')),
      { timeout: 8000 },
    );
  } catch {}

  await page.pdf({ path: outPdf, format: 'A4', printBackground: true });
  await browser.close();

  console.log(`PDF generated: ${outPdf}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
