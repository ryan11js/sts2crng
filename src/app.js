import {
  cursePoolRelics,
  isCursePoolRelic,
  neowOutputConfig,
  neowRelics,
  positivePoolRelics,
  relicLabel,
  versionPack
} from "./data.js";
import { buildPredictions, buildState, buildStatusPills, nextActions, percent, summarizeState } from "./engine.js";

const form = document.querySelector("#run-form");
const summaryTitle = document.querySelector("#summary-title");
const predictionGrid = document.querySelector("#prediction-grid");
const statusStrip = document.querySelector("#status-strip");
const nextActionWrap = document.querySelector("#next-actions");
const resetButton = document.querySelector("#reset-button");
const curseRelicSelect = document.querySelector("#curseRelic");
const neowConsumptionInput = document.querySelector("#neowConsumption");
const neowOfferSelects = [...document.querySelectorAll("[data-neow-offer]")];
const neowPickedRelicSelect = document.querySelector("#neowPickedRelic");
const neowResultTitle = document.querySelector("#neow-result-title");
const neowResultSelect = document.querySelector("#neowResult");
const neowPoolNote = document.querySelector("#neow-pool-note");
const firstFightGoldSelect = document.querySelector("#firstFightGold");

function initOptions() {
  for (const select of neowOfferSelects) {
    appendRelicGroups(select);
  }

  for (let gold = 7; gold <= 15; gold += 1) {
    const option = document.createElement("option");
    option.value = String(gold);
    option.textContent = String(gold);
    firstFightGoldSelect.append(option);
  }
}

function render() {
  syncNeowFields();
  const state = buildState(new FormData(form));
  const predictions = buildPredictions(state);
  summaryTitle.textContent = summarizeState(state);
  renderPills(buildStatusPills(state));
  renderNextActions(nextActions(state));
  renderPredictions(predictions);
}

function appendRelicGroups(select, relics = neowRelics) {
  const curseGroup = document.createElement("optgroup");
  curseGroup.label = "Curse pool (the downside relic)";
  for (const relic of cursePoolRelics) {
    if (relics.some((candidate) => candidate.id === relic.id)) {
      curseGroup.append(optionForRelic(relic));
    }
  }

  const positiveGroup = document.createElement("optgroup");
  positiveGroup.label = "Positive pool";
  for (const relic of positivePoolRelics) {
    if (relics.some((candidate) => candidate.id === relic.id)) {
      positiveGroup.append(optionForRelic(relic));
    }
  }

  if (curseGroup.children.length > 0) {
    select.append(curseGroup);
  }
  if (positiveGroup.children.length > 0) {
    select.append(positiveGroup);
  }
}

function optionForRelic(relic) {
  const option = document.createElement("option");
  option.value = relic.id;
  option.textContent = relic.label;
  return option;
}

function syncNeowFields() {
  updatePickedRelicOptions();
  updateOutputOptions();
  updateCurseAnchor();
  updateNeowPoolNote();
}

function selectedOfferIds() {
  return neowOfferSelects.map((select) => select.value).filter((value) => value !== "unknown");
}

function uniqueRelicIds(ids) {
  return [...new Set(ids)];
}

function updatePickedRelicOptions() {
  const current = neowPickedRelicSelect.value;
  const offerIds = uniqueRelicIds(selectedOfferIds());
  const pickableIds = offerIds.length > 0 ? offerIds : neowRelics.map((relic) => relic.id);
  const relics = pickableIds.map((id) => neowRelics.find((relic) => relic.id === id)).filter(Boolean);
  const placeholder = document.createElement("option");
  placeholder.value = "unknown";
  placeholder.textContent = offerIds.length > 0 ? "Choose one of the offers" : "Pick a relic from the three offers";
  neowPickedRelicSelect.replaceChildren(placeholder);
  appendRelicGroups(neowPickedRelicSelect, relics);
  neowPickedRelicSelect.value = pickableIds.includes(current) ? current : "unknown";
}

function updateOutputOptions() {
  const pickedRelic = neowPickedRelicSelect.value;
  const config = neowOutputConfig(pickedRelic);
  const current = neowResultSelect.value;
  neowResultTitle.textContent = config.label;
  neowResultSelect.replaceChildren(
    ...config.options.map((result) => {
      const option = document.createElement("option");
      option.value = result.id;
      option.textContent = result.label;
      option.dataset.consumption = result.consumption;
      return option;
    })
  );

  const optionValues = config.options.map((option) => option.id);
  neowResultSelect.value = optionValues.includes(current) ? current : config.options[0]?.id ?? "unknown";
  neowConsumptionInput.value = neowResultSelect.selectedOptions[0]?.dataset.consumption ?? "unknown";
}

