import {registry} from '../src/template-registry.js';
import {createPreview} from '../src/preview.js';
import {assetBase} from '../src/assets.js';
import {setHeaderArtwork} from '../src/header-artwork.js';
const frame=document.querySelector('#preview'),run=document.querySelector('#run'),results=document.querySelector('#results'),status=document.querySelector('#status');
const preview=createPreview(frame,()=>{}),positions=['header','above-header','below-header','status'],guidancePositions=['above-header','below-header','status'];
let checks;
const check=(label,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS - ':'FAIL - ')+label;checks.append(li);};
const texts={maximum:'A'.repeat(20000),blank:'',short:'Welcome to our show.',long:'Welcome to our light show. Choose a song, enjoy the display, and listen on your car radio or phone.\nPlease leave driveways clear, dim headlights, and keep music at a reasonable volume. Thank you for sharing the lights with us.\n'.repeat(4)};
const visible=e=>e.getClientRects().length&&e.getBoundingClientRect().height>0&&e.ownerDocument.defaultView.getComputedStyle(e).display!=='none';
const flow=e=>visible(e)&&!['absolute','fixed'].includes(e.ownerDocument.defaultView.getComputedStyle(e).position);
const rect=e=>e.getBoundingClientRect();
// These two aria-hidden decorations intentionally extend into Compact's outer gutter.
// Keep the strict content-width check, but do not count their harmless painted extent.
function contentScrollWidth(panel){
 const decoration=[...panel.querySelectorAll('.cc-lights[aria-hidden="true"],.cc-holly[aria-hidden="true"]')].map(el=>[el,el.getAttribute('style')]);
 try{for(const [el]of decoration)el.style.setProperty('display','none','important');return panel.scrollWidth;}
 finally{for(const [el,style]of decoration)if(style===null)el.removeAttribute('style');else el.setAttribute('style',style);}
}
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
 const expectedPosition=o.position??'header';
 const s=t.cloneDefaults(o.theme),air=o.state!=='off',mode=o.state==='voting'?'voting':'jukebox';
 Object.assign(s,{showWelcome:o.welcome!==false,welcome:texts[o.text||'long'],welcomeStyle:o.style,welcomePosition:o.position,showMainGuidance:o.guidance!==false,guidancePosition:o.guidePosition,logoMode:o.logo||'none',logo:assetBase+'christmas-header.webp',showNameOnHome:!!o.name,name:'Our personalised show name that can wrap across lines',neighbourTitle:'Please help us be a good neighbour',neighbourText:'Please leave driveways clear.\nKeep radios at a reasonable volume.\nDim headlights while stopped.\nEnjoy the display and thank you for visiting.\n'.repeat(2)});
 setHeaderArtwork(s,o.upper||'classic');const height=o.height||(o.width===320?500:836);frame.style.width=(o.rotate?390:o.width)+'px';frame.style.height=(o.rotate?844:height)+'px';
 const html=t.render(source,s),tag=[t.id,o.theme,o.width+'x'+height+(o.rotate?' rotated':''),o.surface,o.position,o.guidePosition,o.style,o.state,o.welcome===false?'welcome off':o.text||'long',o.guidance===false?'guidance off':'guidance on',o.upper||'classic',o.logo||'none',o.large?'large':'normal'].join(' ');status.textContent=tag;
 if(o.surface==='export')await exported(html,{air,mode});else await preview.update(html,s,{air,mode,reset:true,templateId:t.id,landing:t.landing});
 const d=frame.contentDocument,w=d.defaultView;if(o.large)d.documentElement.style.fontSize='24px';await d.fonts.ready;await Promise.all([...d.images].map(i=>i.decode().catch(()=>{})));if(o.rotate){frame.style.width=o.width+'px';frame.style.height=height+'px';await new Promise(r=>w.requestAnimationFrame(()=>w.requestAnimationFrame(r)));}
 const h=d.querySelector('.share-brand'),panel=h.parentElement,hr=rect(h),children=[...h.children].filter(flow),siblings=[...panel.children].filter(flow),index=siblings.indexOf(h),before=siblings[index-1],after=siblings[index+1];
 check(tag+' header contains its artwork and text',children.every(e=>rect(e).top>=hr.top-1&&rect(e).bottom<=hr.bottom+1));
 check(tag+' page blocks never overlap',siblings.every((e,i)=>!i||rect(siblings[i-1]).bottom<=rect(e).top+1));
 check(tag+' header clears preceding and following blocks',(!before||rect(before).bottom<=hr.top+1)&&(!after||rect(after).top>=hr.bottom-1));
 const art=h.querySelector('.header-artwork-picture');check(tag+' artwork reserves full height',!art||rect(art.querySelector('img')).bottom<=rect(art).bottom+1);
 check(tag+' header images load',[...h.querySelectorAll('img')].every(i=>i.naturalWidth>0));check(tag+' no horizontal text or page overflow',d.documentElement.scrollWidth<=o.width+1&&contentScrollWidth(panel)<=panel.clientWidth+1);
 const legacy=expectedPosition==='header'&&o.style==='plain',welcomes=legacy?[...h.querySelectorAll(':scope > p:not(.cc-eyebrow)')].filter(visible):[...panel.querySelectorAll('.welcome-message')].filter(visible),welcomeVisible=s.showWelcome&&!!s.welcome.trim()&&(expectedPosition!=='status'||air);
 check(tag+' welcome visibility respects choice and availability',welcomes.length===(welcomeVisible?1:0));
 const guides=[...panel.querySelectorAll('.visitor-guidance:not(.welcome-message),.neighbour-message')].filter(e=>visible(e)&&!e.closest('.welcome-message'));
 check(tag+' guidance visibility remains independent',(guides.length>0)===(air&&s.showMainGuidance));
 if(welcomeVisible){const welcome=welcomes[0],wr=rect(welcome);check(tag+' welcome reaches chosen position',expectedPosition==='header'?h.contains(welcome):expectedPosition==='above-header'?wr.bottom<=hr.top+1:expectedPosition==='below-header'?wr.top>=hr.bottom-1:!!welcome.closest('[\\{jukebox-dynamic-container\\}],[\\{playlist-voting-dynamic-container\\}]'));
  check(tag+' welcome never overlaps visitor guidance',guides.every(g=>{const gr=rect(g);return wr.bottom<=gr.top+1||gr.bottom<=wr.top+1||wr.right<=gr.left+1||gr.right<=wr.left+1;}));
  if(air&&s.showMainGuidance&&expectedPosition===o.guidePosition)check(tag+' shared slot puts welcome before guidance',guides.every(g=>wr.bottom<=rect(g).top+1));
  if(o.style==='card'&&air&&s.showMainGuidance&&o.guidePosition!=='status'){
   const card=guides.find(g=>g.classList.contains('visitor-guidance'));const a=w.getComputedStyle(welcome),b=w.getComputedStyle(card);check(tag+' welcome card matches guidance surface',['backgroundColor','borderTopColor','borderTopWidth','borderTopStyle','borderTopLeftRadius','paddingTop','paddingLeft'].every(k=>a[k]===b[k]));
  }
 }
 if(o.surface==='export')check(tag+' exported viewer contains no demo scripts',!d.querySelector('script,[data-demo-badges]'));
}
run.onclick=async()=>{run.disabled=true;results.replaceChildren();checks=document.createDocumentFragment();try{
 for(const t of registry){const source=await(await fetch('../'+t.source)).text();
 if(document.documentElement.hasAttribute('data-legacy-positions')){
  for(const theme of Object.keys(t.themes))for(const position of [undefined,'header'])for(const style of ['plain','card'])for(const welcome of [true,false])for(const [width,height] of [[320,500],[1024,768]])for(const surface of ['preview','export'])await inspect(t,source,{theme,position,guidePosition:'below-header',style,welcome,width,height,surface,state:'jukebox',name:true});
  continue;
 }
 if(document.documentElement.hasAttribute('data-reference-viewports')){
  for(const theme of Object.keys(t.themes))for(const position of positions)for(const style of ['plain','card'])for(const welcome of [true,false])for(const [width,height] of [[1280,800],[1024,768]])for(const surface of ['preview','export'])await inspect(t,source,{theme,position,guidePosition:'below-header',style,welcome,width,height,surface,state:'jukebox',name:true});
  continue;
 }
  for(const theme of Object.keys(t.themes))for(const position of positions)for(const guidePosition of guidancePositions)for(const style of ['plain','card'])for(const [width,height,rotate] of [[320,500,false],[390,836,false],[768,1024,false],[1024,768,false],[1280,836,false],[568,320,true],[844,390,true]])for(const surface of ['preview','export'])await inspect(t,source,{theme,position,guidePosition,style,width,height,rotate,surface,state:'jukebox'});
  for(const theme of Object.keys(t.themes))for(const position of positions)for(const guidePosition of guidancePositions)for(const [welcome,guidance] of [[true,true],[true,false],[false,true],[false,false]])for(const state of ['voting','off'])for(const surface of ['preview','export'])await inspect(t,source,{theme,position,guidePosition,style:'card',width:390,surface,state,welcome,guidance});
  for(const theme of Object.keys(t.themes))for(const position of positions)for(const style of ['plain','card'])for(const upper of ['none','theme'])for(const text of ['blank','short'])await inspect(t,source,{theme,position,guidePosition:'below-header',style,width:320,surface:'preview',state:'jukebox',upper,text,name:true});
  for(const theme of Object.keys(t.themes))for(const position of positions)for(const style of ['plain','card'])for(const surface of ['preview','export'])await inspect(t,source,{theme,position,guidePosition:'below-header',style,width:320,surface,state:'jukebox',text:'maximum',upper:'none',name:true});
  for(const theme of Object.keys(t.themes))for(const position of positions)for(const logo of ['none','seasonal','custom',t.features.headerIconMode])await inspect(t,source,{theme,position,guidePosition:'above-header',style:'card',width:320,surface:'preview',state:'jukebox',logo,name:true,large:true});
 }
}catch(error){check(error.stack,false);}finally{results.append(checks);run.disabled=false;const failed=results.querySelectorAll('.fail').length;status.textContent=results.children.length+' checks, '+failed+' failures';document.title=failed+' failures - Welcome placement';}
};
