export const versionPack = {
  id: "v0.107.0",
  label: "STS2 beta v0.107.0 article pack",
  sourceUrl: "https://tck.mn/blog/correlated-randomness-sts2/",
  sourceLabel: "Andy Tockman, Correlated randomness in Slay the Spire 2",
  sourceDate: "2026-06-15",
  notes: [
    "Single-player only. Multiplayer event RNG offsets depend on Steam ID.",
    "Article-derived data should be treated as calibration until simulator validation lands.",
    "Predictions involving reward RNG can be invalid after Neow choices that create cards or relics."
  ]
};

export const characters = [
  { id: "ironclad", label: "Ironclad" },
  { id: "silent", label: "Silent" },
  { id: "defect", label: "Defect" },
  { id: "necrobinder", label: "Necrobinder" },
  { id: "regent", label: "Regent" },
  { id: "unknown", label: "Unknown" }
];

export const cursePoolRelics = [
  { id: "CursedPearl", label: "Cursed Pearl" },
  { id: "HeftyTablet", label: "Hefty Tablet" },
  { id: "LargeCapsule", label: "Large Capsule" },
  { id: "LeafyPoultice", label: "Leafy Poultice" },
  { id: "NeowsBones", label: "Neow's Bones" },
  { id: "PrecariousShears", label: "Precarious Shears" },
  { id: "SilkenTress", label: "Silken Tress" },
  { id: "SilverCrucible", label: "Silver Crucible" }
];

