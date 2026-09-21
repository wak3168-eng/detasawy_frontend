import type { Role } from "@/lib/auth";
export const adminSections = [
  {
    slug: "",
    title: "Overview",
    description: "Collection progress and the work that needs your attention.",
    roles: ["superadmin", "campaign", "reviewer"],
    icon: "overview",
  },
  {
    slug: "prompts",
    title: "Prompt library",
    description:
      "Organise the pictures, scenes and recordings contributors respond to.",
    roles: ["superadmin", "campaign"],
    icon: "prompts",
  },
  {
    slug: "contributions",
    title: "Contributions",
    description:
      "Inspect submitted text, listen to recordings and explore their origins.",
    roles: ["superadmin"],
    icon: "contributions",
  },
  {
    slug: "dataset",
    title: "Dataset explorer",
    description: "Compare words and regional variants for each prompt.",
    roles: ["superadmin"],
    icon: "dataset",
  },
  {
    slug: "review",
    title: "Reference review",
    description:
      "Review contributor suggestions for places, languages and tribal references.",
    roles: ["superadmin", "reviewer"],
    icon: "review",
  },
  {
    slug: "campaigns",
    title: "Campaigns",
    description:
      "Coordinate contribution drives across provinces and districts.",
    roles: ["superadmin", "campaign"],
    icon: "campaigns",
  },
  {
    slug: "team",
    title: "People & access",
    description: "Manage pilot accounts and assign the right level of access.",
    roles: ["superadmin"],
    icon: "team",
  },
] as const;
export const allowed = (slug: string, role: Role) =>
  adminSections.find((s) => s.slug === slug)?.roles.some((r) => r === role) ??
  false;
