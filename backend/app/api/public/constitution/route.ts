import { NextResponse } from "next/server";

// GET /api/public/constitution — redirects to the static PDF asset.
// The Constitution rarely changes (only at election time, per §4.5), so it's
// checked into /public/documents rather than stored in the DB or an S3
// bucket. Replace with a signed S3 URL if you'd rather manage it out-of-repo.
export async function GET() {
  return NextResponse.redirect(new URL("/documents/neucc-constitution.pdf", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"));
}
