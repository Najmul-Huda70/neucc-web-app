# Step 7 — PDF Generation Infrastructure (Backend)

Built from the real letterhead example and both logos you provided. This
step is infrastructure — a reusable HTML→PDF pipeline plus one concrete,
fully working use of it (Notice → letterhead PDF) — meant to be reused by
Resolution PDFs, election result declarations, and nomination forms later
via the same two library functions.

## Why headless Chromium, not a pure-JS PDF library
This was the key technical decision, worth explaining because it's not the
obvious/cheapest-looking choice:

`pdf-lib` and `@react-pdf/renderer`'s default engine draw text by mapping
each Unicode codepoint to a glyph 1:1. That's fine for Latin scripts, but
**Bengali needs real OpenType shaping** (GSUB/GPOS) to form conjuncts
(যুক্তাক্ষর — ক্ষ, ন্দ্র, স্ব, etc.) and reorder matras. Without shaping, that
same text renders as broken/disconnected glyphs in the wrong order — a
document a Bengali reader would immediately recognize as wrong, in a
notice that's meant to look official.

A real browser engine does full shaping via HarfBuzz, the same way it
renders Bengali on screen. So this renders normal HTML/CSS through headless
Chromium and prints that to PDF — correct by construction, and it means the
letterhead is *authored* as HTML/CSS, which is a much easier way to match a
pixel-precise reference design than fighting a low-level PDF drawing API.

## Why `@sparticuz/chromium` specifically (not full `puppeteer`)
This app deploys to Vercel — serverless, no system Chromium, read-only
filesystem outside `/tmp`. `@sparticuz/chromium` ships a
Lambda/Vercel-compatible Chromium build as part of the npm package itself
(pulled from `registry.npmjs.org`, no separate binary download step at
install or build time) and unpacks it to `/tmp` at runtime. Paired with
`puppeteer-core` (the driver, without its own bundled Chromium — full
`puppeteer` would try to download a desktop Chromium build that doesn't run
on Lambda's Amazon Linux).

**This was verified end-to-end in this environment, not just written
blind** — I actually launched the bundled Chromium, rendered Bengali text
with real conjuncts (ক্ষ, ঞ্জ, ন্দ্র, স্ব) and Bengali numerals, and confirmed
correct shaping in the output PDF.

⚠️ **Version pairing matters.** `@sparticuz/chromium`'s Chromium build must
match `puppeteer-core`'s expected DevTools protocol version — they are not
independently "latest is fine." Installed here: `@sparticuz/chromium@153.0.0`
+ `puppeteer-core@25.11.0` (both were `latest` as of this step and launched
successfully in testing). If you bump either later and launches start
failing with a protocol-version error, check
https://github.com/Sparticuz/chromium#readme (links to Puppeteer's Chromium
Support page) for the compatible pairing.

## New files
```
src/lib/pdf/
├── assets/
│   ├── logos.ts                    — both provided logos, base64 data URIs
│   └── fonts.ts                    — Noto Sans Bengali (variable, base64)
├── letterhead.ts                    — renderLetterheadHtml(), the reusable
│                                       "notice pad" HTML template
└── render.ts                        — renderHtmlToPdf(), the Chromium
                                        launch + print-to-PDF wrapper

src/app/api/panel/notices/[id]/generate-pad/route.ts   — the concrete use
```
Plus `generateTempPassword`'s neighbor — no, unrelated; just noting
`src/lib/auth/passwords.ts` was NOT touched this step.

## Why the font is embedded as base64, not linked
Serverless Chromium (via `@sparticuz/chromium`) ships with **zero
non-Latin system fonts** — Bengali text would render as tofu boxes even
with shaping working correctly, because there'd be no Bengali glyphs to
shape in the first place. Embedding Noto Sans Bengali directly in the
HTML via `@font-face { src: url(data:font/ttf;base64,...) }` makes the
render fully self-contained: no filesystem font lookup, no network fetch,
works identically on a cold serverless instance as it did in this sandbox.
Source: `google/fonts` GitHub repo (`ofl/notosansbengali`), SIL Open Font
License 1.1 — free to embed and redistribute. One variable-font file (~460
KB) covers every weight instead of separate regular/bold files.

