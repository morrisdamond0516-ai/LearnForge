/**
 * Free / low-cost external practice for gaps we cannot fully simulate
 * (LabSim-style Windows GUI campus, Packet Tracer networks, live AD, etc.).
 * Prefer free, reputable vendors — no paid LabSim/Kahoot licensing.
 */

export type ExternalPracticeLink = {
  name: string;
  url: string;
  covers: string;
  cost: "Free" | "Free tier" | "Free with account";
};

export type ExternalPracticeBundle = {
  careerSlugs: string[];
  title: string;
  intro: string;
  links: ExternalPracticeLink[];
};

export const IT_EXTERNAL_PRACTICE: ExternalPracticeBundle = {
  careerSlugs: ["it-support", "information-technology", "software-developer"],
  title: "Go further (free labs outside LearnForge)",
  intro:
    "LearnForge covers help-desk tickets, CLI triage, hardware order, and security judgment in-app. For full Windows GUI campuses, switch/router labs, and cloud sandboxes like TestOut LabSim, use these free resources alongside our labs.",
  links: [
    {
      name: "Professor Messer — CompTIA A+ videos",
      url: "https://www.professormesser.com/free-a-plus-training/",
      covers: "A+ Core 1 & 2 video walkthroughs (hardware, OS, security, networking)",
      cost: "Free",
    },
    {
      name: "Microsoft Learn — Windows & M365 support paths",
      url: "https://learn.microsoft.com/training/",
      covers: "Official Windows / Microsoft 365 modules and some sandboxes",
      cost: "Free",
    },
    {
      name: "Cisco Networking Academy + Packet Tracer",
      url: "https://www.netacad.com/cisco-packet-tracer",
      covers: "SOHO/network sims LabSim does with routers/switches — free with NetAcad account",
      cost: "Free with account",
    },
    {
      name: "LabEx — CompTIA A+ training labs",
      url: "https://labex.io/courses/comptia-a-plus-training-labs",
      covers: "Browser labs: IP, wireless, accounts, firewall, storage (supplements our gaps)",
      cost: "Free tier",
    },
    {
      name: "IBM SkillsBuild — IT Support",
      url: "https://skillsbuild.org/",
      covers: "Free IT support learning + digital badges",
      cost: "Free with account",
    },
    {
      name: "CompTIA — official A+ exam objectives",
      url: "https://www.comptia.org/en/certifications/a/",
      covers: "Domain checklist so you know what to study beyond labs",
      cost: "Free",
    },
  ],
};

export function getExternalPracticeForCareer(
  slug: string,
): ExternalPracticeBundle | null {
  if (IT_EXTERNAL_PRACTICE.careerSlugs.includes(slug)) return IT_EXTERNAL_PRACTICE;
  return null;
}
