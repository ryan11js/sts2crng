import { cloneJson, getPath } from "./pack-tools.mjs";

const defaultTolerance = 0.25;

export function buildGeneratedPack(articlePack, options = {}) {
  const samples = options.samples ?? 1000000;
  const seedStart = options.seedStart ?? 0;
  const generatedTables = {};
  const skippedRecipes = [];
  const simulatedRecipes = [];

  for (const recipe of Object.values(articlePack.recipes)) {
    if (recipe.status !== "simulated") {
      skippedRecipes.push({
        id: recipe.id,
        tablePath: recipe.tablePath,
        reason: recipe.reason ?? "Recipe is article-backed only."
      });
      continue;
    }

    const implementation = simulatedRecipeImplementations[recipe.id];
    if (!implementation) {
      skippedRecipes.push({
        id: recipe.id,
        tablePath: recipe.tablePath,
        reason: "Recipe is marked simulated but has no local implementation yet."
      });
      continue;
    }

    generatedTables[recipe.id] = implementation({
      articlePack,
      recipe,
      samples,
      seedStart
    });
    simulatedRecipes.push(recipe.id);
  }

  return {
    id: `${articlePack.id}-local-generated`,
    label: `${articlePack.label} local generated pack`,
    basedOn: articlePack.id,
    sourceUrl: articlePack.sourceUrl,
    sourceLabel: articlePack.sourceLabel,
    sourceDate: articlePack.sourceDate,
    mode: articlePack.mode,
    samples,
    seedRange: {
      start: seedStart,
      count: samples
    },
    deterministic: true,
    tables: cloneJson(articlePack.tables),
    generatedTables,
    recipes: cloneJson(articlePack.recipes),
    simulator: {
      simulatedRecipes,
      skippedRecipes,
      tableFallback: true,
      note:
        "Article tables are preserved as fallback data until each recipe graduates from tableOnly to simulated."
    }
  };
}

export function compareGeneratedToArticle(articlePack, generatedPack, options = {}) {
  const tolerance = options.tolerance ?? defaultTolerance;
  const failures = [];
  const skipped = [];
  const compared = [];

  for (const recipe of Object.values(articlePack.recipes)) {
    if (recipe.status !== "simulated") {
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
