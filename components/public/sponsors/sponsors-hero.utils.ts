// Server-safe helpers (no "use client"): can be imported from both server and client components.

export type HeroSponsor = {
  sponsorId: string | number;
  name: string;
  logoUrl: string | null;
};

const FALLBACK_TYPES = ["workshops", "seminars", "contests"];

/** Removes duplicates by id AND by normalized name (e.g. "Acme" vs "acme "). */
export function uniqueSponsors(sponsors: HeroSponsor[]): HeroSponsor[] {
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();

  return sponsors.filter((s) => {
    const id = String(s.sponsorId);
    const name = s.name.trim().toLowerCase();
    if (!name || seenIds.has(id) || seenNames.has(name)) return false;
    seenIds.add(id);
    seenNames.add(name);
    return true;
  });
}

/** ["WORKSHOP", "CONTEST"] -> "workshops and contests" */
export function formatEventTypes(types: string[]): string {
  const cleaned = Array.from(
    new Set(
      types
        .map((t) => t.replace(/[_-]+/g, " ").trim().toLowerCase())
        .filter(Boolean)
        .map((t) => (t.endsWith("s") ? t : `${t}s`)),
    ),
  );

  const list = cleaned.length > 0 ? cleaned : FALLBACK_TYPES;
  return new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(list);
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}