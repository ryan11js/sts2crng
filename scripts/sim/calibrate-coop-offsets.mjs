import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { readJsonl } from "../lib/collect/files.mjs";
import { parseArgs } from "../lib/pack-tools.mjs";
import { steam64Offset } from "../lib/sts2/mechanics.mjs";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  console.log("Usage: node scripts/sim/calibrate-coop-offsets.mjs [--input data/runs.jsonl] [--out generated/v0.107.0/coop]");
  process.exit(0);
}

const inputPath = args.input ?? "data/runs.jsonl";
const outputRoot = args.out ?? "generated/v0.107.0/coop";
const runs = readJsonl(inputPath).filter((run) => run.mode === "coop");
const byPlayer = groupBy(runs, (run) => run.playerSteam64);

mkdirSync(outputRoot, { recursive: true });

if (byPlayer.size === 0) {
  console.log("No co-op runs available for calibration.");
}

for (const [steam64, playerRuns] of byPlayer.entries()) {
  const eventObservationCount = playerRuns.filter((run) => Object.keys(run.observations ?? {}).some((key) => key.startsWith("event."))).length;
  const report = {
    steam64,
    candidateNumericOffset: steam64Offset(steam64),
    status: eventObservationCount >= 5 ? "blocked-missing-event-formula" : "needs-more-observations",
    runCount: playerRuns.length,
    eventObservationCount,
    confidence: 0,
    summary:
      "The importer has raw Steam64 data, but event-specific offsets and exact co-op formula are not encoded yet. This report is ready for offset search once event recipes are simulated.",
    nextBestObservations: [
      "Neow relic shown",
      "first ? room result",
      "Trash Heap card/relic result",
      "Doll Room one-doll result",
      "Tezcatara option 1 result"
    ],
    generatedAt: new Date().toISOString()
  };
  const outputDir = join(outputRoot, steam64);
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, "calibration-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`${steam64}: ${report.status}, ${playerRuns.length} run(s), ${eventObservationCount} event observation(s).`);
}

function groupBy(items, keyFn) {
  const groups = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(item);
  }
  return groups;
}
