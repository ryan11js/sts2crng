import { createCounter, increment, toPercentDistribution } from "./aggregation.mjs";
import { ACTS, knownMechanics, snapshotRun } from "./mechanics.mjs";
import { seedRange } from "./seed-range.mjs";

const requiredCoreRecipes = ["actOneVariant", "neowCursePoolRelic", "neowBonesCurse", "largeCapsuleRarity"];

export function simulateSeedSweep({ samples, seedStart = 0, mode = "single", steam64 = null, recipeIds = null }) {
  const selectedRecipeIds = recipeIds ?? Object.keys(recipeDefinitions);
  const selectedRecipes = selectedRecipeIds.map((id) => recipeDefinitions[id]).filter(Boolean);
  const generatedTables = {};
  const recipeReports = [];
  const activeRecipes = selectedRecipes.filter((recipe) => recipe.status === "simulated");

  for (const recipe of selectedRecipes) {
    if (recipe.status !== "simulated") {
      recipeReports.push(blockedReport(recipe));
    }
  }

  const state = Object.fromEntries(activeRecipes.map((recipe) => [recipe.id, recipe.createState()]));

  for (const seed of seedRange({ start: seedStart, count: samples })) {
    const run = snapshotRun(seed, { mode, steam64 });
    for (const recipe of activeRecipes) {
      recipe.observe(state[recipe.id], run);
    }
  }

  for (const recipe of activeRecipes) {
    generatedTables[recipe.id] = recipe.finish(state[recipe.id]);
    recipeReports.push({
      id: recipe.id,
      label: recipe.label,
      status: "simulated",
      source: "seed-sweep",
      samples,
      tablePath: recipe.tablePath,
      requiredMechanics: recipe.requiredMechanics,
      notes: recipe.notes ?? []
    });
  }

  recipeReports.sort((a, b) => selectedRecipeIds.indexOf(a.id) - selectedRecipeIds.indexOf(b.id));

  return {
    generatedTables,
    recipeReports,
    requiredCoreRecipes,
    mechanics: knownMechanics
  };
}

function blockedReport(recipe) {
  return {
    id: recipe.id,
    label: recipe.label,
    status: "blocked",
    tablePath: recipe.tablePath,
    requiredMechanics: recipe.requiredMechanics,
    reason: recipe.reason,
    notes: recipe.notes ?? []
  };
}

export const recipeDefinitions = {
  actOneVariant: {
    id: "actOneVariant",
    label: "Act 1 variant",
    status: "simulated",
    tablePath: "tables.actOneVariant",
    requiredMechanics: ["base seed RNG", "first base RNG roll", "actRoll < 0.5 => Underdocks"],
    createState: () => createCounter([ACTS.underdocks, ACTS.overgrowth]),
    observe: (state, run) => increment(state, run.act),
    finish: (state) => toPercentDistribution(state),
    notes: ["This is the only recipe currently reproduced directly from encoded mechanics."]
  },
  neowCursePoolRelic: {
    id: "neowCursePoolRelic",
    label: "Neow relic offer",
    status: "blocked",
    tablePath: "tables.actRelicDistribution",
    requiredMechanics: [
      "concrete hash(\"NEOW\") value",
      "Neow event seed = seed + 1 + hash(\"NEOW\")",
      "first Neow RNG call",
      "ordered list of 8 Neow relic options"
    ],
    reason: "The article gives the formula shape but not the concrete hash value or verified list order."
  },
  neowBonesCurse: {
    id: "neowBonesCurse",
    label: "Neow's Bones curse",
    status: "blocked",
    tablePath: "tables.neowsBonesCurse",
    requiredMechanics: [
      "Neow relic offer recipe",
      "concrete hash(\"niche\") value",
      "curse list order",
      "New Leaf/Kaleidoscope invalidation rules"
    ],
    reason: "Needs the Neow recipe plus the Niche stream offset and curse list order."
  },
  largeCapsuleRarity: {
    id: "largeCapsuleRarity",
    label: "Large Capsule first relic rarity",
    status: "blocked",
    tablePath: "tables.largeCapsuleRarity",
    requiredMechanics: ["Neow relic offer recipe", "relic rarity stream offset", "rarity thresholds"],
    reason: "Relic rarity stream and thresholds still need game-file/exporter validation."
  },
  firstPotionDrop: {
    id: "firstPotionDrop",
    label: "First fight potion drop",
    status: "blocked",
    tablePath: "tables.firstPotionDrop",
    requiredMechanics: ["reward stream offset", "first reward call", "Neow reward-consumption rules"],
    reason: "Reward stream offset and call-order rules are not encoded yet."
  },
  firstQuestionCombat: {
    id: "firstQuestionCombat",
    label: "First question mark combat",
    status: "blocked",
    tablePath: "tables.firstQuestionCombat",
    requiredMechanics: ["unknown map/event stream offset", "first ? room call", "combat threshold"],
    reason: "Map/event stream constants are not encoded yet."
  },
  trashHeap: {
    id: "trashHeap",
    label: "Trash Heap",
    status: "blocked",
    tablePath: "tables.trashHeap",
    requiredMechanics: ["Trash Heap event offset", "single-player offset = 1", "card/relic list order"],
    reason: "Event-specific offset and list order are not encoded yet."
  },
  dollRoom: {
    id: "dollRoom",
    label: "Doll Room",
    status: "blocked",
    tablePath: "tables.dollRoom",
    requiredMechanics: ["Doll Room event offset", "single-player offset = 1", "one-doll outcome order"],
    reason: "Event-specific offset and outcome order are not encoded yet."
  },
  tezcataraOptionOne: {
    id: "tezcataraOptionOne",
    label: "Tezcatara option 1",
    status: "blocked",
    tablePath: "tables.tezcataraOptionOne",
    requiredMechanics: ["Tezcatara event offset", "option 1 call order", "outcome order"],
    reason: "Event-specific offset and option call order are not encoded yet."
  },
  paelOptionTwo: {
    id: "paelOptionTwo",
    label: "Pael option 2",
    status: "blocked",
    tablePath: "tables.paelOptionTwoByGold",
    requiredMechanics: ["reward stream second roll", "Pael event offset", "option 2 call order"],
    reason: "Needs first-fight gold generation and Pael option call order."
  },
  orobasOption: {
    id: "orobasOption",
    label: "Orobas option",
    status: "blocked",
    tablePath: "tables.orobasOptionByReward",
    requiredMechanics: ["reward stream third-roll proxy", "Orobas event offset", "pre-option Sea Glass/Gem calls"],
    reason: "Needs reward proxy generation and Orobas internal call order."
  }
};
