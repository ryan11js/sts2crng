import { articlePackV01070 } from "../../src/data.js";
import { parseArgs, summarizeRecipes } from "../lib/pack-tools.mjs";
import { readJsonl } from "../lib/collect/files.mjs";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  console.log("Usage: node scripts/sim/report-coverage.mjs [--runs data/runs.jsonl]");
  process.exit(0);
}

const runs = readJsonl(args.runs ?? "data/runs.jsonl");
const recipeSummary = summarizeRecipes(articlePackV01070);
const observationCoverage = {
  runs: runs.length,
  withNeowRelic: runs.filter((run) => run.neowRelic && run.neowRelic !== "unknown").length,
  withFightGold: runs.filter((run) => run.observations?.firstFightGold !== undefined).length,
  withFirstReward: runs.filter((run) => run.observations?.firstRewardType !== undefined).length,
  withEventObservation: runs.filter((run) => Object.keys(run.observations ?? {}).some((key) => key.startsWith("event."))).length
};

console.log("Recipe coverage");
console.log(`- simulated: ${recipeSummary.simulated}`);
console.log(`- table-only: ${recipeSummary.tableOnly}`);
console.log(`- unsupported: ${recipeSummary.unsupported}`);
console.log("Observation coverage");
for (const [key, value] of Object.entries(observationCoverage)) {
  console.log(`- ${key}: ${value}`);
}
