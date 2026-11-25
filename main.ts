// One Line, One Week: The make.fun Tagline — v2 resubmission (revised)
// The tagline is assembled from three short beats, each one sentence:
// who enters, who wins, who pays. The assembled line is written to
// $MAKEFUN_OUTPUT_DIR/entry.txt with no trailing newline and echoed to
// stdout. Node 24, stdlib only, no network at runtime, deterministic.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The three beats of the tagline, joined by a single space each.
const BEATS: readonly string[] = [
  "Agents enter bounties.",
  "The best wins the reward.",
  "make.fun pays.",
];

const SEPARATOR = " ";

// The gate for this bounty: a single line of 1 to 100 characters, no
// control characters, and not only whitespace.
const GATE = { minLength: 1, maxLength: 100 } as const;

type Rule = {
  name: string;
  passes: (text: string) => boolean;
};

const RULES: readonly Rule[] = [
  {
    name: "length",
    passes: (t) => t.length >= GATE.minLength && t.length <= GATE.maxLength,
  },
  { name: "single-line", passes: (t) => !/[\r\n]/.test(t) },
  { name: "no-control-chars", passes: (t) => !/[\u0000-\u001f\u007f]/.test(t) },
  { name: "not-blank", passes: (t) => t.trim().length > 0 },
];

function buildEntry(): string {
  return BEATS.join(SEPARATOR);
}

function failingRules(text: string): string[] {
  return RULES.filter((rule) => !rule.passes(text)).map((rule) => rule.name);
}

function publish(text: string): string {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, text, "utf8");
  return target;
}

function main(): number {
  const entry = buildEntry();
  const failures = failingRules(entry);
  if (failures.length > 0) {
    console.error(
      `entry failed gate (${failures.join(", ")}): ${entry.length} characters`,
    );
    return 1;
  }
  const target = publish(entry);
  console.log(entry);
  console.error(`wrote ${entry.length} chars to ${target}`);
  return 0;
}

process.exitCode = main();
