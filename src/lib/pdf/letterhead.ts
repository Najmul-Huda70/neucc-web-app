import { UNIVERSITY_LOGO_BASE64, CLUB_LOGO_BASE64 } from './assets/logos';
import { NOTO_SANS_BENGALI_BASE64 } from './assets/fonts';

export interface LetterheadParams {
  /** Formatted date string exactly as it should appear, e.g. "২/০৭/২৬" or "18 September 2026". */
  date: string;
  /** Memo/reference number, e.g. "NeU.CSE.CC/EC/2026/01". */
  memoNo: string;
  /** The বিষয়/Subject line, without the "বিষয়:" prefix — this template adds it. */
  subject: string;
  /**
   * Body content as one or more paragraphs. Each array entry becomes its own
   * `<p>`. A caller with pre-formatted plain text should split on blank
   * lines first — see `plainTextToParagraphs()` below.
   */
  bodyParagraphs: string[];
  /** Right-aligned line right above the signature block. Defaults to "অনুরোধক্রমে,". */
  closingLine?: string;
  signatory: {
    name: string;
    designation: string;
    /** Extra lines under the designation, e.g. ["কম্পিউটার ক্লাব", "সিএসই বিভাগ, নেত্রকোণা বিশ্ববিদ্যালয়"]. */
    orgLines: string[];
    /** Optional base64 data-URI of a signature image, drawn above the name. */
    signatureImageBase64?: string;
    /** Optional date shown next to/under the signature (defaults to `date`). */
    signedDate?: string;
  };
  /** Numbered "অনুলিপি" / CC recipient lines. Omit to hide the section entirely. */
  ccList?: string[];
  /** Faint background club-logo watermark. Default true. */
  showWatermark?: boolean;
}

/** Splits plain text on blank lines into paragraphs, HTML-escaping each one. */
export function plainTextToParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => escapeHtml(p).replace(/\n/g, '<br/>'));
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Renders the club's bilingual letterhead ("notice pad") as a single
 * self-contained HTML string — no external assets, no network calls at
 * render time. Pass the result to `renderHtmlToPdf()` (see `render.ts`).
 *
 * Layout matches the club's real letterhead reference exactly: three-column
 * bilingual header (Bangla block / both logos / English block), a rule,
 * date+memo row, subject line, body, a faint logo watermark, a right-aligned
 * signature block, and an optional numbered CC list.
 */
export function renderLetterheadHtml(params: LetterheadParams): string {
  const {
    date,
    memoNo,
    subject,
    bodyParagraphs,
    closingLine = 'অনুরোধক্রমে,',
    signatory,
    ccList,
    showWatermark = true,
  } = params;

  return `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="utf-8" />
<style>
  @font-face {
    font-family: 'Noto Sans Bengali';
    src: url(data:font/ttf;base64,${NOTO_SANS_BENGALI_BASE64}) format('truetype');
    font-weight: 100 900;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    font-family: 'Noto Sans Bengali', 'Noto Sans', sans-serif;
    color: #111111;
    font-size: 13.5px;
    line-height: 1.6;
  }
  .page {
    position: relative;
    width: 210mm;
    min-height: 297mm;
    padding: 12mm 16mm;
    overflow: hidden;
  }
  .watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    opacity: 0.06;
    z-index: 0;
  }
  .content { position: relative; z-index: 1; }

  .header { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 12px; }
  .header .bn-block { text-align: center; font-weight: 700; font-size: 15px; line-height: 1.5; }
  .header .en-block { text-align: center; font-size: 15px; line-height: 1.5; }
  .header .logos { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .header .logos .logo-row { display: flex; gap: 10px; align-items: center; justify-content: center; }
  .header .logos img { height: 78px; object-fit: contain; }
  .header .logos .caption {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.03em;
    color: #1f4e5f;
    text-align: center;
    line-height: 1.3;
  }

  .rule { border: none; border-top: 3px solid #111111; margin: 10px 0 14px; }

  .meta-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 10px; }

  .subject { margin-bottom: 12px; font-size: 13.5px; }
  .subject .label { font-weight: 700; }

  .body p { text-align: justify; margin: 0 0 10px; }

  .closing { text-align: right; margin-top: 12px; }

  .signature-block { margin-top: 4px; margin-left: auto; width: 60%; text-align: right; }
  .signature-block img.signature { height: 50px; object-fit: contain; margin-bottom: 2px; }
  .signature-block .signed-date { font-size: 12px; margin-bottom: 6px; }
  .signature-block .name { font-weight: 700; }
  .signature-block .org-line { font-size: 12.5px; }

  .cc-section { margin-top: 22px; font-size: 12px; }
  .cc-section .cc-title { margin-bottom: 6px; }
  .cc-section ol { margin: 0; padding-left: 20px; }
  .cc-section li { margin-bottom: 2px; }
</style>
</head>
<body>
  <div class="page">
    ${showWatermark ? `<img class="watermark" src="${CLUB_LOGO_BASE64}" />` : ''}
    <div class="content">
      <div class="header">
        <div class="bn-block">
          কম্পিউটার ক্লাব<br/>
          সিএসই বিভাগ<br/>
          নেত্রকোণা বিশ্ববিদ্যালয়<br/>
          নেত্রকোণা- ২৪০০
        </div>
        <div class="logos">
          <div class="logo-row">
            <img src="${UNIVERSITY_LOGO_BASE64}" />
            <img src="${CLUB_LOGO_BASE64}" />
          </div>
          <div class="caption">NETROKONA UNIVERSITY<br/>COMPUTER CLUB</div>
        </div>
        <div class="en-block">
          Computer Club<br/>
          CSE Department<br/>
          Netrokona University<br/>
          Netrokona-2400
        </div>
      </div>

      <hr class="rule" />

      <div class="meta-row">
        <span>তারিখ: ${escapeHtml(date)}</span>
        <span>স্মারক নং: ${escapeHtml(memoNo)}</span>
      </div>

      <div class="subject"><span class="label">বিষয়:</span> ${escapeHtml(subject)}</div>

      <div class="body">
        ${bodyParagraphs.map((p) => `<p>${p}</p>`).join('\n        ')}
      </div>

      <div class="closing">${escapeHtml(closingLine)}</div>

      <div class="signature-block">
        ${signatory.signatureImageBase64 ? `<div><img class="signature" src="${signatory.signatureImageBase64}" /></div>` : ''}
        <div class="signed-date">${escapeHtml(signatory.signedDate ?? date)}</div>
        <div class="name">${escapeHtml(signatory.name)}</div>
        <div class="org-line">${escapeHtml(signatory.designation)}</div>
        ${signatory.orgLines.map((line) => `<div class="org-line">${escapeHtml(line)}</div>`).join('\n        ')}
      </div>

      ${
        ccList && ccList.length > 0
          ? `<div class="cc-section">
        <div class="cc-title">অনুলিপি সদয় অবগতি ও প্রয়োজনীয় কার্যার্থে প্রেরণ করা হলো:</div>
        <ol>
          ${ccList.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n          ')}
        </ol>
      </div>`
          : ''
      }
    </div>
  </div>
</body>
</html>`;
}
