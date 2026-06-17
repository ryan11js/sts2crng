export function createCounter(labels = []) {
  const counts = Object.fromEntries(labels.map((label) => [label, 0]));
  return {
    counts,
    total: 0
  };
}

export function increment(counter, label) {
  if (!(label in counter.counts)) {
    counter.counts[label] = 0;
  }
  counter.counts[label] += 1;
  counter.total += 1;
}

export function toPercentDistribution(counter, precision = 2) {
  const distribution = {};
  const total = counter.total || 1;
  for (const [label, count] of Object.entries(counter.counts)) {
    distribution[label] = roundPercent((count / total) * 100, precision);
  }
  return distribution;
}

export function roundPercent(value, precision = 2) {
  return Number(value.toFixed(precision));
}

export function createGroupedCounter(groupLabels, outcomeLabels) {
  return Object.fromEntries(groupLabels.map((group) => [group, createCounter(outcomeLabels)]));
}

export function groupedToPercentDistribution(groupedCounter, precision = 2) {
  return Object.fromEntries(
    Object.entries(groupedCounter).map(([group, counter]) => [group, toPercentDistribution(counter, precision)])
  );
}
