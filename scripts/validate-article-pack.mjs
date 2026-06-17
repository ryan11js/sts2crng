import { articlePackV01070, tables, versionPack } from "../src/data.js";
import { buildGeneratedPack, compareGeneratedToArticle } from "./lib/simulator.mjs";
import { fail, getPath, parseArgs, requirePositiveInteger, summarizeRecipes, validatePackShape, visitNumbers } from "./lib/pack-tools.mjs";

const args = parseArgs(process.argv.slice(2));
const samples = args.samples ? requirePositiveInteger(args.samples, "--samples") : 1000000;
const tolerance = args.tolerance ? Number(args.tolerance) : 0.25;
const failures = [];
const articleSentinels = {
  "id": "v0.107.0",
  "sourceUrl": "https://tck.mn/blog/correlated-randomness-sts2/",
  "mode": "single",
  "tables.actRelicDistribution.underdocks.PrecariousShears": 23.75,
  "tables.actRelicDistribution.overgrowth.HeftyTablet": 23.79,
  "tables.neowsBonesCurse.overgrowth.Writhe": 73.74,
  "tables.firstPotionDrop.byRelic.underdocks.SilverCrucible": 99.49,
  "tables.firstQuestionCombat.byRelic.overgrowth.CursedPearl": 23.22,
  "tables.trashHeap.relicPairs.Rebound": "Maw Bank",
  "tables.dollRoom.byRelic.SilkenTress.BingBong": 91.5,
  "tables.heftyTabletFirstRare.ironclad.underdocks.Juggernaut": 72.52,
  "tables.leafyPoulticeFirstTransform.ironclad.overgrowth.StoneArmor": 7.83,
  "tables.tezcataraOptionOne.overgrowth.SilverCrucible.YummyCookie": 87.02,
  "tables.paelOptionTwoByGold.15.PaelsClaw": 49.67,
  "tables.orobasOptionByReward.uncommonPotion.SandCastle": 1.63
};

if (versionPack !== articlePackV01070) {
  failures.push("versionPack must point at articlePackV01070");
}
if (tables !== articlePackV01070.tables) {
  failures.push("tables export must point at articlePackV01070.tables");
}

failures.push(...validatePackShape(articlePackV01070));

for (const [path, expected] of Object.entries(articleSentinels)) {
  const actual = getPath(articlePackV01070, path);
  if (actual !== expected) {
    failures.push(`${path}: expected ${expected}, got ${actual}`);
  }
}

const numberStats = countNumbers(articlePackV01070.tables);
if (numberStats.count < 200) {
  failures.push(`Expected at least 200 numeric article values, found ${numberStats.count}`);
}

const generatedPack = buildGeneratedPack(articlePackV01070, { samples });
const parity = compareGeneratedToArticle(articlePackV01070, generatedPack, { tolerance });
failures.push(...parity.failures);

if (failures.length > 0) {
  fail("Article pack validation failed.", failures);
} else {
  const summary = summarizeRecipes(articlePackV01070);
  console.log("Article pack validation passed.");
  console.log(`Pack: ${articlePackV01070.id} (${articlePackV01070.mode})`);
  console.log(`Numeric table leaves: ${numberStats.count}`);
  console.log(`Recipe summary: ${summary.simulated} simulated, ${summary.tableOnly} table-only, ${summary.unsupported} unsupported.`);
  console.log(
    `Generated parity: ${parity.compared.length} compared, ${parity.skipped.length} skipped at +/-${parity.tolerance}% tolerance.`
  );
}

function countNumbers(value) {
  const stats = { count: 0 };
  visitNumbers(value, () => {
    stats.count += 1;
  });
  return stats;
}
