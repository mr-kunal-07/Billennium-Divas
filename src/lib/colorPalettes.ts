export interface ColorPalette {
  id: string;
  name: string;
  primary: string; // HSL values for --primary
  accent: string; // HSL values for accent background
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: "blue",
    name: "Professional Blue",
    primary: "217 91% 50%",
    accent: "217 91% 95%",
  },
  {
    id: "emerald",
    name: "Emerald Green",
    primary: "160 84% 39%",
    accent: "160 84% 95%",
  },
  {
    id: "purple",
    name: "Royal Purple",
    primary: "271 81% 56%",
    accent: "271 81% 95%",
  },
  {
    id: "orange",
    name: "Sunset Orange",
    primary: "24 95% 53%",
    accent: "24 95% 95%",
  },
  {
    id: "rose",
    name: "Rose Pink",
    primary: "350 89% 60%",
    accent: "350 89% 95%",
  },
  {
    id: "teal",
    name: "Ocean Teal",
    primary: "183 74% 44%",
    accent: "183 74% 95%",
  },
  {
    id: "slate",
    name: "Classic Slate",
    primary: "215 25% 27%",
    accent: "215 25% 95%",
  },
  {
    id: "amber",
    name: "Golden Amber",
    primary: "45 93% 47%",
    accent: "45 93% 95%",
  },
];

export function getPaletteById(id: string): ColorPalette {
  return COLOR_PALETTES.find((p) => p.id === id) || COLOR_PALETTES[0];
}
