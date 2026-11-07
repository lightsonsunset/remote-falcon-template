import {registry} from '../src/template-registry.js';
import {createPreview} from '../src/preview.js';
import {assetBase} from '../src/assets.js';
const frame=document.querySelector('#preview'),run=document.querySelector('#run'),results=document.querySelector('#results'),preview=createPreview(frame,()=>{});
const properties=['fontSize','lineHeight','color','fontWeight','textAlign','marginTop','marginRight','marginBottom','marginLeft'];
const check=(label,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS - ':'FAIL - ')+label;results.append(li);};
run.onclick=async()=>{run.disabled=true;results.replaceChildren();try{
 for(const t of registry){const source=await(await fetch('../'+t.source)).text();for(const theme of Object.keys(t.themes))for(const position of ['header','above-header','below-header']){
 const s=t.cloneDefaults(theme);Object.assign(s,{showWelcome:true,welcome:'Welcome to our light show.\nEnjoy the display with family and friends.',welcomeStyle:'card',welcomePosition:position,showMainGuidance:true,guidancePosition:'below-header',neighbourTitle:'Visitor guidance',neighbourText:'Please keep driveways clear.\nThank you for visiting.',headerArtwork:'classic',headerTopDecorations:true,showNameOnHome:true});
 await preview.update(t.render(source,s).replaceAll(assetBase,new URL('../assets/',import.meta.url).href),s,{air:true,mode:'jukebox',reset:true,templateId:t.id,landing:t.landing});const d=frame.contentDocument;await d.fonts.ready;await Promise.all([...d.images].map(i=>i.decode().catch(()=>{})));
 const welcome=d.querySelector('.welcome-message p'),guide=[...d.querySelectorAll('.visitor-guidance:not(.welcome-message) .neighbour-message')].find(e=>e.getBoundingClientRect().height>0),a=d.defaultView.getComputedStyle(welcome),b=d.defaultView.getComputedStyle(guide),ac=d.defaultView.getComputedStyle(welcome.parentElement),bc=d.defaultView.getComputedStyle(guide.parentElement),tag=t.id+' '+theme+' '+position;
 for(const p of properties)check(tag+' paragraph '+p,a[p]===b[p]);
 for(const p of properties)check(tag+' card '+p,ac[p]===bc[p]);

 }
 }
 }catch(e){check(e.stack,false);}finally{run.disabled=false;const fail=results.querySelectorAll('.fail').length;document.querySelector('#status').textContent=results.children.length+' checks, '+fail+' failures';}};