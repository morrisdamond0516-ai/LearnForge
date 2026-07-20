import { db, subjectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

/**
 * Seeds LearnForge with built-in preset subjects (user_id = NULL → shared with all users).
 * Idempotent: uses slug as the unique key; re-running won't create duplicates.
 *
 * Run with: pnpm --filter @workspace/scripts run seed-subjects
 */

interface SubjectSpec {
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
}

const PRESET_SUBJECTS: SubjectSpec[] = [
  // Technology
  {
    name: "Data Analyst",
    slug: "data-analyst",
    description:
      "Master data analysis from scratch: statistics, Excel, SQL, Python, Tableau, and storytelling with data. Covers the full career path for today's data job market.",
    category: "Technology",
    icon: "📊",
  },
  {
    name: "Information Technology",
    slug: "information-technology",
    description:
      "Core IT fundamentals: networking, hardware, operating systems, security, cloud, and helpdesk support. Ideal for CompTIA A+, Network+, and entry-level IT careers.",
    category: "Technology",
    icon: "💻",
  },
  {
    name: "Cybersecurity",
    slug: "cybersecurity",
    description:
      "Learn threat detection, network defense, ethical hacking, encryption, and security frameworks. Aligned with CompTIA Security+ and CEH exam objectives.",
    category: "Technology",
    icon: "🔒",
  },
  {
    name: "Python Programming",
    slug: "python-programming",
    description:
      "Python from beginner to professional: syntax, data structures, OOP, file I/O, libraries (pandas, NumPy), and real-world project applications.",
    category: "Technology",
    icon: "🐍",
  },
  {
    name: "Cloud Computing",
    slug: "cloud-computing",
    description:
      "Foundations of cloud services, AWS, Azure, and Google Cloud. Covers compute, storage, networking, IAM, and cloud architecture for certifications and jobs.",
    category: "Technology",
    icon: "☁️",
  },
  // Health & Medicine
  {
    name: "Medical Assistant",
    slug: "medical-assistant",
    description:
      "Clinical and administrative skills for medical assistants: anatomy, medical terminology, vital signs, EHR, billing, and the CMA/RMA exam.",
    category: "Health & Medicine",
    icon: "🩺",
  },
  {
    name: "Nursing (NCLEX)",
    slug: "nursing-nclex",
    description:
      "Comprehensive NCLEX-RN and NCLEX-PN preparation: pharmacology, patient care, clinical judgment, and all major nursing content areas.",
    category: "Health & Medicine",
    icon: "🏥",
  },
  {
    name: "Medical Billing & Coding",
    slug: "medical-billing-coding",
    description:
      "ICD-10, CPT, HCPCS coding systems, insurance claims, HIPAA compliance, and preparation for the CPC or CCS certifications.",
    category: "Health & Medicine",
    icon: "🧾",
  },
  // Business & Finance
  {
    name: "Business Administration",
    slug: "business-administration",
    description:
      "Core business principles: management, marketing, finance, operations, HR, and entrepreneurship. Great for MBA prep or entry-level business roles.",
    category: "Business & Finance",
    icon: "📋",
  },
  {
    name: "Accounting & Bookkeeping",
    slug: "accounting-bookkeeping",
    description:
      "Debits, credits, financial statements, payroll, QuickBooks, and preparation for the bookkeeping certification or CPA exam fundamentals.",
    category: "Business & Finance",
    icon: "💰",
  },
  {
    name: "Project Management (PMP)",
    slug: "project-management-pmp",
    description:
      "Agile, Scrum, Waterfall, risk management, scheduling, and stakeholder communication. Full PMP and CAPM exam preparation.",
    category: "Business & Finance",
    icon: "📅",
  },
  // Trades & Vocational
  {
    name: "Electrician",
    slug: "electrician",
    description:
      "Electrical theory, NEC code, wiring, circuits, safety, and preparation for Journeyman or Master Electrician licensing exams.",
    category: "Trades & Vocational",
    icon: "⚡",
  },
  {
    name: "HVAC Technician",
    slug: "hvac-technician",
    description:
      "Refrigeration cycles, electrical controls, load calculations, EPA 608 certification prep, and residential/commercial HVAC systems.",
    category: "Trades & Vocational",
    icon: "🌡️",
  },
  {
    name: "CDL Truck Driver",
    slug: "cdl-truck-driver",
    description:
      "General knowledge, air brakes, combination vehicles, hazmat, pre-trip inspection, and all sections of the CDL written and skills tests.",
    category: "Trades & Vocational",
    icon: "🚛",
  },
  // Law & Public Safety
  {
    name: "Police Officer Exam",
    slug: "police-officer-exam",
    description:
      "Reading comprehension, math reasoning, situational judgment, memory observation, and written expression for police entrance exams.",
    category: "Law & Public Safety",
    icon: "👮",
  },
  {
    name: "Firefighter Exam",
    slug: "firefighter-exam",
    description:
      "Mechanical aptitude, reading comprehension, spatial orientation, memory, and judgment for firefighter written and cognitive exams.",
    category: "Law & Public Safety",
    icon: "🚒",
  },
  // Education & Social Services
  {
    name: "Early Childhood Education",
    slug: "early-childhood-education",
    description:
      "Child development, curriculum planning, classroom management, health & safety, and preparation for the CDA credential or Praxis Early Childhood exams.",
    category: "Education & Social Services",
    icon: "🧒",
  },
  {
    name: "Social Work (LCSW)",
    slug: "social-work-lcsw",
    description:
      "Human behavior, social systems, ethics, assessment, intervention, and ASWB exam preparation for BSW, MSW, and LCSW licensure.",
    category: "Education & Social Services",
    icon: "🤝",
  },
  // College & Academic
  {
    name: "SAT / ACT Prep",
    slug: "sat-act-prep",
    description:
      "Math, reading, writing, and science strategies for the SAT and ACT. Covers test structure, timing, and targeted practice for each section.",
    category: "College & Academic",
    icon: "🎓",
  },
  {
    name: "GED Preparation",
    slug: "ged-preparation",
    description:
      "All four GED test subjects: Mathematical Reasoning, Reasoning Through Language Arts, Science, and Social Studies.",
    category: "College & Academic",
    icon: "📚",
  },
];

async function seedSubjects() {
  console.log(`Seeding ${PRESET_SUBJECTS.length} preset subjects…`);
  let created = 0;
  let skipped = 0;

  for (const spec of PRESET_SUBJECTS) {
    const existing = await db
      .select({ id: subjectsTable.id })
      .from(subjectsTable)
      .where(eq(subjectsTable.slug, spec.slug))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  skip  ${spec.slug}`);
      skipped++;
      continue;
    }

    await db.insert(subjectsTable).values({
      name: spec.name,
      slug: spec.slug,
      description: spec.description,
      category: spec.category,
      icon: spec.icon,
      isCustom: false,
      userId: null,
    });

    console.log(`  added ${spec.slug}`);
    created++;
  }

  console.log(`\nDone — ${created} created, ${skipped} already existed.`);
  process.exit(0);
}

seedSubjects().catch((err) => {
  console.error("Seed failed:", err?.message ?? err);
  process.exit(1);
});
