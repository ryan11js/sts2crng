import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { listJsonFiles, readJsonFile, readJsonl, writeJsonl } from "../lib/collect/files.mjs";
import { validateRunRecord } from "../lib/collect/run-schema.mjs";
import { fail, parseArgs } from "../lib/pack-tools.mjs";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  console.log("Usage: node scripts/collect/import-runs.mjs [--input imports/discord] [--out data/runs.jsonl]");
  process.exit(0);
}

const inputDir = args.input ?? "imports/discord";
const outputPath = args.out ?? "data/runs.jsonl";
const inputFiles = listJsonFiles(inputDir);
const existing = readJsonl(outputPath);
const byId = new Map(existing.map((record) => [record.runId, record]));
const failures = [];
let imported = 0;
let duplicates = 0;

mkdirSync(inputDir, { recursive: true });
mkdirSync(dirname(outputPath), { recursive: true });

for (const file of inputFiles) {
  try {
    const result = validateRunRecord(readJsonFile(file));
    if (!result.ok) {
      failures.push(`${file}: ${result.errors.join("; ")}`);
      continue;
    }
    if (byId.has(result.record.runId)) {
      duplicates += 1;
      continue;
    }
    byId.set(result.record.runId, result.record);
    imported += 1;
  } catch (error) {
    failures.push(`${file}: ${error.message}`);
  }
}

writeJsonl(outputPath, [...byId.values()]);

console.log(`Input: ${inputDir}`);
console.log(`Output: ${outputPath}`);
console.log(`Imported ${imported} new run(s), skipped ${duplicates} duplicate(s), total ${byId.size}.`);

if (failures.length > 0) {
  fail("Some run files could not be imported.", failures);
}
