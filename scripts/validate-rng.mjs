import { LegacyDotNetRandom, sampleLegacyRandom } from "../src/rng.js";
import { fail } from "./lib/pack-tools.mjs";

const intVectors = [
  {
    seed: 0,
    values: [1559595546, 1755192844, 1649316166, 1198642031, 442452829]
  },
  {
    seed: 1,
    values: [534011718, 237820880, 1002897798, 1657007234, 1412011072]
  },
  {
    seed: -1,
    values: [534011718, 237820880, 1002897798, 1657007234, 1412011072]
  },
  {
    seed: -2147483648,
    values: [1559595546, 1755192844, 1649316166, 1198642031, 442452829]
  }
];

const doubleVectors = [
  {
    seed: 0,
    values: [
      0.7262432699679598,
      0.8173253595909687,
      0.7680226893946634,
      0.5581611914365372,
      0.2060331540210327
    ]
  },
  {
    seed: 1,
    values: [
      0.24866858415709278,
      0.11074397718102856,
      0.46701067987224587,
      0.7716041220219825,
      0.657518893786482
    ]
  },
  {
    seed: -1,
    values: [
      0.24866858415709278,
      0.11074397718102856,
      0.46701067987224587,
      0.7716041220219825,
      0.657518893786482
    ]
  },
  {
    seed: -2147483648,
    values: [
      0.7262432699679598,
      0.8173253595909687,
      0.7680226893946634,
      0.5581611914365372,
      0.2060331540210327
    ]
  }
];

const failures = [];

for (const vector of intVectors) {
  const rng = new LegacyDotNetRandom(vector.seed);
  const actual = vector.values.map(() => rng.next());
  assertArrayEqual(actual, vector.values, `new Random(${vector.seed}).Next()`);
}

for (const vector of doubleVectors) {
  const actual = sampleLegacyRandom(vector.seed, vector.values.length);
  assertCloseArray(actual, vector.values, `new Random(${vector.seed}).NextDouble()`);
}

const rangeRng = new LegacyDotNetRandom(0);
assertArrayEqual(
  [rangeRng.nextInt(100), rangeRng.nextInt(100), rangeRng.nextInt(100)],
  [72, 81, 76],
  "new Random(0).Next(100)"
);

const cloneSource = new LegacyDotNetRandom(1);
cloneSource.advance(3);
const clone = cloneSource.clone();
assertArrayEqual(
  [cloneSource.next(), clone.next(), cloneSource.next(), clone.next()],
  [1657007234, 1657007234, 1412011072, 1412011072],
  "clone() preserves advanced RNG state"
);

if (failures.length > 0) {
  fail("Legacy .NET Random validation failed.", failures);
} else {
  console.log("Legacy .NET Random validation passed.");
  console.log(`Validated ${intVectors.length} integer vectors, ${doubleVectors.length} double vectors, range, advance, and clone.`);
}

function assertArrayEqual(actual, expected, label) {
  if (actual.length !== expected.length) {
    failures.push(`${label}: length mismatch ${actual.length} !== ${expected.length}`);
    return;
  }
  for (let i = 0; i < expected.length; i += 1) {
    if (actual[i] !== expected[i]) {
      failures.push(`${label}[${i}]: expected ${expected[i]}, got ${actual[i]}`);
    }
  }
}

function assertCloseArray(actual, expected, label) {
  if (actual.length !== expected.length) {
    failures.push(`${label}: length mismatch ${actual.length} !== ${expected.length}`);
    return;
  }
  for (let i = 0; i < expected.length; i += 1) {
    const delta = Math.abs(actual[i] - expected[i]);
    if (delta > Number.EPSILON * 4) {
      failures.push(`${label}[${i}]: expected ${expected[i]}, got ${actual[i]}, delta ${delta}`);
    }
  }
}
