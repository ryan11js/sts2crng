# STS2 CRNG Lab

An interactive Slay the Spire 2 CRNG helper. The current build is a static web app seeded from Andy Tockman's `v0.107.0` beta write-up and structured so a simulator-generated data pack can replace the hand-entered tables later.

Reference article: <https://tck.mn/blog/correlated-randomness-sts2/>

## Local Simulator Commands

The simulator/validator layer is zero-dependency Node. There is no install step once Node is available on your PATH.

```powershell
node scripts/validate-rng.mjs
node scripts/validate-article-pack.mjs
node scripts/generate-pack.mjs --version v0.107.0 --samples 1000000
```

The generated pack currently preserves the article tables as fallback data and reports recipe coverage. Recipes marked `tableOnly` are intentionally skipped until seed parsing, stream offsets, list orderings, and call-order rules are encoded.

## Run

From this folder:

```powershell
python -m http.server 5173
```

Then open <http://localhost:5173/>.

Or visit <http://ryanschatz.net/sts2/>

## What Works Now

- Step through the run chronologically: character, starting act, Neow relic shown, Neow choice result, fight 1 gold, and fight 1 reward.
- Load predictions from a versioned `v0.107.0` article pack with recipe metadata and table-only coverage flags.
- Validate the shared legacy `.NET Random` implementation against fixed vectors for seed `0`, positive seeds, negative seeds, and `Int32.MinValue`.
- Validate article-pack shape, sentinel article values, recipe table paths, and generated-pack parity scaffolding.
- See article-derived predictions for:
  - Neow relic odds by act.
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
- This is the first app pass, not yet a full seed simulator.

## Next Engineering Steps

1. Install/use Node locally and run the validator scripts after table or RNG changes.
2. Encode STS2 seed parsing, RNG stream offsets, list orderings, and call-order rules.
3. Promote individual recipes from `tableOnly` to `simulated` once they can reproduce article distributions within tolerance.
4. Add co-op player offset calibration after the single-player event stream is simulator-backed.
5. Add a mod/exporter pipeline for current patch metadata after the data-pack contract settles.
