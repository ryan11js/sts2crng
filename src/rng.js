const MBIG = 2147483647;
const MSEED = 161803398;
const INT_MIN = -2147483648;

export class LegacyDotNetRandom {
  constructor(seed) {
    const seedArray = new Array(56).fill(0);
    const subtraction = seed === INT_MIN ? MBIG : Math.abs(Math.trunc(seed));
    let mj = MSEED - subtraction;
    seedArray[55] = mj;
    let mk = 1;

    for (let i = 1; i < 55; i += 1) {
      const ii = (21 * i) % 55;
      seedArray[ii] = mk;
      mk = mj - mk;
      if (mk < 0) {
        mk += MBIG;
      }
      mj = seedArray[ii];
    }

    for (let k = 1; k < 5; k += 1) {
      for (let i = 1; i < 56; i += 1) {
        seedArray[i] -= seedArray[1 + ((i + 30) % 55)];
        if (seedArray[i] < 0) {
          seedArray[i] += MBIG;
        }
      }
    }

    this.seedArray = seedArray;
    this.inext = 0;
    this.inextp = 21;
  }

  internalSample() {
    let locINext = this.inext + 1;
    let locINextp = this.inextp + 1;
    if (locINext >= 56) {
      locINext = 1;
    }
    if (locINextp >= 56) {
      locINextp = 1;
    }

    let retVal = this.seedArray[locINext] - this.seedArray[locINextp];
    if (retVal === MBIG) {
      retVal -= 1;
    }
    if (retVal < 0) {
      retVal += MBIG;
    }

    this.seedArray[locINext] = retVal;
    this.inext = locINext;
    this.inextp = locINextp;
    return retVal;
  }

  nextDouble() {
    return this.internalSample() * (1.0 / MBIG);
  }

  nextInt(maxValue) {
    if (!Number.isInteger(maxValue) || maxValue <= 0) {
      throw new RangeError("maxValue must be a positive integer");
    }
    return Math.floor(this.nextDouble() * maxValue);
  }
}

export function sampleLegacyRandom(seed, count = 5) {
  const rng = new LegacyDotNetRandom(seed);
  return Array.from({ length: count }, () => rng.nextDouble());
}
