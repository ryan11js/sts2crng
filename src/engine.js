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

function card({
  title,
  subtitle,
  distribution,
  note,
  confidence = versionPack.predictionSource ?? "article",
  featured = false,
  normalize = false
}) {
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
  if (state.neowConsumption === "unknown" && state.neowPickedRelic && state.neowPickedRelic !== "unknown") {
    return ["Some predictions may be off until the selected Neow relic's output is recorded."];
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
    neowPickedRelic: formData.get("neowPickedRelic"),
    neowResult: formData.get("neowResult"),
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
    pieces.push(`anchor ${relicLabel(state.curseRelic)}`);
  }
  if (state.neowPickedRelic && state.neowPickedRelic !== "unknown") {
    pieces.push(`picked ${relicLabel(state.neowPickedRelic)}`);
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
    pills.push({ label: `Curse anchor: ${relicLabel(state.curseRelic)}` });
  }
  if (state.neowPickedRelic && state.neowPickedRelic !== "unknown") {
    pills.push({ label: `Picked: ${relicLabel(state.neowPickedRelic)}` });
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
    actions.push("At Neow, record the three relic offers, including the one with a downside.");
  }
  if (!state.neowPickedRelic || state.neowPickedRelic === "unknown") {
    actions.push("Record which Neow relic you picked.");
  }
  if (state.neowPickedRelic && state.neowPickedRelic !== "unknown" && state.neowConsumption === "unknown") {
    actions.push("Record the selected relic's output.");
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
  const curseAnchorKnown = state.curseRelic !== "unknown";
  const pickedRelic = state.neowPickedRelic ?? "unknown";

  if (actKnown) {
    predictions.push(
      card({
        title: "Neow curse-anchor odds",
        subtitle: getActLabel(state.act),
        distribution: tables.actRelicDistribution[state.act],
        note: "This is the one downside relic among the three Neow offers. It is the main correlation anchor.",
        featured: !curseAnchorKnown
      })
    );
  }

  if (actKnown && pickedRelic === "NeowsBones") {
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

  if (actKnown && pickedRelic === "LargeCapsule") {
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

  if (actKnown && pickedRelic === "HeftyTablet" && state.character === "ironclad") {
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

  if (actKnown && pickedRelic === "LeafyPoultice" && state.character === "ironclad") {
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
      curseAnchorKnown
        ? tables.firstPotionDrop.byRelic[state.act][state.curseRelic]
        : tables.firstPotionDrop.overall[state.act];
    predictions.push(
      card({
        title: "First fight potion drop",
        subtitle: curseAnchorKnown ? relicLabel(state.curseRelic) : `${getActLabel(state.act)} overall`,
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
      curseAnchorKnown
        ? tables.firstQuestionCombat.byRelic[state.act][state.curseRelic]
        : tables.firstQuestionCombat.overall[state.act];
    predictions.push(
      card({
        title: "First question mark is combat",
        subtitle: curseAnchorKnown ? relicLabel(state.curseRelic) : `${getActLabel(state.act)} overall`,
        distribution: inverseBinary(combatChance, "? combat", "Not combat"),
        note: "The act-level average is fairly even, but Neow observations make some rows very lopsided."
      })
    );
  }

  if (state.act === "underdocks") {
    const trashDistribution = curseAnchorKnown ? tables.trashHeap.byRelic[state.curseRelic] : tables.trashHeap.overall;
    predictions.push(
      card({
        title: "Trash Heap card",
        subtitle: curseAnchorKnown ? relicLabel(state.curseRelic) : "Underdocks overall",
        distribution: trashDistribution,
        note: "Rebound is impossible in the single-player Underdocks table. Consecutive card pairs map to the event relic.",
        featured: true
      })
    );
  }

  if (curseAnchorKnown) {
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
        note: "Act-only approximation from the article; the Neow curse anchor is more precise."
      })
    );
  }

  if (actKnown && curseAnchorKnown) {
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
        note: "Act-only headline. Corpse Slug intent plus Neow curse anchor can improve this sharply; that row is queued for the simulator pack."
      })
    );
  }

  if (predictions.length === 0) {
    predictions.push({
      title: "No hard prediction yet",
      subtitle: "Need starting act or Neow curse anchor",
      items: [],
      note: "Choose Underdocks or Overgrowth, then add the one downside relic from the Neow screen to light up the tables.",
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
