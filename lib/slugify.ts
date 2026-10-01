import { randomBytes } from "crypto";

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "event";
}

type ExistingSlug = { eventId: string } | null;

export async function generateUniqueSlug(
  value: string,
  findBySlug: (slug: string) => Promise<ExistingSlug>,
  excludeEventId?: string
): Promise<string> {
  const baseSlug = slugify(value);
  let candidate = baseSlug;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const existing = await findBySlug(candidate);
    if (!existing || existing.eventId === excludeEventId) {
      return candidate;
    }

    candidate = `${baseSlug}-${randomBytes(3).toString("hex")}`;
  }

  throw new Error("Unable to generate a unique event slug");
}