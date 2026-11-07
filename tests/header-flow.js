import {registry} from '../src/template-registry.js';
import {createPreview} from '../src/preview.js';
import {assetBase} from '../src/assets.js';
import {setHeaderArtwork} from '../src/header-artwork.js';
const frame=document.querySelector('#preview'),run=document.querySelector('#run'),results=document.querySelector('#results'),status=document.querySelector('#status');
const preview=createPreview(frame,()=>{});
const check=(label,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS - ':'FAIL - ')+label;results.append(li);};
const texts={blank:'',short:'Welcome to our show.',long:'Welcome to our light show. Choose a song, enjoy the display, and listen on your car radio or phone. Please keep driveways clear, dim headlights, and keep music at a reasonable volume. Thank you for sharing the lights with us. '.repeat(4)};
const visible=e=>e.getClientRects().length&&e.getBoundingClientRect().height>0&&e.ownerDocument.defaultView.getComputedStyle(e).display!=='none';
async function exported(html,{air,mode}){
 const doc=new DOMParser().parseFromString(html.replaceAll(assetBase,new URL('../assets/',import.meta.url).href),'text/html');
 for(const el of doc.querySelectorAll('*')){
  if(el.hasAttribute('{after-hours-message}')&&air)el.replaceChildren();
  if(el.hasAttribute('{jukebox-dynamic-container}')&&(!air||mode!=='jukebox'))el.replaceChildren();
  if(el.hasAttribute('{playlist-voting-dynamic-container}')&&(!air||mode!=='voting'))el.replaceChildren();
  if(el.hasAttribute('{location-code-dynamic-container}'))el.replaceChildren();
 }
 await new Promise(resolve=>{frame.onload=resolve;frame.srcdoc='<!doctype html>'+doc.documentElement.outerHTML;});
}
async function inspect(t,source,o){
 const s=t.cloneDefaults(o.theme||'christmas'),air=o.state!=='off',mode=o.state==='voting'?'voting':'jukebox';
 Object.assign(s,{welcome:texts[o.text||'long'],showMainGuidance:o.guidance!==false,guidancePosition:o.position||'below-header',logoMode:o.logo||'none',logo:assetBase+'christmas-header.webp',showNameOnHome:!!o.name,name:'A personalised show name that can wrap across lines',neighbourTitle:'Please help us be a good neighbour',neighbourText:'Please leave driveways clear.\nKeep radios at a reasonable volume.\nDim headlights while stopped.\nEnjoy the display and thank you for visiting.'.repeat(2)});
 setHeaderArtwork(s,o.upper||'classic');
 frame.style.width=o.width+'px';frame.style.height=(o.width===320?500:836)+'px';
 const html=t.render(source,s),tag=[t.id,o.theme||'christmas',o.width,o.surface||'preview',o.position||'below-header',o.text||'long',o.state||'jukebox',o.upper||'classic',o.logo||'none',o.large?'large':'normal'].join(' ');
 status.textContent=tag;
 if(o.surface==='export')await exported(html,{air,mode});
 else await preview.update(html,s,{air,mode,reset:true,templateId:t.id,landing:t.landing});
 const d=frame.contentDocument,w=d.defaultView;if(o.large)d.documentElement.style.fontSize='24px';
 await d.fonts.ready;await Promise.all([...d.images].map(i=>i.decode().catch(()=>{})));
 const h=d.querySelector('.share-brand'),r=h.getBoundingClientRect(),children=[...h.children].filter(e=>visible(e)&&!['absolute','fixed'].includes(w.getComputedStyle(e).position)),siblings=[...h.parentElement.children].filter(visible),index=siblings.indexOf(h),before=siblings[index-1],after=siblings[index+1];
 check(tag+' header contains all visible text and identity',children.every(e=>{const b=e.getBoundingClientRect();return b.top>=r.top-1&&b.bottom<=r.bottom+1;}));
 check(tag+' preceding content stays above header',!before||before.getBoundingClientRect().bottom<=r.top+1);
 check(tag+' following content stays below header',!after||after.getBoundingClientRect().top>=r.bottom-1);
 const art=h.querySelector('.header-artwork-picture');
 check(tag+' artwork reserves its full image height',!art||art.querySelector('img').getBoundingClientRect().bottom<=art.getBoundingClientRect().bottom+1);
 check(tag+' artwork and logo load',[...h.querySelectorAll('img')].every(i=>i.naturalWidth>0));
 check(tag+' no horizontal overflow',d.documentElement.scrollWidth<=o.width+1);
 const guidance=[...h.parentElement.querySelectorAll('.visitor-guidance,.neighbour-message')].filter(visible);
 check(tag+' main guidance follows availability and visibility',guidance.length>0===(air&&s.showMainGuidance));
 if(air&&s.showMainGuidance&&s.guidancePosition!=='status')check(tag+' guidance stays on chosen side',guidance.every(e=>s.guidancePosition==='above-header'?e.getBoundingClientRect().bottom<=r.top+1:e.getBoundingClientRect().top>=r.bottom-1));
 if(o.surface==='export')check(tag+' exported frame has no demo adapter or scripts',!d.querySelector('script,[data-demo-badges]'));
}
run.onclick=async()=>{run.disabled=true;results.replaceChildren();try{
 for(const t of registry){const source=await(await fetch('../'+t.source)).text();
  // Reproduce the original compressed-header case with each guidance placement,
  // including no welcome text, and with both native live modes and off air.
  for(const theme of ['christmas','halloween'])for(const position of ['above-header','below-header','status'])for(const text of ['blank','short','long'])for(const width of [320,390,1280])for(const state of ['jukebox','voting','off'])for(const surface of ['preview','export'])await inspect(t,source,{theme,position,text,width,state,surface});
  // Keep all theme/artwork choices, independent logos, and hidden guidance safe.
  for(const theme of Object.keys(t.themes))for(const upper of ['theme','classic','lights','crest','none'])for(const width of [320,390,1280])await inspect(t,source,{theme,upper,width});
  for(const logo of ['none','seasonal','custom',t.features.headerIconMode])for(const width of [320,390,1280])await inspect(t,source,{logo,width,name:true,large:true});
  for(const position of ['above-header','below-header','status'])await inspect(t,source,{position,width:320,guidance:false});
 }
}catch(error){check(error.stack,false);}finally{run.disabled=false;const failed=results.querySelectorAll('.fail').length;status.textContent=results.children.length+' checks, '+failed+' failures';document.title=failed+' failures - Header flow';}
};
