export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  accent: string;
}

export const COLOR_PALETTES: ColorPalette[] = [
  { id: "blue", name: "Professional Blue", primary: "217 91% 50%", accent: "217 91% 95%" },
  { id: "emerald", name: "Emerald Green", primary: "160 84% 39%", accent: "160 84% 95%" },
  { id: "purple", name: "Royal Purple", primary: "271 81% 56%", accent: "271 81% 95%" },
  { id: "orange", name: "Sunset Orange", primary: "24 95% 53%", accent: "24 95% 95%" },
  { id: "rose", name: "Rose Pink", primary: "350 89% 60%", accent: "350 89% 95%" },
  { id: "teal", name: "Ocean Teal", primary: "183 74% 44%", accent: "183 74% 95%" },
  { id: "slate", name: "Classic Slate", primary: "215 25% 27%", accent: "215 25% 95%" },
  { id: "amber", name: "Golden Amber", primary: "45 93% 47%", accent: "45 93% 95%" },
];

export function getPaletteById(id: string): ColorPalette {
  return COLOR_PALETTES.find((p) => p.id === id) || COLOR_PALETTES[0];
}

export function hexToHSL(hex: string): string {
  hex = hex.replace(/^#/, '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function hslToHex(hsl: string): string {
  const parts = hsl.match(/(\d+)\s+(\d+)%?\s+(\d+)%?/);
  if (!parts) return '#3b82f6';
  const h = parseInt(parts[1]) / 360, s = parseInt(parts[2]) / 100, l = parseInt(parts[3]) / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1/3);
  }
  const toHex = (x: number) => { const hex = Math.round(x * 255).toString(16); return hex.length === 1 ? '0' + hex : hex; };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
