import { readJsonl } from "../lib/collect/files.mjs";
import { parseArgs } from "../lib/pack-tools.mjs";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  console.log("Usage: node scripts/sim/suggest-next-observations.mjs [--runs data/runs.jsonl]");
  process.exit(0);
}

const runs = readJsonl(args.runs ?? "data/runs.jsonl");
const suggestions = [];

if (runs.length < 20) {
  suggestions.push("Collect more complete Act 1 starts: character, act, Neow relic shown, Neow choice result.");
}
if (runs.filter((run) => run.observations?.firstFightGold !== undefined).length < 20) {
  suggestions.push("Record fight 1 gold; it is the clean second-roll proxy for reward/event correlations.");
}
if (runs.filter((run) => run.observations?.firstRewardType !== undefined).length < 20) {
  suggestions.push("Record fight 1 reward type; it is the clean third-roll proxy used by Orobas-style predictions.");
}
if (runs.filter((run) => Object.keys(run.observations ?? {}).some((key) => key.startsWith("event."))).length < 20) {
  suggestions.push("Prioritize early event outcomes: first ? room, Trash Heap, Doll Room, Tezcatara.");
}

if (suggestions.length === 0) {
  suggestions.push("Coverage looks healthy; next step is recovering exact stream offsets/list orders from game files or an exporter mod.");
}

console.log("Next best observations");
for (const suggestion of suggestions) {
  console.log(`- ${suggestion}`);
}
