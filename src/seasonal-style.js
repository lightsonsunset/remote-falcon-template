// Shared HTML/CSS-only seasonal decoration. Never imports editor or preview code.
import {assetBase} from './assets.js';
import {isNewSeason,themes} from './themes.js';
export const seasonalDefaults={headerDecorations:true,headerTopDecorations:true,headerBottomDecorations:true,navbarDetails:true,seasonalMotion:true,flagPlacement:'header'};
export const seasonalAssetFiles=['autumn-leaf','australian-flag','southern-cross','turkey'].map(n=>'seasonal/'+n+'.svg').concat(['thanksgiving','australia-day'].flatMap(t=>['header','classic','lights-logo','crest'].map(n=>'seasonal/'+t+'-'+n+'.webp')));
const url=n=>assetBase+'seasonal/'+n+'.svg';
const img=(n,c)=>`<img class="${c}" src="${url(n)}" alt="" draggable="false">`;
// Keep the old all-or-nothing switch only as a fallback for older saved designs.
export function headerDecorationParts(s){return {top:s.headerTopDecorations??s.headerDecorations??true,bottom:s.headerBottomDecorations??s.headerDecorations??true};}
export function seasonalClasses(s){const {top,bottom}=headerDecorationParts(s);return isNewSeason(s.theme)?` season-theme season-${s.theme}${top||bottom?' season-header-on':''}${top?' season-header-top':''}${bottom?' season-header-bottom':''}${s.navbarDetails?' season-navbar-on':''}${s.seasonalMotion?' season-motion':''}${s.logoMode==='custom'?' season-custom-logo':''}`:'';}
// Both layouts share these card roles. Personal card/text/accent colours take priority.
function seasonalCardsCSS(s){
 const aussie=s.theme==='australia-day',defaults={...themes[s.theme].colours};
 // Compact's harvest preset uses its own base panel. Other role colours are shared.
 if(!aussie&&s.colourPreset==='harvest')defaults.card='#34241c';
 if(!['card','gold','text','secondary'].every(key=>s.colours[key].toLowerCase()===defaults[key]))return '';
 const scope='#show-options.season-'+s.theme,listening='.section-card:has(>.music-options)',info='.info-intro,.live-schedule,.cc-schedule,.home-extra,.info-tab-callout',support='.support-intro,.support-card,.donation-card,.additional-donation';
 const cards=`${scope} :is(${listening},${info},${support})`;
 // Scope surfaces to the original layout's direct player cards and Compact's
 // outer player/queue cards. Song choices must not inherit this palette.
 const players=`${scope} :is(.music-live-section > .playing-now,.music-live-section > .next-playlist,.music-live-section > .jukebox-queue-container,.cc-player,.cc-queue)`;
 return `
/* ${aussie?'Australia Day card colours: listening gold, information blue, support red.':'Thanksgiving card colours: listening cream, information forest green, support cranberry.'} */
${scope} ${listening}{${aussie?'--panel:#f6d776;--text:#173722;--text-secondary:#344b34;--gold:#16472d;--accent-ink:#ffffff;--section-rgb:22,71,45':'--panel:#f1d49b;--text:#382515;--text-secondary:#594127;--gold:#57301c;--accent-ink:#ffffff;--section-rgb:87,48,28'};--surface-inset:#ffffff26}
${scope} :is(${info}){${aussie?'--panel:#12386a;--text:#f4f8f9;--text-secondary:#dde9f7;--gold:#ffcd00;--accent-ink:#17131e;--section-rgb:255,205,0':'--panel:#233c2d;--text:#fff3df;--text-secondary:#d9e4d4;--gold:#f5c27b;--accent-ink:#24170e;--section-rgb:245,194,123'}}
${scope} :is(${support}){${aussie?'--panel:#7d2436;--text:#f4f8f9;--text-secondary:#ffe4df;--gold:#ffcd00;--accent-ink:#17131e;--section-rgb:255,205,0':'--panel:#632d38;--text:#fff3df;--text-secondary:#f3d8d4;--gold:#f5c27b;--accent-ink:#24170e;--section-rgb:245,194,123'}}
${cards}{--section-accent:var(--gold);--surface-border:color-mix(in srgb,var(--gold) 35%,transparent);background:var(--panel);color:var(--text);border-color:var(--surface-border)}
${cards} :is(h2,h3){color:var(--text)}
${cards} .support-action,${cards} .support-action:hover{background:var(--gold);color:var(--accent-ink)}
/* A coordinated player surface, separate from the selectable song cards. */
${players}{${aussie?'--panel:#12386a;--text:#f4f8f9;--text-secondary:#dde9f7;--gold:#ffcd00;--accent-ink:#17131e;--player-border:#ffcd00':'--panel:#f1d49b;--text:#382515;--text-secondary:#594127;--gold:#57301c;--accent-ink:#ffffff;--player-border:#9b6b43'};--surface-border:color-mix(in srgb,var(--player-border) 38%,var(--panel));background:var(--panel);color:var(--text);border-color:var(--surface-border)}
${scope} :is(.music-live-section > .playing-now,.cc-player){border:2px solid color-mix(in srgb,var(--player-border) 70%,var(--panel))}
${scope} .music-live-section :is(.playing-now,.next-playlist,.jukebox-queue-container):empty::after,${scope} .cc-queue .jukebox-queue-container:empty::after{color:var(--text-secondary)}
`;
}
export function seasonalTokens(s){
 if(!isNewSeason(s.theme))return {SEASON_HEADER_ART:'',SEASON_FLOATING_ART:'',SEASON_CSS:''};
 const aussie=s.theme==='australia-day',{top,bottom}=headerDecorationParts(s);
 // Older local flagPlacement values remain valid saved settings; flags now stay in the header.
 const particle='autumn-leaf';
 const drifting=!aussie&&s.seasonalMotion?`<div class="season-drift season-drift-screen" aria-hidden="true">${Array.from({length:12},(_,i)=>img(particle,'season-particle season-particle-'+i)).join('')}</div>`:'';
 const header=!(top||bottom)?'':`<div class="season-header-art" aria-hidden="true"><img class="season-header-source" src="${assetBase}seasonal/${s.theme}-header.webp" alt="" draggable="false"><span class="season-header-frame"></span></div>`;
 const scoped='body:has(#show-options.season-theme)',font=aussie?'LOS Nunito':'LOS Playfair Display';
 return {SEASON_HEADER_ART:header,SEASON_FLOATING_ART:drifting,SEASON_CSS:`
/* Seasonal artwork remains outside the interactive content. */
@font-face{font-family:"LOS Nunito";src:url("${assetBase}fonts/nunito.ttf") format("truetype");font-weight:100 900;font-display:swap}
@font-face{font-family:"LOS Playfair Display";src:url("${assetBase}fonts/playfair-display.ttf") format("truetype");font-weight:400 900;font-display:swap}
${scoped}{font-family:"LOS Nunito",Arial,sans-serif}
#show-options.season-theme{--season-heading:"${font}",Georgia,serif}
#show-options.season-theme .content__body h2,#show-options.season-theme .content__body h3{font-family:var(--season-heading)}
#show-options.season-theme .logo-stage::before,#show-options.season-theme .logo-stage::after{display:none}
#show-options.season-theme .share-brand{position:relative;isolation:isolate;flex-shrink:0}
#show-options.season-header-on .share-brand{padding:105px 44px 90px;min-height:330px}
#show-options.season-theme .show-logo{object-fit:contain;max-width:min(320px,100%);max-height:160px}
#show-options.season-theme .share-brand>h1,#show-options.season-theme .share-brand>p,#show-options.season-theme .share-brand>a,#show-options.season-theme .share-brand>.show-logo{position:relative;z-index:1}
#show-options.season-theme .season-header-art{position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden;border-radius:18px;container-type:inline-size}
#show-options.season-theme .season-header-source{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
#show-options.season-theme .season-header-frame{position:absolute;inset:0}
#show-options.season-theme .season-header-frame::before,#show-options.season-theme .season-header-frame::after{content:"";position:absolute;left:0;right:0;height:120px;height:calc(100cqw / 3);background-image:url("${assetBase}seasonal/${s.theme}-header.webp");background-size:100% auto;background-repeat:no-repeat}
#show-options.season-theme .season-header-frame::before{top:0;background-position:center top}
#show-options.season-theme .season-header-frame::after{bottom:0;background-position:center bottom}
#show-options.season-header-on .share-brand h1{font-size:clamp(25px,4vw,34px);line-height:1.15}
#show-options.season-header-on .share-brand p{font-size:14px;line-height:1.5}
#show-options.season-header-on .share-brand .cc-eyebrow{font-size:9px}
${aussie?`#show-options.season-theme .season-drift{position:absolute;left:0;right:0;top:0;height:80px;pointer-events:none;overflow:hidden;z-index:2}
#show-options.season-theme .season-particle{position:absolute;top:-26px;left:3%;width:20px;height:22px;object-fit:contain;border-radius:0;animation:season-fall 14s linear infinite;opacity:0}
#show-options.season-theme .season-particle-1{left:92%;animation-delay:-5s;animation-duration:17s}
#show-options.season-theme .season-particle-2{left:70%;animation-delay:-11s;animation-duration:19s}
@keyframes season-fall{0%{opacity:0;transform:translateY(0) rotate(-12deg)}12%,85%{opacity:.65}100%{opacity:0;transform:translateY(var(--season-fall-distance,100px)) rotate(15deg)}}`:`
/* Decorative only: viewport-sized, below request messages and transparent to taps. */
#show-options.season-thanksgiving .season-drift{position:fixed;inset:0;width:100%;height:100vh;height:100dvh;pointer-events:none;overflow:hidden;z-index:200}
#show-options.season-thanksgiving .season-drift *{pointer-events:none}
#show-options.season-thanksgiving:not(.season-motion) .season-drift{display:none}
#show-options.season-thanksgiving .season-particle{position:absolute;top:-40px;left:var(--leaf-left);width:var(--leaf-size);height:var(--leaf-size);object-fit:contain;border-radius:0;pointer-events:none;opacity:0;animation:season-leaf-fall var(--leaf-duration) linear var(--leaf-delay) infinite}
${Array.from({length:12},(_,i)=>`#show-options.season-thanksgiving .season-particle-${i}{--leaf-left:${[4,88,29,65,12,78,47,94,38,57,21,70][i]}%;--leaf-size:${[22,18,25,17,20,24,18,21,16,22,19,24][i]}px;--leaf-duration:${[19,24,21,26,23,20,27,22,25,21,24,26][i]}s;--leaf-delay:-${[4,15,9,20,2,12,18,7,21,5,11,17][i]}s;--leaf-sway:${i%2?'-':' '}${14+i%3*6}px;filter:hue-rotate(${i%3*16}deg)}`).join('\n')}
@keyframes season-leaf-fall{0%{opacity:0;transform:translate(0,0) rotate(-25deg)}10%{opacity:.55}50%{transform:translate(var(--leaf-sway),50vh) rotate(80deg)}90%{opacity:.5}100%{opacity:0;transform:translate(0,calc(100vh + 80px)) rotate(175deg)}}
@supports(height:100dvh){@keyframes season-leaf-fall{0%{opacity:0;transform:translate(0,0) rotate(-25deg)}10%{opacity:.55}50%{transform:translate(var(--leaf-sway),50dvh) rotate(80deg)}90%{opacity:.5}100%{opacity:0;transform:translate(0,calc(100dvh + 80px)) rotate(175deg)}}}
@media(max-width:600px){#show-options.season-thanksgiving .season-particle:nth-child(n+9){display:none}}
body:has(#show-options.season-thanksgiving) .season-turkey-icon{font-size:26px;display:inline-block;width:1em;height:1em;background:currentColor;mask:url("${url('turkey')}") center/contain no-repeat;-webkit-mask:url("${url('turkey')}") center/contain no-repeat}
#show-options.season-thanksgiving.season-header-on .share-brand{padding-bottom:125px;min-height:350px}
#show-options.season-thanksgiving .season-header-frame::before,#show-options.season-thanksgiving .season-header-frame::after{height:min(140px,calc(100cqw / 3));background-size:min(100%,420px) auto}
`}
${scoped} .los-menu{background:color-mix(in srgb,var(--panel) 30%,#080e12);border-color:color-mix(in srgb,var(--gold) 45%,transparent)}
${scoped} .los-menu__item{--nav-tint:color-mix(in srgb,var(--panel) 75%,var(--gold));--nav-accent:var(--gold)}
body:has(#show-options.season-navbar-on) .los-menu{border:2px solid ${aussie?'var(--gold)':'#c59459'};box-shadow:0 10px 30px #0009,inset 0 0 0 2px ${aussie?'#00843d':'#6d482a'}}
${aussie?`
/* Only the header bunting sways. The page and corner illustrations stay still. */
#show-options.season-australia-day.season-header-on .share-brand{padding-top:108px;padding-bottom:125px;min-height:350px}
#show-options.season-australia-day .season-header-frame::before,#show-options.season-australia-day .season-header-frame::after{height:min(140px,calc(100cqw / 3));background-size:min(100%,420px) auto}
#show-options.season-australia-day.season-motion .season-header-frame::before{transform-origin:50% 0;animation:season-bunting 7s ease-in-out infinite alternate}
@media(min-width:600px){#show-options.season-australia-day.season-header-on .share-brand{padding-bottom:150px}}
@keyframes season-bunting{from{transform:perspective(700px) rotateX(-2deg) rotate(-.6deg)}to{transform:perspective(700px) rotateX(3deg) rotate(.6deg)}}
body:has(#show-options.season-australia-day) .season-home-icon{font-size:26px;display:inline-block;width:1em;height:1em;background:currentColor;mask:url("${url('southern-cross')}") center/contain no-repeat;-webkit-mask:url("${url('southern-cross')}") center/contain no-repeat}
#show-options.season-australia-day .section-card,#show-options.season-australia-day .jukebox-list,#show-options.season-australia-day .cell-vote-playlist{border-color:color-mix(in srgb,var(--gold) 28%,transparent)}
@media(prefers-reduced-motion:reduce){#show-options.season-australia-day.season-motion .season-header-frame::before{animation:none;transform:none}}
`:''}
${seasonalCardsCSS(s)}
#show-options.season-theme .music-picker-section > .music-request-card{margin-top:16px}
${scoped} .request-feedback{--feedback-accent:${s.colours.gold};--feedback-bg:${s.colours.card}}
${scoped} .innerRequestSuccessful::before,${scoped} .failed_Info_Box::before{background:linear-gradient(130deg,${s.colours.gold},${s.colours.card})}
@media(max-width:420px){#show-options.season-custom-logo.season-header-on .share-brand{padding-left:28px;padding-right:28px;padding-bottom:85px}#show-options.season-custom-logo .season-header-frame{opacity:.55}}
/* Remove the artwork and its space independently. Both enabled retains the original layout. */
#show-options.season-theme:not(.season-header-top) .season-header-frame::before,#show-options.season-theme:not(.season-header-bottom) .season-header-frame::after{display:none}
#show-options.season-header-on:not(.season-header-top) .share-brand{padding-top:28px;min-height:0}
#show-options.season-header-on:not(.season-header-bottom) .share-brand{padding-bottom:24px;min-height:0}
@media(prefers-reduced-motion:reduce){#show-options.season-theme .season-drift{display:none}#show-options.season-theme .season-particle{animation:none}}
`};
}
