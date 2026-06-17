import { cursePoolRelics, relicLabel, versionPack } from "./data.js";
import { buildPredictions, buildState, buildStatusPills, nextActions, percent, summarizeState } from "./engine.js";

const form = document.querySelector("#run-form");
const summaryTitle = document.querySelector("#summary-title");
const predictionGrid = document.querySelector("#prediction-grid");
const statusStrip = document.querySelector("#status-strip");
const nextActionWrap = document.querySelector("#next-actions");
const resetButton = document.querySelector("#reset-button");
const curseRelicSelect = document.querySelector("#curseRelic");
const firstFightGoldSelect = document.querySelector("#firstFightGold");

function initOptions() {
  for (const relic of cursePoolRelics) {
    const option = document.createElement("option");
    option.value = relic.id;
    option.textContent = relic.label;
    curseRelicSelect.append(option);
  }

  for (let gold = 7; gold <= 15; gold += 1) {
    const option = document.createElement("option");
    option.value = String(gold);
    option.textContent = String(gold);
    firstFightGoldSelect.append(option);
  }
}

function render() {
  const state = buildState(new FormData(form));
  const predictions = buildPredictions(state);
  summaryTitle.textContent = summarizeState(state);
  renderPills(buildStatusPills(state));
  renderNextActions(nextActions(state));
  renderPredictions(predictions);
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
