import { buildGeneratedPack } from "./lib/simulator.mjs";
import { fail, findPack, parseArgs, requirePositiveInteger, validatePackShape } from "./lib/pack-tools.mjs";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  console.log("Usage: node scripts/generate-pack.mjs --version v0.107.0 --samples 1000000 [--seed-start 0]");
  process.exit(0);
}

const version = args.version ?? "v0.107.0";
const samples = requirePositiveInteger(args.samples ?? "1000000", "--samples");
const seedStart = Number(args["seed-start"] ?? 0);

if (!Number.isInteger(seedStart)) {
  fail("Pack generation failed.", ["--seed-start must be an integer"]);
} else {
  const articlePack = findPack(version);
  const errors = validatePackShape(articlePack);
  if (errors.length > 0) {
    fail("Source article pack is invalid.", errors);
  } else {
    const generatedPack = buildGeneratedPack(articlePack, {
      samples,
      seedStart
    });
    process.stdout.write(`${JSON.stringify(generatedPack, null, 2)}\n`);
  }
}