## Why the logos are embedded as base64 too
Puppeteer's `page.setContent()` renders a string with no base URL, so a
relative `/images/university-logo.png` `<img>` src wouldn't resolve at
render time — there's nothing to fetch it from. Same files are also kept
under `public/images/` for the public-facing site to use normally; the PDF
pipeline just needs its own self-contained copy.

## `renderLetterheadHtml()` — the general template, not a one-off
Deliberately built as a parameterized function
(`date`, `memoNo`, `subject`, `bodyParagraphs`, `signatory`, optional
`ccList`, optional `closingLine`), not the specific "Election Commission"
notice content from the reference image — that content is this one
notice's data, not the template's structure. The reference image was used
to get the *layout* pixel-close (three-column bilingual header, rule,
date/memo row, subject, justified body, faint watermark, right-aligned
signature block, numbered CC list), verified by rendering that exact
content and comparing side by side (see below).

`plainTextToParagraphs()` is a small helper for the common case — a
`Notice.body` stored as plain text with blank-line-separated paragraphs —
HTML-escaped and split into `<p>` tags. A caller with genuinely structured
content (like the AI generator in a later step) can build its own
paragraph array with inline `<b>`/`<br/>` instead.

## `generate-pad`: the one concrete wiring in this step
`POST /api/panel/notices/:id/generate-pad` — loads the notice, builds the
letterhead HTML from its `subject`/`body`/`memoNo`/`date` and its
`publishedBy` user as the signatory, renders it, and streams the PDF back
as a download. Accepts an optional `{ ccList }` in the body since there's
nowhere to store one on `Notice` today.

**Not persisted**: `Notice.pdfUrl` is left alone. There's no S3/Cloudinary
configured yet (flagged back in the original audit), so there's nowhere
durable to put the file — persisting a URL that points nowhere would be
worse than not persisting one. Every call regenerates fresh. Wiring
storage is a reasonable follow-up once needed.

## Deployment config changes
- `package.json` — added `@sparticuz/chromium` and `puppeteer-core`.
- `next.config.ts` — added `serverExternalPackages: ['puppeteer-core',
  '@sparticuz/chromium']` so webpack leaves their native/binary assets
  alone instead of trying to bundle them (this breaks the build otherwise).
- The new route exports `runtime = 'nodejs'` (Puppeteer needs Node, not
  Edge) and `maxDuration = 30` (a cold Chromium launch + render needs more
  than the platform default budget).

## Not done in this step (flagging, not fixing)
- No Resolution PDF, election result declaration PDF, or nomination form
  PDF yet — same two library functions (`renderLetterheadHtml`,
  `renderHtmlToPdf`) are meant to be reused for each; this step proves the
  pipeline once, on Notices.
- No file storage — see above.
- The Agentic AI Content Generator (next step) is expected to produce the
  `bodyParagraphs`-shaped content this template consumes, and to trigger
  `generate-pad` as its "Generate on Pad" action.

## How to verify manually
This step was already verified end-to-end in the sandbox (Chromium launch,
Bengali shaping, layout fidelity against your reference image, single-page
fit) before being wired into the app. To verify once more after deploying:
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run dev
```
```bash
curl -X POST http://localhost:3000/api/panel/notices/<notice-id>/generate-pad \
  -H "Cookie: access_token=<token>" \
  -H "Content-Type: application/json" \
  -d '{"ccList": ["উপদেষ্টা মন্ডলী, কম্পিউটার ক্লাব"]}' \
  --output notice.pdf
```
Open `notice.pdf` — should show the full bilingual letterhead, correct
Bengali shaping, the two logos, a faint watermark, and the CC list if
provided.

On first deploy to Vercel specifically: confirm the function's memory limit
is high enough for Chromium (1024 MB+ recommended) and that `maxDuration`
is within your plan's limit.
