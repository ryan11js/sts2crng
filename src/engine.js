import { relicLabel, tables, versionPack } from "./data.js";

const sourceHref = versionPack.sourceUrl;

function percent(value) {
  return `${Number(value).toFixed(value % 1 === 0 ? 0 : 2)}%`;
}

function inverseBinary(value, positiveLabel, negativeLabel) {
  return {
    [positiveLabel]: value,
    [negativeLabel]: Math.max(0, 100 - value)
  };
}

function entries(distribution, options = {}) {
  const { normalize = false, limit = 12 } = options;
  const total = Object.values(distribution).reduce((sum, value) => sum + value, 0) || 1;
  return Object.entries(distribution)
    .map(([label, value]) => ({
      label,
      value: normalize ? (value / total) * 100 : value,
      rawValue: value
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function card({ title, subtitle, distribution, note, confidence = "article", featured = false, normalize = false }) {
  return {
    title,
    subtitle,
    items: entries(distribution, { normalize }),
    note,
    confidence,
    featured,
    sourceHref
  };
}

function getActLabel(act) {
  if (act === "underdocks") return "Underdocks";
  if (act === "overgrowth") return "Overgrowth";
  return "Unknown act";
}

function getConsumptionWarnings(state) {
  if (state.neowConsumption === "reward") {
    return [
      "First-fight reward predictions may be off because Neow created a card reward or random relic first."
    ];
  }
  if (state.neowConsumption === "niche") {
    return [
      "Some Neow relic predictions may be off because New Leaf, Kaleidoscope, or a similar effect changed that random sequence."
    ];
  }
  if (state.neowConsumption === "unknown") {
    return ["Some predictions may be off until the Neow choice is recorded."];
  }
  return [];
}

export function buildState(formData) {
  const playerOffset = formData.get("playerOffset");
  return {
    patch: formData.get("patch"),
    mode: formData.get("mode"),
    playerOffset: playerOffset === null || playerOffset === "" ? null : playerOffset,
    character: formData.get("character"),
    act: formData.get("act"),
    curseRelic: formData.get("curseRelic"),
    neowConsumption: formData.get("neowConsumption"),
    firstFightGold: formData.get("firstFightGold"),
    firstRewardType: formData.get("firstRewardType")
  };
}

export function summarizeState(state) {
  const pieces = [];
  if (state.character && state.character !== "unknown") {
    pieces.push(state.character[0].toUpperCase() + state.character.slice(1));
  }
  if (state.act !== "unknown") {
    pieces.push(getActLabel(state.act));
  }
  if (state.curseRelic !== "unknown") {
    pieces.push(relicLabel(state.curseRelic));
  }
  if (state.firstFightGold !== "unknown") {
    pieces.push(`${state.firstFightGold} first-fight gold`);
  }
  return pieces.length > 0 ? pieces.join(" / ") : "Add observations to narrow the run.";
}

export function buildStatusPills(state) {
  const warnings = getConsumptionWarnings(state);
  const pills = [
    { label: versionPack.label },
    { label: "Single-player calibrated" },
    { label: state.act === "unknown" ? "Act unknown" : getActLabel(state.act) }
  ];

  if (state.mode === "coop") {
    pills.push({
      label: "Co-op offset profile not enabled in this pack",
      warn: true
    });
  }

  if (state.curseRelic !== "unknown") {
    pills.push({ label: `Neow relic: ${relicLabel(state.curseRelic)}` });
  }
  warnings.forEach((warning) => pills.push({ label: warning, warn: true }));
  return pills;
}

export function nextActions(state) {
  const actions = [];
  if (state.character === "unknown") {
    actions.push("Record your character.");
  }
  if (state.act === "unknown") {
    actions.push("Record the starting act first.");
  }
  if (state.curseRelic === "unknown") {
    actions.push("At Neow, record the relic shown on the screen.");
  }
  if (state.neowConsumption === "unknown") {
    actions.push("After choosing Neow, record whether a card reward, random relic, New Leaf, or Kaleidoscope appeared.");
  }
  if (state.firstFightGold === "unknown") {
    actions.push("After fight 1, record the gold amount.");
  }
  if (state.firstRewardType === "unknown") {
    actions.push("After fight 1, record the first reward type.");
  }
  return actions.slice(0, 4);
}

export function buildPredictions(state) {
  const predictions = [];
  const actKnown = state.act !== "unknown";
  const relicKnown = state.curseRelic !== "unknown";

  if (actKnown) {
    predictions.push(
      card({
        title: "Neow relic odds",
        subtitle: getActLabel(state.act),
        distribution: tables.actRelicDistribution[state.act],
        note: "This describes which Neow relic appears after the starting act is known.",
        featured: !relicKnown
      })
    );
  }

  if (actKnown && state.curseRelic === "NeowsBones") {
    predictions.push(
      card({
        title: "Neow's Bones curse",
        subtitle: getActLabel(state.act),
        distribution: tables.neowsBonesCurse[state.act],
        note: "Assumes no New Leaf, Kaleidoscope, or similar Neow effect happened before the curse.",
        featured: true
      })
    );
  }

  if (actKnown && state.curseRelic === "LargeCapsule") {
    predictions.push(
      card({
        title: "Large Capsule first relic rarity",
        subtitle: getActLabel(state.act),
        distribution: tables.largeCapsuleRarity[state.act],
        note: "The article reports the first relic is never common in this patch.",
        featured: true
      })
    );
  }

  if (actKnown && state.curseRelic === "HeftyTablet" && state.character === "ironclad") {
    predictions.push(
      card({
        title: "Hefty Tablet first rare",
        subtitle: "Ironclad article table",
        distribution: tables.heftyTabletFirstRare.ironclad[state.act],
        note: "Only the Ironclad table is encoded in this first pass; other characters need simulator-backed data.",
        featured: true
      })
    );
  }

  if (actKnown && state.curseRelic === "LeafyPoultice" && state.character === "ironclad") {
    predictions.push(
      card({
        title: "Leafy Poultice first transform",
        subtitle: "Ironclad article table",
        distribution: tables.leafyPoulticeFirstTransform.ironclad[state.act],
        note: "First transform only. The second transform advances the same stream.",
        featured: true
      })
    );
  }

  if (actKnown) {
    const potionChance =
      relicKnown
        ? tables.firstPotionDrop.byRelic[state.act][state.curseRelic]
        : tables.firstPotionDrop.overall[state.act];
    predictions.push(
      card({
        title: "First fight potion drop",
        subtitle: relicKnown ? relicLabel(state.curseRelic) : `${getActLabel(state.act)} overall`,
        distribution: inverseBinary(potionChance, "Potion", "No potion"),
        note:
          state.neowConsumption === "reward"
            ? "Warning: a Neow card reward or random relic can change this first-fight reward prediction."
            : "Based on the first reward RNG call.",
        featured: true
      })
    );
  }

  if (actKnown) {
    const combatChance =
      relicKnown
        ? tables.firstQuestionCombat.byRelic[state.act][state.curseRelic]
        : tables.firstQuestionCombat.overall[state.act];
    predictions.push(
      card({
        title: "First question mark is combat",
        subtitle: relicKnown ? relicLabel(state.curseRelic) : `${getActLabel(state.act)} overall`,
        distribution: inverseBinary(combatChance, "? combat", "Not combat"),
        note: "The act-level average is fairly even, but Neow observations make some rows very lopsided."
      })
    );
  }

  if (state.act === "underdocks") {
    const trashDistribution = relicKnown ? tables.trashHeap.byRelic[state.curseRelic] : tables.trashHeap.overall;
    predictions.push(
      card({
        title: "Trash Heap card",
        subtitle: relicKnown ? relicLabel(state.curseRelic) : "Underdocks overall",
        distribution: trashDistribution,
        note: "Rebound is impossible in the single-player Underdocks table. Consecutive card pairs map to the event relic.",
        featured: true
      })
    );
  }

  if (relicKnown) {
    predictions.push(
      card({
        title: "Doll Room one-doll result",
        subtitle: relicLabel(state.curseRelic),
        distribution: tables.dollRoom.byRelic[state.curseRelic],
        note: "The two-doll option advances cyclically: Daughter adds Struggles, Struggles adds Bing Bong, Bing Bong adds Daughter."
      })
    );
  } else if (actKnown) {
    predictions.push(
      card({
        title: "Doll Room one-doll heuristic",
        subtitle: getActLabel(state.act),
        distribution: tables.dollRoom.byAct[state.act],
        note: "Act-only approximation from the article; Neow relic observation is more precise."
      })
    );
  }

  if (actKnown && relicKnown) {
    predictions.push(
      card({
        title: "Tezcatara option 1",
        subtitle: `${getActLabel(state.act)} / ${relicLabel(state.curseRelic)}`,
        distribution: tables.tezcataraOptionOne[state.act][state.curseRelic],
        note: "Nutritious Soup can be especially actionable if you are planning Strike removes."
      })
    );
  }

  if (state.firstFightGold !== "unknown") {
    predictions.push(
      card({
        title: "Pael option 2",
        subtitle: `${state.firstFightGold} first-fight gold`,
        distribution: tables.paelOptionTwoByGold[state.firstFightGold],
        note: "Article table assumes Ascension 3+ first-fight gold behavior."
      })
    );
  }

  if (state.firstRewardType !== "unknown") {
    predictions.push(
      card({
        title: "Orobas option",
        subtitle: rewardTypeLabel(state.firstRewardType),
        distribution: tables.orobasOptionByReward[state.firstRewardType],
        note: "Uses first combat reward type as a third-roll proxy; uncommon-card row is waiting for simulator validation."
      })
    );
  }

  if (state.character === "defect" && state.act === "underdocks") {
    predictions.push(
      card({
        title: "First random combat target",
        subtitle: "Defect / Underdocks multi-enemy fights",
        distribution: { Left: 75, Right: 25 },
        note: "Act-only headline. Corpse Slug intent plus Neow relic can improve this sharply; that row is queued for the simulator pack."
      })
    );
  }

  if (predictions.length === 0) {
    predictions.push({
      title: "No hard prediction yet",
      subtitle: "Need starting act or Neow relic",
      items: [],
      note: "Choose Underdocks or Overgrowth, then add the relic shown at Neow to light up the tables.",
      confidence: "waiting",
      sourceHref
    });
  }

  return predictions;
}

function rewardTypeLabel(id) {
  const labels = {
    commonPotion: "Common potion",
    uncommonPotion: "Uncommon potion",
    rarePotion: "Rare potion",
    commonCard: "Common card"
  };
  return labels[id] ?? id;
}

export { percent };
