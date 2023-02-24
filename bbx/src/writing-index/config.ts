export const config: WritingIndexConfig = {
  showLegend: true,
  showCategories: true,
  showCounts: true,
  category: {
    tags: {
      index: ["index"],
      erotica: ["erotica"],
      photography: ["photography"],
      challenge: ["challenge"],
      polls: ["poll"],
      satire: ["satire", "parody"],
      poetry: ["poetry", "poem"],
      ds: [
        "d-s",
        "dominant",
        "dominance",
        "submission",
        "dom",
        "dominate",
        "domination",
      ],
      fetlife: ["fetlife"],
    },
    order: {
      polls: "Polls",
      challenge: "Challenges",
      misc: "General",
      fetlife: "FetLife",
      ds: "Dominance / submission",
      poetry: "Poetry",
      satire: "Satire / Parody",
      erotica: "Erotica",
      photography: "Photography",
    },
  },
  hashtags: ["WBDC", "#"],
  counts: {
    like: 25,
    love: 50,
    adore: 100,
    fire: 250,
  },
  escapeOutput: false,
}

export interface WritingIndexConfig {
	showLegend: boolean;
	showCounts: boolean;
	showCategories: boolean;
	category: {
		tags: { [category: string]: string[] };
		order: { [category: string]: string };
	}
	hashtags: string[];
	escapeOutput: boolean;
	counts: {
		like: number;
		love: number;
		adore: number;
		fire: number;
	}
}
