// PDF rendering via a real headless Chromium, not a pure-JS PDF library.
//
// Why: this app's PDFs are majority Bengali text with conjuncts and matras
// (যুক্তাক্ষর) that require real OpenType shaping (GSUB/GPOS) to render
// correctly. Pure-JS PDF libraries (pdf-lib, @react-pdf/renderer's default
// engine) draw one glyph per Unicode codepoint with no shaping step, so
// Bengali text comes out with conjuncts unformed or in the wrong order.
// A real browser engine (Chromium, via HarfBuzz) shapes it correctly, the
// same way it would on screen — so this renders normal HTML/CSS.
//
// Why @sparticuz/chromium specifically: this project deploys to Vercel
// (serverless), which has no system Chromium and a read-only filesystem
// outside /tmp. @sparticuz/chromium ships a Lambda/Vercel-compatible
// Chromium binary as part of the npm package itself (via registry.npmjs.org
// — no separate download step), and unpacks it to /tmp at runtime.
//
// IMPORTANT — version pairing: @sparticuz/chromium's Chromium build must be
// compatible with the installed puppeteer-core's DevTools protocol version.
// They are NOT independently "latest is fine" — check
// https://github.com/Sparticuz/chromium#readme (links to Puppeteer's
// Chromium Support page) whenever bumping either package, or requests to
// launch() will fail with a protocol-version error.
import puppeteer, { type Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export interface PdfOptions {
  format?: 'A4' | 'Letter';
  printBackground?: boolean;
}

let browserPromise: Promise<Browser> | null = null;

// Reused across requests within the same warm serverless instance — a cold
// Chromium launch is the single slowest part of this (typically 1-3s), so
// paying it once per instance instead of once per PDF matters in practice.
async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: await chromium.executablePath(),
      headless: true,
    });
    browserPromise.catch(() => {
      browserPromise = null; // let the next call retry instead of caching a failed launch forever
    });
  }
  return browserPromise;
}

/**
 * Renders a self-contained HTML string (all assets/fonts inlined — see
 * `letterhead.ts`) to a PDF buffer. No filesystem writes; the caller decides
 * whether to stream it straight back as a download or persist it (e.g. to
 * S3, once that's configured — see docs/STEP_7_CHANGELOG.md).
 */
export async function renderHtmlToPdf(html: string, options: PdfOptions = {}): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: 'load' });
    const pdf = await page.pdf({
      format: options.format ?? 'A4',
      printBackground: options.printBackground ?? true,
    });
    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}