export const tables = {
  actRelicDistribution: {
    underdocks: {
      CursedPearl: 11.95,
      HeftyTablet: 1.32,
      LargeCapsule: 1.65,
      LeafyPoultice: 12.72,
      NeowsBones: 13.01,
      PrecariousShears: 23.75,
      SilkenTress: 23.22,
      SilverCrucible: 12.37
    },
    overgrowth: {
      CursedPearl: 12.99,
      HeftyTablet: 23.79,
      LargeCapsule: 23.24,
      LeafyPoultice: 12.39,
      NeowsBones: 11.9,
      PrecariousShears: 1.35,
      SilkenTress: 1.65,
      SilverCrucible: 12.7
    }
  },

  neowsBonesCurse: {
    underdocks: {
      Clumsy: 0.1,
      Debt: 54.25,
      Decay: 40.32,
      Doubt: 1.5,
      Guilty: 0,
      Injury: 0,
      Normality: 0,
      Regret: 0,
      Shame: 0,
      Writhe: 3.82
    },
    overgrowth: {
      Clumsy: 0.51,
      Debt: 0,
      Decay: 0,
      Doubt: 0,
      Guilty: 0.19,
      Injury: 5.53,
      Normality: 1.18,
      Regret: 0,
      Shame: 18.85,
      Writhe: 73.74
    }
  },

  largeCapsuleRarity: {
    underdocks: { Common: 0, Uncommon: 37, Rare: 63 },
    overgrowth: { Common: 0, Uncommon: 70, Rare: 30 }
  },

  firstPotionDrop: {
    overall: {
      underdocks: 76,
      overgrowth: 4
    },
    byRelic: {
      underdocks: {
        CursedPearl: 16.85,
        HeftyTablet: 0,
        LargeCapsule: 0,
        LeafyPoultice: 51.23,
        NeowsBones: 96.02,
        PrecariousShears: 97.21,
        SilkenTress: 84.3,
        SilverCrucible: 99.49
      },
      overgrowth: {
        CursedPearl: 0,
        HeftyTablet: 0,
        LargeCapsule: 0,
        LeafyPoultice: 0,
        NeowsBones: 13.08,
        PrecariousShears: 72.9,
        SilkenTress: 37.08,
        SilverCrucible: 6.61
      }
    }
  },

  firstQuestionCombat: {
    overall: {
      underdocks: 9.6,
      overgrowth: 10.4
    },
    byRelic: {
      underdocks: {
        CursedPearl: 10.58,
        HeftyTablet: 0,
        LargeCapsule: 0,
        LeafyPoultice: 5.72,
        NeowsBones: 19.09,
        PrecariousShears: 0,
        SilkenTress: 0,
        SilverCrucible: 41.44
      },
      overgrowth: {
        CursedPearl: 23.22,
        HeftyTablet: 16.09,
        LargeCapsule: 15.24,
        LeafyPoultice: 0,
        NeowsBones: 0,
        PrecariousShears: 0,
        SilkenTress: 0,
        SilverCrucible: 0
      }
    }
  },

  trashHeap: {
    overall: {
      Caltrops: 10.14,
      Clash: 14.85,
      Distraction: 19.97,
      DualWield: 13.78,
      Entrench: 9.84,
      HelloWorld: 9.89,
      Outmaneuver: 5.17,
      Rebound: 0,
      RipAndTear: 6.19,
      Stack: 10.17
    },
    byRelic: {
      CursedPearl: { HelloWorld: 66.63, Outmaneuver: 32.26, RipAndTear: 0.43, Stack: 0.69 },
      HeftyTablet: { Outmaneuver: 98.82, RipAndTear: 1.18 },
      LargeCapsule: { HelloWorld: 0.04, Outmaneuver: 0.26, RipAndTear: 99.7 },
      LeafyPoultice: { Entrench: 0.08, HelloWorld: 0.26, RipAndTear: 35.29, Stack: 64.36 },
      NeowsBones: { Caltrops: 76.61, Clash: 8.24, DualWield: 0.14, Entrench: 0.18, Stack: 14.82 },
      PrecariousShears: { Clash: 57.61, Distraction: 42.16, DualWield: 0.23 },
      SilkenTress: { Clash: 0.56, Distraction: 42.9, DualWield: 56.54 },
      SilverCrucible: { Caltrops: 0.83, Clash: 0.03, DualWield: 4.4, Entrench: 79.1, HelloWorld: 15.46, Stack: 0.18 }
    },
    relicPairs: {
      Caltrops: "Darkstone Periapt",
      Clash: "Darkstone Periapt",
      Distraction: "Dream Catcher",
      DualWield: "Dream Catcher",
      Entrench: "Hand Drill",
      HelloWorld: "Hand Drill",
      Outmaneuver: "Maw Bank",
      Rebound: "Maw Bank",
      RipAndTear: "The Boot",
      Stack: "The Boot"
    }
  },

  dollRoom: {
    byRelic: {
      CursedPearl: { Daughter: 60.77, Struggles: 7.66, BingBong: 31.57 },
      HeftyTablet: { Daughter: 91, Struggles: 9, BingBong: 0 },
      LargeCapsule: { Daughter: 55.07, Struggles: 44.35, BingBong: 0.58 },
      LeafyPoultice: { Daughter: 23.14, Struggles: 70.81, BingBong: 6.05 },
      NeowsBones: { Daughter: 4.54, Struggles: 70.38, BingBong: 25.08 },
      PrecariousShears: { Daughter: 0, Struggles: 46.09, BingBong: 53.91 },
      SilkenTress: { Daughter: 0, Struggles: 8.5, BingBong: 91.5 },
      SilverCrucible: { Daughter: 32.22, Struggles: 9.89, BingBong: 57.88 }
    },
    byAct: {
      underdocks: { Daughter: 4, Struggles: 34, BingBong: 62 },
      overgrowth: { Daughter: 62, Struggles: 34, BingBong: 4 }
    }
  },

  heftyTabletFirstRare: {
    ironclad: {
      underdocks: { Juggernaut: 72.52, TearAsunder: 16.77, Thrash: 10.71 },
      overgrowth: {
        Juggernaut: 4.52,
        Mangle: 10.17,
        NotYet: 10.17,
        Offering: 7.65,
        OneTwoPunch: 6.12,
        PactsEnd: 15.99,
        PrimalForce: 12.99,
        Pyre: 17.29,
        Stoke: 9.04,
        TearAsunder: 5.61,
        Thrash: 0.45
      }
    }
  },

  leafyPoulticeFirstTransform: {
    ironclad: {
      underdocks: {
        Aggression: 3.78,
        Anger: 7.84,
        Armaments: 7.82,
        AshenStrike: 7.82,
        Barricade: 7.84,
        BattleTrance: 7.82,
        BloodWall: 7.83,
        Bloodletting: 7.82,
        Bludgeon: 7.83,
        BodySlam: 7.85,
        Brand: 4.02,
        FiendFire: 1.59,
        FightMe: 2.15,
        FlameBarrier: 2.17,
        ForgottenRitual: 2.17,
        Havoc: 2.17,
        Headbutt: 2.17,
        Hellraiser: 2.17,
        Hemokinesis: 2.18,
        HowlFromBeyond: 2.17,
        Impervious: 2.17,
        InfernalBlade: 0.6
      },
      overgrowth: {
        MoltenFist: 0.64,
        NotYet: 2.2,
        Offering: 2.2,
        OneTwoPunch: 2.2,
        PactsEnd: 2.21,
        PerfectedStrike: 2.21,
        Pillage: 2.21,
        PommelStrike: 2.21,
        PrimalForce: 2.21,
        Pyre: 2.2,
        Rage: 1.58,
        SecondWind: 3.99,
        SetupStrike: 7.79,
        ShrugItOff: 7.81,
        Spite: 7.8,
        Stampede: 7.8,
        Stoke: 7.78,
        Stomp: 7.78,
        StoneArmor: 7.83,
        SwordBoomerang: 7.76,
        Taunt: 7.79,
        TearAsunder: 3.78
      }
    }
  },

  tezcataraOptionOne: {
    underdocks: {
      CursedPearl: { VeryHotCocoa: 19.37, YummyCookie: 67.89, NutritiousSoup: 12.74 },
      HeftyTablet: { VeryHotCocoa: 36.64, YummyCookie: 63.36, NutritiousSoup: 0 },
      LargeCapsule: { VeryHotCocoa: 69.33, YummyCookie: 30.67, NutritiousSoup: 0 },
      LeafyPoultice: { VeryHotCocoa: 39, YummyCookie: 32.2, NutritiousSoup: 28.8 },
      NeowsBones: { VeryHotCocoa: 0, YummyCookie: 29.19, NutritiousSoup: 70.81 },
      PrecariousShears: { VeryHotCocoa: 0, YummyCookie: 9.54, NutritiousSoup: 90.46 },
      SilkenTress: { VeryHotCocoa: 0, YummyCookie: 33.77, NutritiousSoup: 66.23 },
      SilverCrucible: { VeryHotCocoa: 69.44, YummyCookie: 30.56, NutritiousSoup: 0 }
    },
    overgrowth: {
      CursedPearl: { VeryHotCocoa: 0, YummyCookie: 36.78, NutritiousSoup: 63.22 },
      HeftyTablet: { VeryHotCocoa: 90.85, YummyCookie: 9.15, NutritiousSoup: 0 },
      LargeCapsule: { VeryHotCocoa: 89.56, YummyCookie: 10.44, NutritiousSoup: 0 },
      LeafyPoultice: { VeryHotCocoa: 71.42, YummyCookie: 28.58, NutritiousSoup: 0 },
      NeowsBones: { VeryHotCocoa: 1.34, YummyCookie: 32.13, NutritiousSoup: 66.52 },
      PrecariousShears: { VeryHotCocoa: 0, YummyCookie: 36.29, NutritiousSoup: 63.71 },
      SilkenTress: { VeryHotCocoa: 68.04, YummyCookie: 31.96, NutritiousSoup: 0 },
      SilverCrucible: { VeryHotCocoa: 12.98, YummyCookie: 87.02, NutritiousSoup: 0 }
    }
  },

  paelOptionTwoByGold: {
    7: { PaelsWing: 47.17, PaelsClaw: 50.23, PaelsTooth: 2.6, PaelsGrowth: 0 },
    8: { PaelsWing: 75.03, PaelsClaw: 16.04, PaelsTooth: 8.93, PaelsGrowth: 0 },
    9: { PaelsWing: 3.63, PaelsClaw: 12.6, PaelsTooth: 46.84, PaelsGrowth: 36.93 },
    10: { PaelsWing: 4.31, PaelsClaw: 25.4, PaelsTooth: 68.59, PaelsGrowth: 1.71 },
    11: { PaelsWing: 33.98, PaelsClaw: 52.76, PaelsTooth: 13.25, PaelsGrowth: 0 },
    12: { PaelsWing: 56.83, PaelsClaw: 40.97, PaelsTooth: 2.2, PaelsGrowth: 0 },
    13: { PaelsWing: 33.39, PaelsClaw: 9.47, PaelsTooth: 16.47, PaelsGrowth: 40.68 },
    14: { PaelsWing: 84.14, PaelsClaw: 15.86, PaelsTooth: 0, PaelsGrowth: 0 },
    15: { PaelsWing: 2.63, PaelsClaw: 49.67, PaelsTooth: 28.03, PaelsGrowth: 19.67 }
  },

  orobasOptionByReward: {
    commonPotion: { ElectricShrymp: 15.65, GlassEye: 23.77, SandCastle: 37.93, GemOrGlass: 22.65 },
    uncommonPotion: { ElectricShrymp: 39.99, GlassEye: 28.81, SandCastle: 1.63, GemOrGlass: 29.58 },
    rarePotion: { ElectricShrymp: 46.57, GlassEye: 23.14, SandCastle: 30.29, GemOrGlass: 0 },
    commonCard: { ElectricShrymp: 16.52, GlassEye: 23.65, SandCastle: 37.47, GemOrGlass: 22.36 }
  }
};

export function relicLabel(id) {
  return cursePoolRelics.find((relic) => relic.id === id)?.label ?? id;
}
