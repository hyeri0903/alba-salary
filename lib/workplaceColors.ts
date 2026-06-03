const PALETTE = [
  { bg: "bg-indigo-100", text: "text-indigo-700" },
  { bg: "bg-rose-100",   text: "text-rose-700"   },
  { bg: "bg-emerald-100",text: "text-emerald-700" },
  { bg: "bg-amber-100",  text: "text-amber-700"   },
  { bg: "bg-violet-100", text: "text-violet-700"  },
  { bg: "bg-cyan-100",   text: "text-cyan-700"    },
  { bg: "bg-pink-100",   text: "text-pink-700"    },
  { bg: "bg-teal-100",   text: "text-teal-700"    },
];

export function getWorkplaceColor(index: number) {
  return PALETTE[index % PALETTE.length];
}
