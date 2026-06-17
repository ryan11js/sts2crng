import { LegacyDotNetRandom } from "../../../src/rng.js";

export const ACTS = {
  underdocks: "underdocks",
  overgrowth: "overgrowth"
};

export const knownMechanics = {
  version: "v0.107.0",
  source: "https://tck.mn/blog/correlated-randomness-sts2/",
  streams: {
    base: {
      seedOffset: 0,
      known: true,
      note: "Act 1 variant uses an unnamed RNG seeded with the base seed."
    },
    neow: {
      seedOffset: null,
      known: false,
      note: "Article gives seed + 1 + hash(\"NEOW\"), but the local repo does not yet know the concrete hash value."
    },
    niche: {
      seedOffset: null,
      known: false,
      note: "Article gives seed + hash(\"niche\"), but the local repo does not yet know the concrete hash value."
    },
    reward: {
      seedOffset: null,
      known: false,
      note: "Reward stream seed offset and exact call-order rules still need game-file/exporter validation."
    },
    event: {
      seedOffset: null,
      known: false,
      singlePlayerOffset: 1,
      note: "Event RNGs use event-specific offsets; co-op also offsets by Steam ID. Concrete event constants are not encoded yet."
    }
  }
};

export class UnknownMechanicError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "UnknownMechanicError";
    this.details = details;
  }
}

export function createStream(baseSeed, streamId, options = {}) {
  const stream = knownMechanics.streams[streamId];
  if (!stream) {
    throw new UnknownMechanicError(`Unknown stream "${streamId}"`, { streamId });
  }
  if (!stream.known || stream.seedOffset === null) {
    throw new UnknownMechanicError(`Stream "${streamId}" seed offset is not encoded yet.`, {
      streamId,
      stream
    });
  }

  const steamOffset = streamId === "event" && options.mode === "coop" ? steam64Offset(options.steam64) : 0;
  return new LegacyDotNetRandom(toInt32(baseSeed + stream.seedOffset + steamOffset));
}

export function snapshotRun(baseSeed, options = {}) {
  const base = createStream(baseSeed, "base", options);
  const actRoll = base.nextDouble();
  return {
    seed: baseSeed,
    actRoll,
    act: actRoll < 0.5 ? ACTS.underdocks : ACTS.overgrowth
  };
}

export function steam64Offset(steam64) {
  if (steam64 === undefined || steam64 === null || steam64 === "") {
    return 0;
  }
  if (!/^\d+$/.test(String(steam64))) {
    throw new Error("steam64 must contain only digits");
  }
  return Number(BigInt(steam64) % 2147483647n);
}

export function toInt32(value) {
  let normalized = Number(value % 4294967296);
  if (normalized >= 2147483648) {
    normalized -= 4294967296;
  }
  if (normalized < -2147483648) {
    normalized += 4294967296;
  }
  return normalized;
}
