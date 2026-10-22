import {registry} from '../src/template-registry.js';
import {createPreview} from '../src/preview.js';
const frame=document.querySelector('#preview'),results=document.querySelector('#results'),status=document.querySelector('#status'),preview=createPreview(frame,()=>{});
const sources=new Map(await Promise.all(registry.map(async t=>[t.id,await(await fetch('../'+t.source)).text()])));
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS - ':'FAIL - ')+name;results.append(li);};
async function show(t,s,mode,width,catalogue=null){frame.style.width=width+'px';frame.style.height='844px';await preview.update(t.render(sources.get(t.id),s),s,{mode,air:true,reset:true,templateId:t.id,landing:t.landing,catalogue});preview.navigate('music');await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return frame.contentDocument;}
document.querySelector('#run').onclick=async()=>{const run=document.querySelector('#run');run.disabled=true;results.replaceChildren();try{
 for(const t of registry)for(const theme of Object.keys(t.themes))for(const mode of ['jukebox','voting']){
  const s=t.cloneDefaults(theme),before=JSON.stringify(s),html=t.render(sources.get(t.id),s),titles=t.themes[theme].demoSongs;
  for(const width of [320,390,1280]){
   const d=await show(t,s,mode,width),w=d.defaultView,cards=[...d.querySelectorAll('.los-song-list [data-key]')],card=i=>cards.find(c=>c.dataset.key===titles[i]),css=(i,pseudo)=>w.getComputedStyle(card(i),pseudo),tag=[t.id,theme,mode,width].join(' ');
   check(tag+' exactly three moving-badge examples',d.querySelectorAll('[data-demo-moving]').length===3);
   check(tag+' NEW-only example retained',css(0).getPropertyValue('--los-new-sash').trim()==='"NEW"'&&!css(0,'::after').content.includes('Moving spotlights'));
   check(tag+' combined NEW and moving badge',css(1,'::after').content.includes('Moving spotlights')&&css(1).getPropertyValue('--los-new-sash').trim()==='"NEW"');
   check(tag+' static moving badge without NEW',css(3,'::after').content.includes('Moving spotlights')&&css(3).getPropertyValue('--los-new-sash').trim()!=='"NEW"'&&css(3,'::after').backgroundImage==='none');
   check(tag+' animated example has fixture and wash',css(5,'::after').content.includes('Moving spotlights')&&css(5,'::after').backgroundImage.includes('data:image/svg+xml')&&css(5).backgroundImage.includes('data:image/svg+xml'));
   check(tag+' other moving example is static',css(1,'::after').backgroundImage==='none');
   check(tag+' cards fit and remain actionable',d.documentElement.scrollWidth<=width+1&&[1,3,5].every(i=>card(i).getAttribute('role')==='button'&&card(i).getAttribute('aria-disabled')==='false'));
   check(tag+' settings remain unchanged',JSON.stringify(s)===before);
  }
  const catalogue={songs:[1,3,5].map(i=>({name:titles[i],displayName:titles[i],artist:'',category:s.categoryNames[0],imageUrl:''}))};
  const d=await show(t,s,mode,390,catalogue),cards=[...d.querySelectorAll('.los-song-list [data-key]')];
  check(t.id+' '+theme+' '+mode+' imported names get no sample badges',!d.querySelector('[data-demo-moving],style[data-demo-badges]')&&cards.every(c=>!d.defaultView.getComputedStyle(c,'::after').content.includes('Moving spotlights')));
  check(t.id+' '+theme+' '+mode+' samples never enter exports',t.render(sources.get(t.id),s)===html&&!/data-demo-moving|data-demo-badges/.test(html)&&titles.every(title=>!html.includes(title)));
 }
}catch(error){check(error.stack,false);}finally{run.disabled=false;status.textContent=results.querySelectorAll('.pass').length+' passed; '+results.querySelectorAll('.fail').length+' failed';}};
document.querySelector('#review').onclick=async()=>{const t=registry.find(t=>t.id==='compact-console'),d=await show(t,t.cloneDefaults('christmas'),'jukebox',390);d.querySelector('.los-song-list').scrollIntoView({block:'start'});};
