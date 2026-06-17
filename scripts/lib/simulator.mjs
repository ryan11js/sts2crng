import { cloneJson, getPath } from "./pack-tools.mjs";
import { simulateSeedSweep } from "./sts2/recipes.mjs";

const defaultTolerance = 0.25;

export function buildGeneratedPack(articlePack, options = {}) {
  const samples = options.samples ?? 1000000;
  const seedStart = options.seedStart ?? 0;
  const mode = options.mode ?? articlePack.mode;
  const steam64 = options.steam64 ?? null;
  const simulation = simulateSeedSweep({
    samples,
    seedStart,
    mode,
    steam64
  });
  const simulatedRecipes = simulation.recipeReports.filter((recipe) => recipe.status === "simulated").map((recipe) => recipe.id);
  const skippedRecipes = simulation.recipeReports.filter((recipe) => recipe.status !== "simulated");

  return {
    id: `${articlePack.id}-${mode}-generated`,
    label: `${articlePack.label} ${mode} generated pack`,
    basedOn: articlePack.id,
    sourceUrl: articlePack.sourceUrl,
    sourceLabel: articlePack.sourceLabel,
    sourceDate: articlePack.sourceDate,
    mode,
    predictionSource: mode === "coop" ? "generated-coop-calibrated" : "generated-single",
    steam64: steam64 === null ? undefined : String(steam64),
    samples,
    seedRange: {
      start: seedStart,
      count: samples
    },
    deterministic: true,
    tables: cloneJson(articlePack.tables),
    generatedTables: simulation.generatedTables,
    recipes: cloneJson(articlePack.recipes),
    simulator: {
      simulatedRecipes,
      skippedRecipes,
      recipeReports: simulation.recipeReports,
      requiredCoreRecipes: simulation.requiredCoreRecipes,
      mechanics: simulation.mechanics,
      tableFallback: true,
      note:
        "Article tables are preserved as fallback data. Generated tables only come from encoded seed-sweep recipes."
    }
  };
}

export function compareGeneratedToArticle(articlePack, generatedPack, options = {}) {
  const tolerance = options.tolerance ?? defaultTolerance;
  const failures = [];
  const skipped = [];
  const compared = [];

  const reportsById = Object.fromEntries((generatedPack.simulator?.recipeReports ?? []).map((report) => [report.id, report]));

  for (const recipe of Object.values(articlePack.recipes)) {
    const report = reportsById[recipe.id];
    if (report?.status !== "simulated") {
      skipped.push(recipe.id);
      continue;
    }

    const generated = generatedPack.generatedTables[recipe.id];
    const expected = getPath(articlePack, recipe.tablePath);
    if (!generated) {
      failures.push(`${recipe.id}: missing generated table`);
      continue;
    }

    compareNumbers(expected, generated, recipe.id, tolerance, failures);
    compared.push(recipe.id);
  }

  return {
    compared,
    skipped,
    failures,
    tolerance
  };
}

function compareNumbers(expected, actual, path, tolerance, failures) {
  if (typeof expected === "number") {
    if (typeof actual !== "number") {
      failures.push(`${path}: expected number, got ${typeof actual}`);
      return;
    }
    const delta = Math.abs(expected - actual);
    if (delta > tolerance) {
      failures.push(`${path}: expected ${expected}, got ${actual}, delta ${delta.toFixed(4)}`);
    }
    return;
  }

  if (!expected || typeof expected !== "object") {
    return;
  }

  for (const key of Object.keys(expected)) {
    compareNumbers(expected[key], actual?.[key], `${path}.${key}`, tolerance, failures);
  }
}

const simulatedRecipeImplementations = {};
