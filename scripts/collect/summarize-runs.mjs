import { readJsonl } from "../lib/collect/files.mjs";
import { parseArgs } from "../lib/pack-tools.mjs";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  console.log("Usage: node scripts/collect/summarize-runs.mjs [--input data/runs.jsonl]");
  process.exit(0);
}

const inputPath = args.input ?? "data/runs.jsonl";
const runs = readJsonl(inputPath);
const byMode = countBy(runs, (run) => run.mode);
const byPlayer = countBy(runs, (run) => run.playerSteam64);
const byAct = countBy(runs, (run) => run.act);

console.log(`Runs: ${runs.length}`);
console.log(`Input: ${inputPath}`);
console.log(`Modes: ${formatCounts(byMode) || "none"}`);
console.log(`Players: ${formatCounts(byPlayer) || "none"}`);
console.log(`Acts: ${formatCounts(byAct) || "none"}`);

function countBy(items, keyFn) {
  const counts = new Map();
  for (const item of items) {
    const key = keyFn(item) || "unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function formatCounts(counts) {
  return [...counts.entries()].map(([key, value]) => `${key}=${value}`).join(", ");
}
