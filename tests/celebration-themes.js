import {registry} from '../src/template-registry.js';
import {createPreview} from '../src/preview.js';
import {assetBase,logoChoices} from '../src/assets.js';
const frame=document.querySelector('#preview'),run=document.querySelector('#run'),results=document.querySelector('#results'),status=document.querySelector('#status'),preview=createPreview(frame,()=>{});
const wait=ms=>new Promise(r=>setTimeout(r,ms)),visible=e=>!!e&&e.getClientRects().length>0;
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS - ':'FAIL - ')+name;results.append(li);};
const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number),lum=s=>rgb(s).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0),contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
async function show(t,source,s,width,mode='jukebox',air=true){frame.style.width=width+'px';frame.style.height='844px';await preview.update(t.render(source,s),s,{air,mode,reset:true,templateId:t.id,landing:t.landing});const d=frame.contentDocument;await d.fonts.ready;await Promise.all([...d.images].map(i=>i.decode().catch(()=>{})));await wait(20);return d;}
run.onclick=async()=>{run.disabled=true;results.replaceChildren();try{
 for(const t of registry){const source=await(await fetch('../'+t.source)).text();
 for(const theme of ['us-patriotic','valentines-day'])for(const width of [320,390,1280])for(const mode of ['jukebox','voting'])for(const air of [true,false]){
  const s=t.cloneDefaults(theme),label=t.name+' '+theme+' '+width+' '+mode+' '+air;status.textContent=label;
  const d=await show(t,source,s,width,mode,air),w=d.defaultView;
  check(label+' fits',d.documentElement.scrollWidth<=width+1);
  check(label+' artwork loads',[...d.images].filter(i=>i.className.startsWith('season-')||i.className.startsWith('celebration-')).every(i=>i.complete&&i.naturalWidth>0));
  check(label+' unpublished artwork served locally',[...d.images].filter(i=>/seasonal\//.test(i.src)).every(i=>new URL(i.src).origin===location.origin));
  check(label+' decoration ignores taps',w.getComputedStyle(d.querySelector('.season-header-art')).pointerEvents==='none');
  const header=d.querySelector('.share-brand'),title=header.querySelector('h1');check(label+' title clear of upper artwork',title.getBoundingClientRect().top>=header.getBoundingClientRect().top+(theme==='us-patriotic'?170:105));
  if(theme==='us-patriotic'){
   const rocket=d.querySelector('.celebration-rocket'),sparks=[...d.querySelectorAll('.celebration-spark')],animations=d.getAnimations().filter(a=>a.effect.target.matches('.celebration-rocket,.celebration-spark'));
   const pose=async ms=>{for(const a of animations){a.pause();a.currentTime=9000+ms+parseFloat(w.getComputedStyle(a.effect.target).animationDelay)*1000;}await wait(20);};
   check(label+' original CSS rocket and burst',!!rocket&&sparks.length===40&&animations.length===42);
   await pose(800);const start=rocket.getBoundingClientRect().top;
   check(label+' launch visible before explosion',parseFloat(w.getComputedStyle(rocket).opacity)>.7&&sparks.every(e=>parseFloat(w.getComputedStyle(e).opacity)===0));
   await pose(1520);check(label+' rocket rises',rocket.getBoundingClientRect().top<start-25);
   await pose(2800);const spark=sparks[0].getBoundingClientRect(),origin=rocket.getBoundingClientRect();
   check(label+' burst expands and launch vanishes',spark.left-origin.left>25&&parseFloat(w.getComputedStyle(sparks[0]).opacity)>.9&&parseFloat(w.getComputedStyle(rocket).opacity)===0);
   check(label+' burst stays above header text',sparks.every(e=>e.getBoundingClientRect().bottom<title.getBoundingClientRect().top));
   check(label+' sparks cannot block taps',sparks.every(e=>w.getComputedStyle(e).pointerEvents==='none'));
   await pose(4300);check(label+' sparks fall and fade',sparks[0].getBoundingClientRect().top>spark.top+12&&parseFloat(w.getComputedStyle(sparks[0]).opacity)<.15);
   await pose(5000);check(label+' quiet interval between bursts',sparks.every(e=>parseFloat(w.getComputedStyle(e).opacity)===0));
  }
  const nav=[...d.querySelectorAll('.los-menu__item')].filter(visible);check(label+' nav tap areas',nav.every(e=>e.getBoundingClientRect().height>=44&&e.getBoundingClientRect().width>=44));
  check(label+' nav names',nav.every(e=>(e.getAttribute('aria-label')||e.textContent).trim()));
  check(label+' standard Music and Info icons',!!d.querySelector('[data-tab-target="music"] .fa-music')&&!!d.querySelector('[data-tab-target="info"] .fa-circle-info'));
  check(label+' standard Support icon',!!d.querySelector('[data-tab-target="support"] .'+(t.separateSeasons?'fa-heart':'fa-hand-holding-heart')));
  if(t.landing==='home'){
   const icon=d.querySelector('[data-tab-target="home"] .season-nav-icon'),style=w.getComputedStyle(icon);
   check(label+' seasonal Home symbol loaded locally',style.maskImage.includes(theme==='us-patriotic'?'patriotic-home.svg':'valentine-home.svg')&&style.maskImage.includes(location.origin));
  }
  const positions=nav.map(e=>e.getBoundingClientRect());
  for(const panel of ['support','info','music',...(t.landing==='home'?['home']:[])]){d.querySelector('[data-tab-target="'+panel+'"]').click();await wait(15);check(label+' '+panel+' visible',visible(d.querySelector('#'+panel+'-panel')));check(label+' stable '+panel+' nav',nav.every((e,i)=>Math.abs(e.getBoundingClientRect().x-positions[i].x)<1&&Math.abs(e.getBoundingClientRect().y-positions[i].y)<1));}
  d.querySelector('[data-tab-target="music"]').click();await wait(15);
  check(label+' air state controls song list',[...d.querySelectorAll('.los-song-list')].some(visible)===air);
  if(air){const players=[...d.querySelectorAll('.cc-player,.cc-queue,.music-live-section > .playing-now,.music-live-section > .next-playlist,.music-live-section > .jukebox-queue-container')].filter(visible);check(label+' visible player',players.length>0);for(const p of players){const c=w.getComputedStyle(p);check(label+' player contrast '+p.className,contrast(c.color,c.backgroundColor)>=4.5);}
   const player=players[0],song=[...d.querySelectorAll('.jukebox-list,.cell-vote-playlist')].find(visible);if(song)check(label+' player distinct from songs',w.getComputedStyle(player).backgroundColor!==w.getComputedStyle(song).backgroundColor);
   const queue=d.querySelector('.cc-queue');if(queue){queue.open=true;check(label+' expanded queue fits',queue.getBoundingClientRect().right<=width+1);queue.open=false;check(label+' queue collapses',!queue.open);}
  }
  const decorative=[...d.querySelectorAll('style')].flatMap(e=>[...e.sheet.cssRules]).filter(r=>r.conditionText?.includes('prefers-reduced-motion'));
  check(label+' reduced motion rules present',decorative.some(r=>r.cssText.includes('season-drift')));
  // Exercise the reduced-motion declarations as a stylesheet fixture without changing the host preference.
  const reduced=d.createElement('style');reduced.textContent=decorative.map(r=>[...r.cssRules].map(c=>c.cssText).join('\n')).join('\n');d.head.append(reduced);
  check(label+' reduced motion stops decorative animation',[...d.querySelectorAll('.celebration-flag,.celebration-rocket,.celebration-spark,.season-particle')].every(e=>w.getComputedStyle(e).animationName==='none'));
  if(theme==='us-patriotic')check(label+' reduced motion hides fireworks',!visible(d.querySelector('.celebration-firework')));
  if(theme==='valentines-day')check(label+' reduced motion hides hearts',!visible(d.querySelector('.season-drift')));
 }
 for(const theme of ['us-patriotic','valentines-day'])for(const width of [320,390,1280])for(const custom of [false,true])for(const top of [false,true])for(const bottom of [false,true]){
  const s=t.cloneDefaults(theme);s.headerTopDecorations=top;s.headerBottomDecorations=bottom;if(custom){s.logoMode='custom';s.logo=assetBase+'christmas-header.webp';}s.name='A Very Long Personal Show Name That Needs More Than One Line';s.showMenuLabels=false;
  const d=await show(t,source,s,width),w=d.defaultView,label=t.id+' '+theme+' '+width+' custom '+custom+' top '+top+' bottom '+bottom,art=d.querySelector('.season-header-frame'),header=d.querySelector('.share-brand');status.textContent=label;
  check(label+' artwork choices',!!art===(top||bottom||theme==='us-patriotic')&&(!art||(w.getComputedStyle(art,'::before').display!=='none')===top&&(w.getComputedStyle(art,'::after').display!=='none')===bottom));
  check(label+' no horizontal overflow',d.documentElement.scrollWidth<=width+1);
  check(label+' no space for hidden top',top||parseFloat(w.getComputedStyle(header).paddingTop)<=36);
  check(label+' no space for hidden bottom',bottom||parseFloat(w.getComputedStyle(header).paddingBottom)<=28);
  if(custom){const image=d.querySelector('.show-logo').getBoundingClientRect();check(label+' logo contained',image.left>=0&&image.right<=width&&image.top>=header.getBoundingClientRect().top);}
 }
 for(const theme of ['us-patriotic','valentines-day']){
  const s=t.cloneDefaults(theme);s.seasonalMotion=false;s.navbarDetails=false;s.icons.navMusic='star';s.colours.card='#203040';s.colours.gold='#ffeedd';s.colours.text='#ffffff';s.colours.secondary='#ddeeff';if(t.separateSeasons)s.advancedColours=true;
  const d=await show(t,source,s,320);d.querySelector('[data-tab-target="music"]').click();await wait(15);
  const player=[...d.querySelectorAll('.cc-player,.music-live-section > .playing-now')].find(visible);check(t.id+' '+theme+' custom player colour preserved',d.defaultView.getComputedStyle(player).backgroundColor==='rgb(32, 48, 64)');
  check(t.id+' '+theme+' custom nav icon',d.querySelector('[data-tab-target="music"] .fa-star'));
  check(t.id+' '+theme+' motion off',!d.querySelector('.season-drift')&&[...d.querySelectorAll('.celebration-flag,.celebration-firework')].every(e=>d.defaultView.getComputedStyle(e).animationName==='none'));
  if(theme==='us-patriotic')check(t.id+' fireworks omitted when motion disabled',!d.querySelector('.celebration-firework'));
  if(t.features.includedArtwork)for(const choice of logoChoices[theme]){s.logoMode='seasonal';s.logoStyle=choice.id;s.combineLogoName=true;const d=await show(t,source,s,320);check(theme+' logo '+choice.id+' loaded and contained',[...d.querySelectorAll('.share-brand img')].filter(visible).every(i=>i.naturalWidth>0&&i.getBoundingClientRect().right<=320));}
 }
 }
 }catch(error){check(error.stack,false);}finally{run.disabled=false;const failed=results.querySelectorAll('.fail').length;status.textContent=results.children.length+' checks, '+failed+' failures';document.title=failed+' failures · Celebration theme checks';}};
