import { db, accessCodesTable } from "@workspace/db";

/**
 * Mints redeemable LearnForge Pro access codes.
 *
 * Sponsors / schools pay through any channel (including in countries Stripe does
 * not fully cover), and you issue them codes generated here. A student redeems a
 * code in the app to receive Pro for `--days` days.
 *
 * Usage:
 *   pnpm --filter @workspace/scripts run mint-codes -- --count 20 --days 365 --note "Lincoln High"
 *   pnpm --filter @workspace/scripts run mint-codes -- --count 5 --days 30 --expires-days 90
 *
 * Flags:
 *   --count N         how many codes to create        (default 1)
 *   --days N          days of Pro each code grants     (default 365)
 *   --note "text"     label for tracking (school, batch)
 *   --expires-days N  codes unredeemed after N days are void (default: never)
 */

// Unambiguous alphabet (no 0/O/1/I to avoid transcription errors).
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomGroup(len: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}

function generateCode(): string {
  return `LF-${randomGroup(4)}-${randomGroup(4)}`;
}

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        args[key] = next;
        i++;
      } else {
        args[key] = "true";
      }
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const count = Math.max(1, parseInt(args.count ?? "1", 10) || 1);
  const days = Math.max(1, parseInt(args.days ?? "365", 10) || 365);
  const note = args.note ?? null;
  const expiresDays = args["expires-days"]
    ? parseInt(args["expires-days"], 10)
    : null;
  const expiresAt =
    expiresDays && expiresDays > 0
      ? new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000)
      : null;

  const created: string[] = [];

  for (let i = 0; i < count; i++) {
    // Retry on the rare unique collision.
    let inserted = false;
    for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
      const code = generateCode();
      try {
        await db.insert(accessCodesTable).values({
          code,
          durationDays: days,
          note,
          expiresAt,
        });
        created.push(code);
        inserted = true;
      } catch {
        // collision — try a new code
      }
    }
    if (!inserted) {
      throw new Error("Could not generate a unique code after several attempts");
    }
  }

  console.log(
    `Minted ${created.length} code(s): ${days} days of Pro each` +
      (note ? `, note="${note}"` : "") +
      (expiresAt ? `, expires ${expiresAt.toISOString().slice(0, 10)}` : "") +
      ":",
  );
  for (const c of created) console.log(`  ${c}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error minting codes:", err?.message ?? err);
    process.exit(1);
  });
