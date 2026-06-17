# STS2 CRNG Lab

An interactive Slay the Spire 2 CRNG helper. The current build is a static web app seeded from Andy Tockman's `v0.107.0` beta write-up and structured so a simulator-generated data pack can replace the hand-entered tables later.

Reference article: <https://tck.mn/blog/correlated-randomness-sts2/>

## Local Simulator Commands

The simulator/validator layer is zero-dependency Node. There is no install step once Node is available on your PATH.

```powershell
node scripts/validate-rng.mjs
node scripts/validate-article-pack.mjs
node scripts/generate-pack.mjs --version v0.107.0 --mode single --samples 1000000 --out generated/v0.107.0/single/generated-pack.json
node scripts/compare-generated-pack.mjs --version v0.107.0 --generated generated/v0.107.0/single/generated-pack.json --tolerance 0.25 --allow-pending
```

Or double-click:

```powershell
.\run-all.bat
```

The generated pack preserves article tables as fallback data, but generated tables only come from encoded seed-sweep recipes. Recipes that still need offsets, list orderings, or call-order rules are reported as blocked instead of being copied from the article.

Strict parity mode intentionally fails until the required core recipes are simulated:

```powershell
node scripts/compare-generated-pack.mjs --version v0.107.0 --generated generated/v0.107.0/single/generated-pack.json --tolerance 0.25
```

## Co-op Data Collection

Friends can drop exported run JSON files into `imports/discord/`, then run:

```powershell
node scripts/collect/import-runs.mjs
node scripts/collect/summarize-runs.mjs
node scripts/sim/calibrate-coop-offsets.mjs
node scripts/sim/suggest-next-observations.mjs
```

Raw Steam64 values are stored as strings to avoid precision loss. Local run data is written to `data/runs.jsonl` and ignored by git.

## Run

From this folder:

```powershell
python -m http.server 5173
```

Then open <http://localhost:5173/>.

Or visit <http://ryanschatz.net/sts2/>

## What Works Now

- Step through the run chronologically: character, starting act, the three Neow relic offers, picked relic, picked relic output, fight 1 gold, and fight 1 reward.
- Load predictions from a versioned `v0.107.0` article pack with recipe metadata and table-only coverage flags.
- Validate the shared legacy `.NET Random` implementation against fixed vectors for seed `0`, positive seeds, negative seeds, and `Int32.MinValue`.
- Validate article-pack shape, sentinel article values, recipe table paths, and generated-pack parity reports.
- Run a real base-seed sweep for the Act 1 variant recipe.
- Import manual co-op run JSON and write per-player calibration reports.
- See article-derived predictions for:
  - Neow curse-anchor odds by act.
  - Neow's Bones curse distribution.
  - Large Capsule rarity.
  - Ironclad Leafy Poultice and Hefty Tablet first-card tables.
  - First fight potion drop.
  - First question mark combat odds.
  - Trash Heap card and relic-pair implications.
  - Doll Room one-doll result.
  - Tezcatara option 1.
  - Pael option 2 from first-fight gold.
  - Orobas option from first combat reward type.

## Data Caveats

- Data is for STS2 beta `v0.107.0`.
- Data is single-player calibrated. Co-op support needs a per-player event offset profile because the article notes co-op event RNG offsets depend on Steam ID.
- Any Neow option that creates cards, creates random relics, or triggers New Leaf/Kaleidoscope-style effects can invalidate some early predictions.
- This is not yet a full STS2 simulator. Neow, reward, Niche, and event recipes are blocked until exact offsets/list orders/call orders are recovered from game files, observations, or an exporter mod.

## Next Engineering Steps

1. Install/use Node locally and run the validator scripts after table or RNG changes.
2. Encode STS2 seed parsing, RNG stream offsets, list orderings, and call-order rules.
3. Promote individual recipes from `tableOnly` to `simulated` once they can reproduce article distributions within tolerance.
4. Add co-op player offset calibration after the single-player event stream is simulator-backed.
5. Add a mod/exporter pipeline for current patch metadata after the data-pack contract settles.
