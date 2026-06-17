import { dataPacks } from "../../src/data.js";

export function findPack(version) {
  const pack = dataPacks.find((candidate) => candidate.id === version);
  if (!pack) {
    const versions = dataPacks.map((candidate) => candidate.id).join(", ");
    throw new Error(`Unknown pack "${version}". Available packs: ${versions}`);
  }
  return pack;
}

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      throw new Error(`Unexpected positional argument "${arg}"`);
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

export function requirePositiveInteger(value, label) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }
  return parsed;
}

export function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

export function getPath(root, path) {
  return path.split(".").reduce((current, part) => current?.[part], root);
}

export function visitNumbers(value, visitor, path = []) {
  if (typeof value === "number") {
    visitor(value, path);
    return;
  }
  if (!value || typeof value !== "object") {
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    visitNumbers(child, visitor, [...path, key]);
  }
}

export function validatePackShape(pack) {
  const errors = [];
  const requiredStrings = ["id", "label", "sourceUrl", "sourceLabel", "sourceDate", "mode"];
  for (const field of requiredStrings) {
    if (typeof pack[field] !== "string" || pack[field].length === 0) {
      errors.push(`pack.${field} must be a non-empty string`);
    }
  }

  if (!["single", "coop"].includes(pack.mode)) {
    errors.push(`pack.mode must be "single" or "coop", got "${pack.mode}"`);
  }
  if (!pack.tables || typeof pack.tables !== "object") {
    errors.push("pack.tables must be an object");
  }
  if (!pack.recipes || typeof pack.recipes !== "object") {
    errors.push("pack.recipes must be an object");
  }
  if (!Array.isArray(pack.unsupportedRecipes)) {
    errors.push("pack.unsupportedRecipes must be an array");
  }

  if (pack.tables && typeof pack.tables === "object") {
    visitNumbers(pack.tables, (value, path) => {
      if (!Number.isFinite(value)) {
        errors.push(`tables.${path.join(".")} must be finite`);
      }
      if (value < 0) {
        errors.push(`tables.${path.join(".")} must be non-negative`);
      }
    });
  }

  for (const [key, recipe] of Object.entries(pack.recipes ?? {})) {
    if (recipe.id !== key) {
      errors.push(`recipes.${key}.id must match its key`);
    }
    if (!recipe.tablePath || typeof recipe.tablePath !== "string") {
      errors.push(`recipes.${key}.tablePath must be a string`);
    } else if (getPath(pack, recipe.tablePath) === undefined) {
      errors.push(`recipes.${key}.tablePath points at missing path "${recipe.tablePath}"`);
    }
    if (!["simulated", "tableOnly"].includes(recipe.status)) {
      errors.push(`recipes.${key}.status must be "simulated" or "tableOnly"`);
    }
  }

  for (const recipe of pack.unsupportedRecipes ?? []) {
    if (!recipe.id || !recipe.reason) {
      errors.push("unsupportedRecipes entries need id and reason");
    }
  }

  return errors;
}

export function summarizeRecipes(pack) {
  const summary = {
    total: 0,
    simulated: 0,
    tableOnly: 0,
    unsupported: pack.unsupportedRecipes?.length ?? 0
  };

  for (const recipe of Object.values(pack.recipes ?? {})) {
    summary.total += 1;
    if (recipe.status === "simulated") {
      summary.simulated += 1;
    }
    if (recipe.status === "tableOnly") {
      summary.tableOnly += 1;
    }
  }

  return summary;
}

export function fail(message, details = []) {
  console.error(message);
  for (const detail of details) {
    console.error(`- ${detail}`);
  }
  process.exitCode = 1;
}
