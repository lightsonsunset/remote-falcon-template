import {registry} from '../src/template-registry.js';
import {createPreview} from '../src/preview.js';
import {assetBase,logoChoices} from '../src/assets.js';
import {setHeaderArtwork} from '../src/header-artwork.js';
const frame=document.querySelector('#preview'),run=document.querySelector('#run'),results=document.querySelector('#results'),status=document.querySelector('#status'),preview=createPreview(frame,()=>{});
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS - ':'FAIL - ')+name;results.append(li);};
run.onclick=async()=>{run.disabled=true;results.replaceChildren();try{
 for(const t of registry){const source=await(await fetch('../'+t.source)).text();
 for(const theme of Object.keys(t.themes))for(const width of [320,390,1280])for(const upper of ['theme','classic','lights','crest','none']){
  const s=t.cloneDefaults(theme),tag=t.id+' '+theme+' '+width+' '+upper;status.textContent=tag;
  setHeaderArtwork(s,upper);s.logoMode=upper==='lights'?'none':upper==='crest'?'seasonal':'custom';s.logo=assetBase+'seasonal/australia-day-classic.webp';s.logoStyle='lights';s.name='Our very long personalised show name that must remain readable';s.welcome='A welcome message to go with our own separate logo.';
  frame.style.width=width+'px';frame.style.height='844px';await preview.update(t.render(source,s),s,{air:upper!=='none',mode:upper==='crest'?'voting':'jukebox',reset:true,templateId:t.id,landing:t.landing});
  const d=frame.contentDocument,w=d.defaultView;await d.fonts.ready;await Promise.all([...d.images].map(i=>i.decode().catch(()=>{})));
  const h=d.querySelector('.share-brand'),art=h.querySelector('.header-artwork-picture'),logo=h.querySelector('.show-logo'),title=h.querySelector('h1');
  check(tag+' no horizontal overflow',d.documentElement.scrollWidth<=width+1);
  check(tag+' logo independent',!!logo===(s.logoMode!=='none'));
  check(tag+' chosen header present',!!art===['classic','lights','crest'].includes(upper));
  check(tag+' images load locally and fit',[...h.querySelectorAll('img')].every(i=>i.naturalWidth>0&&new URL(i.src).origin===location.origin&&i.getBoundingClientRect().right<=width+1));
  if(art){
   check(tag+' top image above identity',art.getBoundingClientRect().bottom<=(logo||title).getBoundingClientRect().top+1);
   check(tag+' header cannot intercept taps',w.getComputedStyle(art).pointerEvents==='none');
   check(tag+' replaces only upper decoration',!d.querySelector('.season-header-top')&&!h.querySelector('.cc-web,.cc-lights'));
   check(tag+' intended picture selected',art.querySelector('img').src.endsWith(logoChoices[theme].find(c=>c.id===upper).file));
  }
  check(tag+' name below logo',!logo||logo.getBoundingClientRect().bottom<=title.getBoundingClientRect().top+1);
  if(theme==='us-patriotic'){
   const fireworks=[...h.querySelectorAll('.celebration-firework')];
   check(tag+' fireworks independent of upper artwork',fireworks.length===2&&fireworks.every(e=>w.getComputedStyle(e).display!=='none'&&e.getClientRects().length));
   check(tag+' only default artwork includes extra flags',[...h.querySelectorAll('.celebration-flag')].every(e=>(w.getComputedStyle(e).display!=='none')===(upper==='theme')));
   check(tag+' fireworks transparent to taps',fireworks.every(e=>w.getComputedStyle(e).pointerEvents==='none'));
  }
  if(!['christmas','halloween'].includes(theme))check(tag+' lower decoration retained',d.querySelector('#show-options').classList.contains('season-header-bottom'));
 }
 const s=t.cloneDefaults('us-patriotic');setHeaderArtwork(s,'none');s.headerBottomDecorations=false;
 await preview.update(t.render(source,s),s,{air:true,mode:'voting',reset:true,templateId:t.id,landing:t.landing});
 const d=frame.contentDocument,w=d.defaultView;
 check(t.id+' fireworks remain with both artwork slots hidden',d.querySelectorAll('.celebration-firework').length===2&&[...d.querySelectorAll('.celebration-firework')].every(e=>w.getComputedStyle(e).display!=='none'));
 const reduced=d.createElement('style');reduced.textContent=[...d.querySelectorAll('style')].flatMap(e=>[...e.sheet.cssRules]).filter(r=>r.conditionText?.includes('prefers-reduced-motion')).flatMap(r=>[...r.cssRules].map(c=>c.cssText)).join('\n');d.head.append(reduced);
 check(t.id+' reduced motion hides independent fireworks',[...d.querySelectorAll('.celebration-firework')].every(e=>w.getComputedStyle(e).display==='none'));
 s.seasonalMotion=false;await preview.update(t.render(source,s),s,{reset:true,templateId:t.id,landing:t.landing});
 check(t.id+' motion off omits fireworks with hidden artwork',!frame.contentDocument.querySelector('.celebration-firework'));
 }
 }catch(error){check(error.stack,false);}finally{run.disabled=false;const failed=results.querySelectorAll('.fail').length;status.textContent=results.children.length+' checks, '+failed+' failures';document.title=failed+' failures - Header artwork';}
};
