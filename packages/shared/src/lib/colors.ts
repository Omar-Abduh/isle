export const BRUTALIST_COLORS = [
  '#E63946', // Vibrant Red
  '#F4A261', // Muted Orange
  '#2A9D8F', // Teal
  '#264653', // Deep Blue
  '#457B9D', // Steel Blue
  '#8338EC', // Electric Purple
  '#FF006E', // Neon Pink
  '#FB5607', // Blazing Orange
  '#3A86FF', // Bright Blue
  '#06D6A0', // Mint
  '#118AB2', // Ocean
  '#073B4C'  // Dark Teal
];

export function getRandomColor(): string {
  const index = Math.floor(Math.random() * BRUTALIST_COLORS.length);
  return BRUTALIST_COLORS[index];
}
