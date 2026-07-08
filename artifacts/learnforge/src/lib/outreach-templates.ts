import { OUTREACH, outreachSignature, learnforgeGamesUrl } from "./outreach-constants";

export type OutreachTemplate = {
  id: string;
  org: string;
  where: string;
  subject: string;
  body: (learnforgeUrl: string) => string;
};

function wrap(learnforgeUrl: string, intro: string, bullets: string[], links: string): string {
  return `${intro}

${bullets.map((b) => `- ${b}`).join("\n")}

${links}

${outreachSignature()}`;
}

const gamesUrl = (origin: string) => learnforgeGamesUrl(origin);

export const OUTREACH_TEMPLATES: OutreachTemplate[] = [
  {
    id: "score",
    org: "SCORE",
    where: "https://www.score.org/ → Find a Mentor",
    subject: "Mentorship request — free edtech (LearnForge + EbookGamez)",
    body: (origin) =>
      wrap(
        origin,
        `Hello,

I'm ${OUTREACH.name}, founder of LearnForge and EbookGamez.com. We build free, in-browser learning tools: AI practice exams, career skill games, and K–12/trade school games — plus ebooks and browser games on EbookGamez.

I'm not looking for paid advertising. I'd like guidance on:`,
        [
          "Reaching students, career-changers, and homeschool families with zero ongoing marketing cost",
          "Whether our free tools fit any SCORE resource listings or workshops",
          "A sensible growth plan for a bootstrap edtech/content business",
        ],
        `Links:
- LearnForge: ${gamesUrl(origin)}
- EbookGamez: ${OUTREACH.ebookgamezUrl}

Thank you,`,
      ),
  },
  {
    id: "sbdc",
    org: "SBDC",
    where: "https://www.sba.gov/local-assistance/find/?type=Small%20Business%20Development%20Center",
    subject: "Free counseling request — digital learning platform",
    body: (origin) =>
      `Hello,

I'm ${OUTREACH.name}. I run LearnForge (free AI practice exams + educational games) and EbookGamez.com (ebooks + free browser games). Everything is built in-house; we're focused on free access for learners.

I'd like a free SBDC session to discuss:
- Local and online channels to reach learners without paid ads
- Positioning for workforce / adult education partners
- Whether we qualify for any community or workforce referral programs

Happy to share our sites and subscriber growth metrics.

Best,

${outreachSignature()}

LearnForge: ${gamesUrl(origin)}
EbookGamez: ${OUTREACH.ebookgamezUrl}`,
  },
  {
    id: "helpful-marketing",
    org: "Helpful Marketing",
    where: "https://helpfulmarketing.org/ (MWV-owned businesses)",
    subject: "Application — pro bono digital marketing for free edtech",
    body: (origin) =>
      `Hello Helpful Marketing team,

I'm ${OUTREACH.name}, applying for pro bono support for our business operating LearnForge and EbookGamez.com.

We offer free learning games, career practice tools, and AI exams. We need help with SEO, social strategy, and reaching homeschool and career audiences — without paid ad spend.

- LearnForge: ${gamesUrl(origin)}
- EbookGamez: ${OUTREACH.ebookgamezUrl}

Thank you for considering us,

${outreachSignature()}`,
  },
  {
    id: "braven",
    org: "Braven Foundation",
    where: "https://bravenfoundation.com/ (California)",
    subject: "Digital Communities Program — free educational tools",
    body: (origin) =>
      `Hello,

I'm ${OUTREACH.name}, a California small business owner building LearnForge and EbookGamez.com — free practice exams, skill games, and digital books for students and career-changers.

I'd like to learn if we qualify for the Digital Communities Program and what marketing or listing support might be available.

Links: ${gamesUrl(origin)}, ${OUTREACH.ebookgamezUrl}

${outreachSignature()}`,
  },
  {
    id: "volta",
    org: "Volta NYC",
    where: "https://voltanyc.org/partners (NYC only)",
    subject: "Partner application — NYC edtech / content business",
    body: (origin) =>
      `Hello Volta NYC,

I'm ${OUTREACH.name}, running LearnForge and EbookGamez.com — free learning games, career tools, and digital books. I'm looking for free help with social content, web presence, or outreach strategy.

${outreachSignature()}

LearnForge: ${gamesUrl(origin)}`,
  },
];

export function weeklyDigestBody(learnforgeOrigin: string): { subject: string; text: string; html: string } {
  const games = learnforgeGamesUrl(learnforgeOrigin);
  const subject = "LearnForge weekly picks — games & learning updates";
  const text = `Hi ${OUTREACH.name},

Your LearnForge umbrella update (draft — send to subscribers from Resend when ready):

NEW & FEATURED
- School Skills Lab (K–12, college, trade school)
- Career Skills Lab (19 careers)
- Quiz Show, Survival Run, Career Cash

PLAY & LEARN
- Games: ${games}
- EbookGamez: ${OUTREACH.ebookgamezUrl}

Tip: Partnership outreach (SCORE, SBDC) stays manual from Gmail with CC ${OUTREACH.yahooEmail}.

— LearnForge outreach helper`;

  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5">
<h2>LearnForge weekly picks</h2>
<p>Draft for your Literary Club / Resend broadcast:</p>
<ul>
<li><strong>School Skills Lab</strong> — K–12, college & trade</li>
<li><strong>Career Skills Lab</strong> — 19 careers</li>
<li><strong>Quiz Show, Survival Run, Career Cash</strong></li>
</ul>
<p><a href="${games}">Play games</a> · <a href="${OUTREACH.ebookgamezUrl}">EbookGamez</a></p>
<p style="font-size:13px;color:#666">Partnership mail: use Gmail, CC ${OUTREACH.yahooEmail}</p>
</body></html>`;

  return { subject, text, html };
}
