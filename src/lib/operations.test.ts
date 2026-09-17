import { describe, expect, it } from "vitest";
import { DocumentCreateSchema } from "@/lib/validation/public";
import { rateLimit } from "@/lib/rate-limit";

describe("Sprint 4 operations safeguards", () => {
  it("requires a document to have exactly one parent", () => {
    expect(DocumentCreateSchema.safeParse({
      title: "Minutes",
      url: "https://example.com/minutes.pdf",
      mimeType: "application/pdf",
    }).success).toBe(false);

    expect(DocumentCreateSchema.safeParse({
      title: "Minutes",
      url: "https://example.com/minutes.pdf",
      mimeType: "application/pdf",
      noticeId: "notice-1",
      resolutionId: "resolution-1",
    }).success).toBe(false);
  });

  it("blocks login keys after the configured limit", () => {
    const key = `test-login-${Date.now()}`;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      expect(rateLimit(key, { limit: 2, windowMs: 60_000 }).allowed).toBe(true);
    }
    expect(rateLimit(key, { limit: 2, windowMs: 60_000 }).allowed).toBe(false);
  });
});