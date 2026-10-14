
// Sarok.pdf থেকে প্রাপ্ত অফিশিয়াল ক্যাটাগরি ও কোডসমূহ
export const sarokCategoriesData = [
  { code: "1001", name: "Executive Meeting", shortName: "EM" }, //[cite: 2]
  { code: "1002", name: "General Assembly", shortName: "GA" }, //[cite: 2]
  { code: "1003", name: "National Day", shortName: "ND" }, //[cite: 2]
  { code: "1004", name: "Show Cause Notice", shortName: "SN" }, //[cite: 2]
  { code: "1006", name: "Condolence", shortName: "SS" }, //[cite: 2]
  { code: "1007", name: "Club Events", shortName: "EV" }, //[cite: 2]
  { code: "1008", name: "General Notice / Circular", shortName: "NO" }, //[cite: 2]
  { code: "2001", name: "Others / Miscellaneous", shortName: "OT" }, //[cite: 2]
  { code: "2002", name: "Constitution & Policy", shortName: "CP" }, //[cite: 3]
  { code: "2003", name: "Finance & Accounts", shortName: "FA" }, //[cite: 3]
  { code: "2004", name: "Membership", shortName: "MB" }, //[cite: 3]
  { code: "2006", name: "Collaboration / MoU", shortName: "CM" }, //[cite: 3]
  { code: "2007", name: "Workshop & Training", shortName: "WT" }, //[cite: 3]
  { code: "2008", name: "Seminar / Conference", shortName: "SC" }, //[cite: 3]
  { code: "3001", name: "Project / Competition", shortName: "PC" }, //[cite: 3]
  { code: "3002", name: "Award / Recognition", shortName: "AR" }, //[cite: 3]
  { code: "3003", name: "Press Release", shortName: "PR" }, //[cite: 3]
  { code: "3004", name: "Emergency Notice", shortName: "EN" }, //[cite: 3]
];

export async function seedSarokCategories(tx: any) {
  console.log("Seeding Sarok categories...");
  for (const cat of sarokCategoriesData) {
    await tx.sarok.upsert({
      where: { code: cat.code },
      update: { name: cat.name, shortName: cat.shortName },
      create: cat,
    });
  }
  console.log(`Successfully seeded ${sarokCategoriesData.length} Sarok categories.`);
}