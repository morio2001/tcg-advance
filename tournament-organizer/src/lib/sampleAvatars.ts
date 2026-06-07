// Stylized "sengoku warlord" placeholder portraits (kabuto + kuwagata crest),
// rendered as inline SVG data URLs. Used only for the demo roster — real photos
// can't be embedded here, so these stand in as sample player pictures.

const samurai = (bg: string, helm: string, armor: string, crest: string): string => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'>
<rect width='96' height='96' fill='${bg}'/>
<path d='M8 96 q40 -32 80 0 Z' fill='${armor}'/>
<ellipse cx='48' cy='57' rx='15' ry='17' fill='#e9c6a1'/>
<path d='M26 51 a22 20 0 0 1 44 0 q-22 -12 -44 0 Z' fill='${helm}'/>
<rect x='24' y='48' width='48' height='7' rx='3.5' fill='${helm}'/>
<path d='M40 30 q-15 -6 -21 -23 q15 4 25 17 Z' fill='${crest}'/>
<path d='M56 30 q15 -6 21 -23 q-15 4 -25 17 Z' fill='${crest}'/>
<circle cx='48' cy='41' r='5' fill='${crest}'/>
<circle cx='42' cy='56' r='1.8' fill='#2a2118'/>
<circle cx='54' cy='56' r='1.8' fill='#2a2118'/>
<path d='M40 65 q8 5 16 0' stroke='#3a2a1a' stroke-width='2' fill='none' stroke-linecap='round'/>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const SAMURAI_AVATARS: string[] = [
  samurai('#f3e3e3', '#7a1f1f', '#9e2b2b', '#e6b422'), // 赤備え
  samurai('#e6e8ee', '#232733', '#2f3545', '#e6b422'), // 黒
  samurai('#e3e8f0', '#1e3a5f', '#274b78', '#d9c27a'), // 紺
  samurai('#efe9dd', '#6b4f1d', '#8a6a2a', '#efe3a0'), // 金茶
  samurai('#e3efe6', '#1f5436', '#2c6e47', '#e6b422'), // 緑
];