function updateCurseAnchor() {
  const curseOffers = uniqueRelicIds(selectedOfferIds().filter(isCursePoolRelic));
  const pickedRelic = neowPickedRelicSelect.value;
  if (curseOffers.length === 1) {
    curseRelicSelect.value = curseOffers[0];
  } else if (curseOffers.length === 0 && isCursePoolRelic(pickedRelic)) {
    curseRelicSelect.value = pickedRelic;
  } else {
    curseRelicSelect.value = "unknown";
  }
}

function updateNeowPoolNote() {
  const offerCount = selectedOfferIds().length;
  const curseOffers = uniqueRelicIds(selectedOfferIds().filter(isCursePoolRelic));
  neowPoolNote.className = "inline-note";

  if (offerCount === 0) {
    neowPoolNote.textContent = "Neow shows one curse-pool relic and two positive-pool relics.";
  } else if (curseOffers.length === 1) {
    neowPoolNote.textContent = `Curse-pool anchor: ${relicLabel(curseOffers[0])}. The other offers are positive-pool relics.`;
  } else if (curseOffers.length > 1) {
    neowPoolNote.className = "inline-note warn";
    neowPoolNote.textContent = "Neow should show exactly one curse-pool relic. Check the three slots.";
  } else {
    neowPoolNote.className = "inline-note warn";
    neowPoolNote.textContent = "Add the downside relic too; it is the prediction anchor.";
  }
}

function renderPills(pills) {
  statusStrip.replaceChildren(
    ...pills.map((pill) => {
      const node = document.createElement("span");
      node.className = pill.warn ? "pill warn" : "pill";
      node.textContent = pill.label;
      return node;
    })
  );
}

function renderNextActions(actions) {
  if (actions.length === 0) {
    nextActionWrap.replaceChildren();
    return;
  }

  nextActionWrap.replaceChildren(
    ...actions.map((action) => {
      const node = document.createElement("span");
      node.className = "pill";
      node.textContent = action;
      return node;
    })
  );
}

function renderPredictions(predictions) {
  predictionGrid.replaceChildren(...predictions.map(renderPredictionCard));
}

function renderPredictionCard(prediction) {
  const card = document.createElement("article");
  card.className = `prediction-card${prediction.featured ? " featured" : ""}`;

  const head = document.createElement("div");
  head.className = "card-head";

  const headingWrap = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = prediction.title;
  headingWrap.append(title);

  if (prediction.subtitle) {
    const subtitle = document.createElement("p");
    subtitle.className = "card-note";
    subtitle.textContent = prediction.subtitle;
    subtitle.style.marginTop = "4px";
    headingWrap.append(subtitle);
  }

  const confidence = document.createElement("span");
  confidence.className = "confidence";
  confidence.textContent = prediction.confidence ?? "article";
  head.append(headingWrap, confidence);
  card.append(head);

  const list = document.createElement("div");
  list.className = "bar-list";

  if (prediction.items.length > 0) {
    const max = Math.max(...prediction.items.map((item) => item.value), 1);
    for (const item of prediction.items) {
      list.append(renderBar(item, max));
    }
  }
  card.append(list);

  if (prediction.note) {
    const note = document.createElement("p");
    note.className = "card-note";
    note.textContent = prediction.note;
    card.append(note);
  }

  if (prediction.sourceHref) {
    const source = document.createElement("a");
    source.className = "source-link";
    source.href = prediction.sourceHref;
    source.target = "_blank";
    source.rel = "noreferrer";
    source.textContent = `Source: ${versionPack.sourceLabel}`;
    card.append(source);
  }

  return card;
}

function renderBar(item, max) {
  const row = document.createElement("div");
  row.className = "bar-row";

  const meta = document.createElement("div");
  meta.className = "bar-meta";

  const label = document.createElement("span");
  label.className = "bar-label";
  label.textContent = formatOutcomeLabel(item.label);

  const value = document.createElement("span");
  value.textContent = percent(item.value);
  meta.append(label, value);

  const track = document.createElement("div");
  track.className = "bar-track";

  const fill = document.createElement("div");
  fill.className = `bar-fill${item.value >= 65 ? " hot" : item.value <= 5 ? " cool" : ""}`;
  fill.style.width = `${Math.max(1.5, (item.value / max) * 100)}%`;
  track.append(fill);

  row.append(meta, track);
  return row;
}

function formatOutcomeLabel(label) {
  const spaced = label
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace("Neows", "Neow's")
    .replace("Paels", "Pael's");
  return relicLabel(label) === label ? spaced : relicLabel(label);
}

form.addEventListener("input", render);
form.addEventListener("change", render);

resetButton.addEventListener("click", () => {
  form.reset();
  render();
});

initOptions();
render();
