# STS2 CRNG Lab

An interactive Slay the Spire 2 CRNG helper. The current build is a static web app seeded from Andy Tockman's `v0.107.0` beta write-up and structured so a simulator-generated data pack can replace the hand-entered tables later.

Reference article: <https://tck.mn/blog/correlated-randomness-sts2/>

## Run

From this folder:

```powershell
python -m http.server 5173
```

Then open <http://localhost:5173/>.

## What Works Now

- Select character, Act 1, Neow curse-pool relic, RNG-affecting Neow pick, first fight gold, and first combat reward type.
- See article-derived predictions for:
  - Neow curse-pool relic odds by act.
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
- Data is single-player only; the article notes multiplayer event RNG offsets depend on Steam ID.
- Any Neow option that creates cards, random relics, or consumes the Niche RNG can invalidate some early predictions.
- This is the first app pass, not yet a full seed simulator.

## Next Engineering Steps

1. Validate the included legacy `.NET Random` implementation against known C# outputs.
2. Add a CLI simulator that emits versioned JSON/DuckDB data packs.
3. Encode STS2 seed parsing, RNG stream offsets, list orderings, and call-order rules.
4. Add a mod/exporter pipeline for current patch metadata.
5. Replace article tables with simulator-backed conditional queries while keeping the current UI.
