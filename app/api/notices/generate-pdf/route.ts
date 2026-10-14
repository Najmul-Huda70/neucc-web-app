import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { noticeNo, subject, htmlContent, date, signatoryName, signatoryRole } = body || {};

    if (!subject || !htmlContent) {
      return NextResponse.json(
        { success: false, error: "Subject and content are required" },
        { status: 400 }
      );
    }

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: A4; margin: 0; }
            body { font-family: sans-serif; color: #1a1a1a; }
          </style>
        </head>
        <body class="p-12 bg-white min-h-screen flex flex-col justify-between">
          <div>
            <div class="border-b-2 border-emerald-800 pb-4 mb-6 text-center">
              <h1 class="text-2xl font-bold uppercase text-emerald-950">NEU Computer Club</h1>
              <p class="text-xs text-gray-600 mt-1">Department of CSE | North East University</p>
            </div>

            <div class="flex justify-between items-center text-xs font-mono text-gray-700 mb-6 border-b pb-2">
              <span><strong>Sarok No:</strong> ${noticeNo || "NEU-CSE-CC/GA/2026/DRAFT"}</span>
              <span><strong>Date:</strong> ${date}</span>
            </div>

            <div class="mb-6">
              <h2 class="text-sm font-bold text-gray-900">
                Subject: <span class="underline decoration-emerald-600">${subject}</span>
              </h2>
            </div>

            <div class="text-xs leading-relaxed text-gray-800 space-y-3 prose max-w-none">
              ${htmlContent}
            </div>
          </div>

          <div class="pt-12 mt-auto">
            <div class="flex justify-end">
              <div class="text-center w-56 border-t border-gray-400 pt-2">
                <p class="text-xs font-bold text-gray-900">${signatoryName || "Authorized Signatory"}</p>
                <p class="text-[11px] text-gray-600">${signatoryRole || "Executive Member"}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const isLocal = process.env.NODE_ENV === "development";
    let executablePath = "";

    if (isLocal) {
      // Brave ব্রাউজার এবং অন্যান্য ব্রাউজারের সম্ভাব্য লোকাল পাথগুলো চেক করা হচ্ছে
      const possiblePaths = [
        // Brave Browser Paths
        "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
        "C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
        "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
        "/usr/bin/brave-browser",
        "/usr/bin/brave",
        // Fallback Chrome Paths
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/usr/bin/google-chrome",
      ];

      executablePath = possiblePaths.find((p) => fs.existsSync(p)) || "";

      if (!executablePath) {
        return NextResponse.json(
          {
            success: false,
            error: "Brave or Chrome browser was not found on your local system path.",
          },
          { status: 500 }
        );
      }
    } else {
      executablePath = await chromium.executablePath();
    }

    const browser = await puppeteer.launch({
      args: isLocal ? ["--no-sandbox", "--disable-setuid-sandbox"] : chromium.args,
      defaultViewport: { width: 1280, height: 800 },
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "domcontentloaded" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Notice_${Date.now()}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Puppeteer PDF Error Details:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate server PDF" },
      { status: 500 }
    );
  }
}