// Shared presentation metadata. Theme IDs and saved setting keys remain stable.
const roles=(listening,info,support,player)=>({listening,info,support,player});
export const seasonalConfig={
 thanksgiving:{composition:'harvest',font:'LOS Playfair Display',particle:'autumn-leaf',particleCount:12,motionLabel:'Show falling leaves',motionDependsOnTop:false,
  help:'Choose the lights above, turkey and pie below, or both. Falling leaves stay separate and never block taps.',
  logos:['Harvest gathering','Amber light garland','Harvest wreath'],decoration:['Autumn leaf','autumn-leaf'],compactCard:'#34241c',
  cardComment:'Thanksgiving card colours: listening cream, information forest green, support cranberry.',navBorder:'#c59459',navInset:'#6d482a',
  roles:roles('--panel:#f1d49b;--text:#382515;--text-secondary:#594127;--gold:#57301c;--accent-ink:#ffffff;--section-rgb:87,48,28','--panel:#233c2d;--text:#fff3df;--text-secondary:#d9e4d4;--gold:#f5c27b;--accent-ink:#24170e;--section-rgb:245,194,123','--panel:#632d38;--text:#fff3df;--text-secondary:#f3d8d4;--gold:#f5c27b;--accent-ink:#24170e;--section-rgb:245,194,123','--panel:#f1d49b;--text:#382515;--text-secondary:#594127;--gold:#57301c;--accent-ink:#ffffff;--player-border:#9b6b43')},
 'australia-day':{composition:'aussie',font:'LOS Nunito',particle:null,motionLabel:'Allow gentle animation',motionDependsOnTop:true,
  help:'Choose the flag bunting above, the summer scenes below, or both. Gentle animation sways the bunting.',
  logos:['Aussie summer','Flag bunting','Southern stars crest'],decoration:['Southern Cross','southern-cross'],navBorder:'var(--gold)',navInset:'#00843d',
  cardComment:'Australia Day card colours: listening gold, information blue, support red.',
  roles:roles('--panel:#f6d776;--text:#173722;--text-secondary:#344b34;--gold:#16472d;--accent-ink:#ffffff;--section-rgb:22,71,45','--panel:#12386a;--text:#f4f8f9;--text-secondary:#dde9f7;--gold:#ffcd00;--accent-ink:#17131e;--section-rgb:255,205,0','--panel:#7d2436;--text:#f4f8f9;--text-secondary:#ffe4df;--gold:#ffcd00;--accent-ink:#17131e;--section-rgb:255,205,0','--panel:#12386a;--text:#f4f8f9;--text-secondary:#dde9f7;--gold:#ffcd00;--accent-ink:#17131e;--player-border:#ffcd00')},
 'us-patriotic':{composition:'celebration',font:'LOS Nunito',particle:null,motionLabel:'Allow gentle flag and firework animation',motionDependsOnTop:true,
  help:'Choose the eagle and flags above, the striped ribbon below, or both. Flags sway gently; small fireworks rise, burst and fade in the header corners.',
  logos:['Eagle & star','Star-light arch','Stars & ribbon crest'],decoration:['Eagle','patriotic-home'],navBorder:'var(--gold)',navInset:'#b22234',
  cardComment:'US Patriotic card colours: white player, blue information and red support.',
  roles:roles('--panel:#f7f5ef;--text:#10264a;--text-secondary:#3a506f;--gold:#a51f32;--accent-ink:#ffffff;--section-rgb:165,31,50','--panel:#204778;--text:#f7f5ef;--text-secondary:#dbe5f4;--gold:#d6e7ff;--accent-ink:#10264a;--section-rgb:214,231,255','--panel:#782539;--text:#fff8f4;--text-secondary:#f8dce1;--gold:#ffe4e9;--accent-ink:#64182a;--section-rgb:255,228,233','--panel:#f7f5ef;--text:#10264a;--text-secondary:#3a506f;--gold:#a51f32;--accent-ink:#ffffff;--player-border:#b22234')},
 'valentines-day':{composition:'celebration',font:'LOS Playfair Display',particle:'valentine-heart',particleCount:12,motionLabel:'Show drifting hearts',motionDependsOnTop:false,
  help:'Choose the roses and ribbon above, the chocolates and letter below, or both. Drifting hearts stay separate and never block taps.',
  logos:['Heart & roses','Hearts in lights','Chocolates & love letter'],decoration:['Heart','valentine-heart'],navBorder:'var(--gold)',navInset:'#7d3a50',
  cardComment:'Valentine card colours: cream player, rose information and chocolate support.',
  roles:roles('--panel:#fff1e8;--text:#4a172a;--text-secondary:#704556;--gold:#9b2c50;--accent-ink:#fff8f4;--section-rgb:155,44,80','--panel:#622b46;--text:#fff8f4;--text-secondary:#f1d0d9;--gold:#ffb7ca;--accent-ink:#4a172a;--section-rgb:255,183,202','--panel:#40232c;--text:#fff8f4;--text-secondary:#eed2cc;--gold:#ffd6c3;--accent-ink:#4a172a;--section-rgb:255,214,195','--panel:#fff1e8;--text:#4a172a;--text-secondary:#704556;--gold:#9b2c50;--accent-ink:#fff8f4;--player-border:#b85b79')}
};
export const celebrationThemes=['us-patriotic','valentines-day'];
export const seasonalSVGs=['autumn-leaf','australian-flag','southern-cross','turkey','us-flag','valentine-heart','patriotic-home','valentine-home'];
