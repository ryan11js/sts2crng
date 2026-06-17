import { readJsonFile } from "../lib/collect/files.mjs";
import { validateRunRecord } from "../lib/collect/run-schema.mjs";
import { fail, parseArgs } from "../lib/pack-tools.mjs";

const args = parseArgs(process.argv.slice(2));
const files = args.file ? [args.file] : process.argv.slice(2).filter((arg) => !arg.startsWith("--"));

if (args.help || files.length === 0) {
  console.log("Usage: node scripts/collect/validate-run.mjs --file imports/discord/run.json");
  process.exit(args.help ? 0 : 1);
}

const failures = [];

for (const file of files) {
  try {
    const result = validateRunRecord(readJsonFile(file));
    if (!result.ok) {
      failures.push(`${file}: ${result.errors.join("; ")}`);
    } else {
      console.log(`${file}: valid (${result.record.runId})`);
    }
  } catch (error) {
    failures.push(`${file}: ${error.message}`);
  }
}

if (failures.length > 0) {
  fail("Run validation failed.", failures);
}
