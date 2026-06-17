import { buildGeneratedPack } from "./lib/simulator.mjs";
import { fail, findPack, parseArgs, requirePositiveInteger, validatePackShape } from "./lib/pack-tools.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  console.log(
    "Usage: node scripts/generate-pack.mjs --version v0.107.0 --mode single --samples 1000000 [--seed-start 0] [--steam64 7656...] [--out generated/v0.107.0/single/generated-pack.json]"
  );
  process.exit(0);
}

const version = args.version ?? "v0.107.0";
const mode = args.mode ?? "single";
const samples = requirePositiveInteger(args.samples ?? "1000000", "--samples");
const seedStart = Number(args["seed-start"] ?? 0);
const steam64 = args.steam64 ?? null;

if (!Number.isInteger(seedStart)) {
  fail("Pack generation failed.", ["--seed-start must be an integer"]);
} else if (!["single", "coop"].includes(mode)) {
  fail("Pack generation failed.", ['--mode must be "single" or "coop"']);
} else if (steam64 !== null && !/^\d+$/.test(String(steam64))) {
  fail("Pack generation failed.", ["--steam64 must contain only digits"]);
} else {
  const articlePack = findPack(version);
  const errors = validatePackShape(articlePack);
  if (errors.length > 0) {
    fail("Source article pack is invalid.", errors);
  } else {
    const generatedPack = buildGeneratedPack(articlePack, {
      mode,
      samples,
      seedStart,
      steam64
    });
    const output = `${JSON.stringify(generatedPack, null, 2)}\n`;
    if (args.out) {
      mkdirSync(dirname(args.out), { recursive: true });
      writeFileSync(args.out, output);
      console.log(`Generated pack written to ${args.out}`);
      console.log(
        `Recipes: ${generatedPack.simulator.simulatedRecipes.length} simulated, ${generatedPack.simulator.skippedRecipes.length} blocked.`
      );
    } else {
      process.stdout.write(output);
    }
  }
}
