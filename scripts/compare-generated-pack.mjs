import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { compareGeneratedToArticle } from "./lib/simulator.mjs";
import { fail, findPack, parseArgs } from "./lib/pack-tools.mjs";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  console.log(
    "Usage: node scripts/compare-generated-pack.mjs --version v0.107.0 --generated generated/v0.107.0/single/generated-pack.json [--tolerance 0.25] [--allow-pending] [--out generated/v0.107.0/single/parity-report.json]"
  );
  process.exit(0);
}

const version = args.version ?? "v0.107.0";
const generatedPath = args.generated ?? `generated/${version}/single/generated-pack.json`;
const tolerance = args.tolerance === undefined ? 0.25 : Number(args.tolerance);
const allowPending = Boolean(args["allow-pending"]);
const outputPath = args.out ?? `generated/${version}/single/parity-report.json`;
const failures = [];

if (!Number.isFinite(tolerance) || tolerance < 0) {
  failures.push("--tolerance must be a non-negative number");
}
if (!existsSync(generatedPath)) {
  failures.push(`Generated pack not found: ${generatedPath}`);
}

if (failures.length === 0) {
  const articlePack = findPack(version);
  const generatedPack = JSON.parse(readFileSync(generatedPath, "utf8"));
  const parity = compareGeneratedToArticle(articlePack, generatedPack, { tolerance });
  const requiredCoreRecipes = generatedPack.simulator?.requiredCoreRecipes ?? [];
  const reportsById = Object.fromEntries((generatedPack.simulator?.recipeReports ?? []).map((report) => [report.id, report]));
  const pendingRequired = requiredCoreRecipes.filter((id) => reportsById[id]?.status !== "simulated");

  failures.push(...parity.failures);
  if (!allowPending) {
    for (const id of pendingRequired) {
      const report = reportsById[id];
      failures.push(`${id}: required parity recipe is ${report?.status ?? "missing"} (${report?.reason ?? "no report"})`);
    }
  }

  const report = {
    version,
    generatedPath,
    tolerance,
    allowPending,
    compared: parity.compared,
    skipped: parity.skipped,
    pendingRequired,
    failures,
    generatedAt: new Date().toISOString()
  };

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);

  if (failures.length > 0) {
    fail(`Generated pack parity failed. Report written to ${outputPath}`, failures);
  } else {
    console.log(`Generated pack parity passed. Report written to ${outputPath}`);
    console.log(`${parity.compared.length} recipes compared, ${parity.skipped.length} skipped.`);
    if (pendingRequired.length > 0) {
      console.log(`${pendingRequired.length} required recipes are still pending, allowed by --allow-pending.`);
    }
  }
} else {
  fail("Generated pack parity failed.", failures);
}
