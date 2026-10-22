import {registry} from '../src/template-registry.js';
import {createPreview} from '../src/preview.js';
const t=registry.find(t=>t.id==='compact-console'),source=await(await fetch('../'+t.source)).text();
const frame=document.querySelector('#preview'),run=document.querySelector('#run'),results=document.querySelector('#results'),status=document.querySelector('#status'),preview=createPreview(frame,()=>{});
const wait=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS - ':'FAIL - ')+name;results.append(li);};
const visible=el=>!!el?.getClientRects().length;
async function show(theme,width,decorations,mode='jukebox',air=true){
 const titles=t.themes[theme].demoSongs;
 const s={...t.cloneDefaults(theme),decorations,movingHeadAnimation:true,movingHeadNames:titles[0]+'\n'+titles[1],newNames:titles[0]};
 frame.style.width=width+'px';frame.style.height='844px';await preview.update(t.render(source,s),s,{air,mode,reset:true,templateId:t.id,landing:t.landing,startAtLanding:true});await frame.contentDocument.fonts.ready;await wait();return frame.contentDocument;
}
run.onclick=async()=>{run.disabled=true;results.replaceChildren();try{
 for(const theme of Object.keys(t.themes))for(const width of [320,390,1280])for(const decorations of [true,false]){
  let d=await show(theme,width,decorations),w=d.defaultView,tag=[theme,width,decorations].join(' ');
  for(const populated of [false,true]){
   if(populated){d.querySelectorAll('.jukebox-list:not(.sequence-unavailable)')[1].click();await wait();}
   const heading=d.querySelector('.cc-next-label'),next=d.querySelector('.next-playlist');
   check(tag+' '+populated+' divider is above Up next',parseFloat(w.getComputedStyle(heading).borderTopWidth)>0&&w.getComputedStyle(next).borderTopWidth==='0px'&&heading.getBoundingClientRect().bottom<next.getBoundingClientRect().top);
   check(tag+' '+populated+' Up next keeps its empty/populated state',populated?next.textContent.includes(t.themes[theme].demoSongs[1]):w.getComputedStyle(next,'::after').content.includes('No song queued'));
   check(tag+' '+populated+' player stays inside viewport',d.documentElement.scrollWidth<=width+1);
  }
  if(theme==='halloween'){
   const player=w.getComputedStyle(d.querySelector('.cc-player'),'::after'),schedule=w.getComputedStyle(d.querySelector('.cc-schedule'),'::after');
   check(tag+' matching recognisable card webs follow decoration switch',decorations?player.backgroundImage.includes('data:image/svg+xml')&&schedule.backgroundImage===player.backgroundImage:player.content==='none'&&schedule.content==='none');
   if(decorations)check(tag+' web does not intercept taps',player.pointerEvents==='none'&&schedule.pointerEvents==='none');
  }
  d=await show(theme,width,decorations,'voting');check(tag+' Voting keeps single player without Up next',visible(d.querySelector('#los-voting-live .cc-player'))&&![...d.querySelectorAll('.cc-next-label')].some(visible));
  d=await show(theme,width,decorations,'jukebox',false);check(tag+' off-air hides player and queue',![...d.querySelectorAll('.cc-player,.cc-next-label')].some(visible));
 }
}catch(error){check(error.stack,false);}finally{run.disabled=false;status.textContent=results.querySelectorAll('.pass').length+' passed; '+results.querySelectorAll('.fail').length+' failed';}};
document.querySelector('#review').onclick=async()=>{const d=await show('halloween',390,true);d.querySelector('.cc-player').scrollIntoView({block:'start'});};
