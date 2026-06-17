export function* seedRange({ start = 0, count }) {
  if (!Number.isInteger(start)) {
    throw new Error("seed range start must be an integer");
  }
  if (!Number.isInteger(count) || count < 0) {
    throw new Error("seed range count must be a non-negative integer");
  }

  for (let i = 0; i < count; i += 1) {
    yield start + i;
  }
}

export function* seedChunks({ start = 0, count, chunkSize = 100000 }) {
  if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
    throw new Error("chunkSize must be a positive integer");
  }

  let remaining = count;
  let nextStart = start;
  while (remaining > 0) {
    const size = Math.min(chunkSize, remaining);
    yield { start: nextStart, count: size };
    nextStart += size;
    remaining -= size;
  }
}
