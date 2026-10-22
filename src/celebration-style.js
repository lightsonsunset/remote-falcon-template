// Shared, script-free presentation for the two celebration themes.
import {celebrationThemes,seasonalConfig} from './seasonal-config.js';
export function celebrationHeader(s,base){
 if(s.theme!=='us-patriotic')return '';
 const image=(file,cls)=>`<img src="${base}seasonal/${file}.svg" class="${cls}" alt="" draggable="false">`;
 const firework=side=>`<span class="celebration-firework celebration-firework-${side}"><span class="celebration-rocket"></span>${Array.from({length:20},(_,i)=>`<span class="celebration-spark celebration-spark-${i}"></span>`).join('')}</span>`;
 return image('us-flag','celebration-flag celebration-flag-left')+image('us-flag','celebration-flag celebration-flag-right')+(s.seasonalMotion?firework('left')+firework('right'):'');
}
export function celebrationCSS(s,base){
 if(!celebrationThemes.includes(s.theme))return '';
 const scope='#show-options.season-'+s.theme,patriotic=s.theme==='us-patriotic',prefix=patriotic?'patriotic':'valentine';
 return `
/* Only Home uses a theme-owned symbol; explicit icon choices stay authoritative. */
body:has(${scope}) .season-nav-icon{font-size:26px;display:inline-block;width:1em;height:1em;background:currentColor;vertical-align:middle}
body:has(${scope}) .season-nav-${prefix}-home{mask:url("${base}seasonal/${prefix}-home.svg") center/contain no-repeat;-webkit-mask:url("${base}seasonal/${prefix}-home.svg") center/contain no-repeat}
${scope}.season-header-on .share-brand{padding-top:${patriotic?180:115}px;padding-bottom:${patriotic?95:120}px;min-height:0}
${scope} .season-header-frame::before,${scope} .season-header-frame::after{height:${patriotic?'125px':'135px'};background-size:min(100%,380px) auto}
${scope} .season-header-frame::before{height:125px}
${scope} .share-brand h1{max-width:100%;text-wrap:balance}
${scope} .share-brand p{max-width:100%;text-wrap:balance}
${scope} .show-status{background:color-mix(in srgb,var(--panel) 75%,#080e12);color:var(--gold);border-color:color-mix(in srgb,var(--gold) 40%,transparent);box-shadow:none}
${scope} .show-status .show-status__detail{color:var(--text-secondary)}
${scope} .show-status--live .show-status__label::before{background:var(--gold);box-shadow:0 0 0 4px color-mix(in srgb,var(--gold) 12%,transparent),0 0 12px color-mix(in srgb,var(--gold) 45%,transparent)}
${scope} .season-header-art *{pointer-events:none}
${scope} .section-card,${scope} .cc-player,${scope} .cc-queue,${scope} .jukebox-list,${scope} .cell-vote-playlist{border-color:color-mix(in srgb,var(--gold) 32%,transparent)}
/* Badges inherit the editable accent palette; shape and RF tally clearances stay intact. */
${scope} .los-song-list :is(.jukebox-list,.cell-vote-playlist)::after{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--text) 30%,transparent)}
body:has(${scope}.season-navbar-on) .los-menu{box-shadow:0 10px 30px #0009,inset 0 0 0 2px ${patriotic?'#b22234':'#7d3a50'},inset 0 0 0 3px color-mix(in srgb,var(--gold) 50%,transparent)}
${patriotic?`
${scope} .celebration-flag{position:absolute;top:112px;width:28%;max-width:116px;height:auto;filter:drop-shadow(0 3px 3px #0006);transform-origin:0 50%;z-index:1;border-radius:0}
${scope} .celebration-flag-left{left:8%;transform:rotate(-8deg)}
${scope} .celebration-flag-right{right:8%;transform:rotate(8deg);transform-origin:100% 50%}
${scope}.season-motion .celebration-flag-left{animation:celebration-flag-left 8s ease-in-out infinite alternate}
${scope}.season-motion .celebration-flag-right{animation:celebration-flag-right 9s ease-in-out infinite alternate}
/* One launch and one burst at a time, confined to the decorative header. */
${scope} .celebration-firework{position:absolute;width:28%;max-width:108px;height:150px;top:0;z-index:2;--burst-radius:clamp(30px,11cqw,44px);--firework-delay:-.3s}
${scope} .celebration-firework-left{left:0}
${scope} .celebration-firework-right{right:0;top:8px;--firework-delay:-4.8s}
/* With no upper picture, keep the bursts above the name without reserving artwork space. */
${scope}:not(.season-header-top) .share-brand:not(:has(>.header-artwork-picture)) .celebration-firework{width:16%;top:-20px;--burst-radius:clamp(16px,5cqw,22px)}
${scope} :is(.celebration-rocket,.celebration-spark){position:absolute;left:50%;top:46px;display:block;pointer-events:none;opacity:0;border-radius:50%;animation-duration:9s;animation-delay:var(--firework-delay);animation-iteration-count:infinite;animation-timing-function:linear}
${scope} .celebration-rocket{width:3px;height:5px;background:#fff5d9;box-shadow:0 0 5px 1px #ffe4ac;animation-name:celebration-launch}
${scope} .celebration-rocket::after{content:"";position:absolute;top:3px;left:1px;width:1px;height:23px;background:linear-gradient(#fff5d9,transparent)}
${scope} .celebration-spark{width:2px;height:12px;background:linear-gradient(currentColor 25%,transparent);box-shadow:0 -2px 3px currentColor;animation-name:celebration-burst}
${Array.from({length:20},(_,i)=>{const angle=i*18*Math.PI/180,reach=i%2?.76:1;return `${scope} .celebration-spark-${i}{--spark-x:calc(var(--burst-radius)*${(Math.cos(angle)*reach).toFixed(4)});--spark-y:calc(var(--burst-radius)*${(Math.sin(angle)*reach).toFixed(4)});--spark-angle:${i*18+90}deg;color:${['#ff777e','#fff6e5','#91c5ff'][i%3]}}`;}).join('\n')}
${scope}:not(.season-motion) .celebration-firework{display:none}
${scope}:not(.season-header-top) .celebration-flag{display:none}
@keyframes celebration-flag-left{from{transform:perspective(500px) rotate(-8deg) rotateY(-5deg)}to{transform:perspective(500px) rotate(-4deg) rotateY(7deg)}}
@keyframes celebration-flag-right{from{transform:perspective(500px) rotate(8deg) rotateY(5deg)}to{transform:perspective(500px) rotate(4deg) rotateY(-7deg)}}
@keyframes celebration-launch{0%{opacity:0;transform:translate(5px,88px)}3%{opacity:.85}17%{opacity:1;transform:translate(0,0)}18%,100%{opacity:0;transform:translate(0,0)}}
@keyframes celebration-burst{0%,18%{opacity:0;transform:translate(0,0) rotate(var(--spark-angle)) scale(.2)}20%{opacity:1;transform:translate(0,0) rotate(var(--spark-angle)) scale(.4)}31%{opacity:.95;transform:translate(var(--spark-x),var(--spark-y)) rotate(var(--spark-angle)) scale(1)}43%{opacity:.35;transform:translate(calc(var(--spark-x)*1.15),calc(var(--spark-y) + 13px)) rotate(var(--spark-angle)) scale(.65)}49%,100%{opacity:0;transform:translate(calc(var(--spark-x)*1.2),calc(var(--spark-y) + 24px)) rotate(var(--spark-angle)) scale(.2)}}
`:``}
${!patriotic?`
${scope} .season-drift{position:fixed;inset:0;height:100vh;height:100dvh;overflow:hidden;pointer-events:none;z-index:200}
${scope} .season-drift *{pointer-events:none}
${scope} .season-particle{position:absolute;bottom:-30px;left:var(--heart-left);width:var(--heart-size);height:var(--heart-size);border-radius:0;opacity:0;animation:celebration-hearts var(--heart-duration) linear var(--heart-delay) infinite}
${Array.from({length:seasonalConfig['valentines-day'].particleCount},(_,i)=>{const duration=22+i%6*2;return `${scope} .season-particle-${i}{--heart-left:${[5,91,21,75,43,62,13,84,32,54,69,39][i]}%;--heart-size:${[18,22,14,20,15,18][i%6]}px;--heart-duration:${duration}s;--heart-delay:-${(duration*(i+.5)/seasonalConfig['valentines-day'].particleCount).toFixed(2)}s}`;}).join('\n')}
@keyframes celebration-hearts{0%{opacity:0;transform:translateY(0) rotate(-12deg)}15%,80%{opacity:.28}50%{transform:translate(18px,-50vh) rotate(8deg)}100%{opacity:0;transform:translate(0,calc(-100vh - 60px)) rotate(-8deg)}}
`:``}
@media(prefers-reduced-motion:reduce){${scope} :is(.celebration-flag,.celebration-rocket,.celebration-spark,.season-particle){animation:none!important}${scope} :is(.season-drift,.celebration-firework){display:none}}
`;
}
