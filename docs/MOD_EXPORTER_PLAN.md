# STS2 CRNG Exporter Mod Plan

The first mod should be an observer/exporter, not a gameplay changer.

## Goal

Export the same JSON shape accepted by `scripts/collect/import-runs.mjs` so manual and modded data enter the simulator through one path.

## First Observations To Export

- game version and patch/build identifier
- mode: `single` or `coop`
- party ID, host Steam64, player Steam64
- character and starting act
- Neow relic shown
- Neow choice result: neutral, card reward, random relic, New Leaf/Kaleidoscope-style effect
- fight 1 gold
- fight 1 reward type
- first question room result
- Trash Heap, Doll Room, Tezcatara, Pael, and Orobas outcomes when seen

## Research Tasks

- Confirm current STS2 mod loading path for the installed build.
- Confirm whether Steam Workshop/mod APIs are available and stable enough for this observer.
- Inspect local saves/logs for seed, party, player IDs, choices, rewards, and event outcomes.
- Find safe Godot-side hooks for run start, Neow screen, rewards, event outcomes, and co-op identity.
- Keep direct RNG-state instrumentation separate because it is more patch-fragile than observation export.

## Output

Write one JSON file per run using schema version `1`. The importer should not need to know whether a file came from manual entry or the mod.
