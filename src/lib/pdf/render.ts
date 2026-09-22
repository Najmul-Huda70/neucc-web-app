import puppeteer, { type Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export interface PdfOptions {
  format?: 'A4' | 'Letter';
  printBackground?: boolean;
}

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    browserPromise.catch(() => {
      browserPromise = null;
    });
  }

  return browserPromise;
}

export async function renderHtmlToPdf(
  html: string,
  options: PdfOptions = {},
): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, {
      waitUntil: 'load',
    });

    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    const pdf = await page.pdf({
      format: options.format ?? 'A4',
      printBackground: options.printBackground ?? true,
    });

    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}