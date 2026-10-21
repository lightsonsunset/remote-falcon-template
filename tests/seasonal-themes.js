import {registry} from '../src/template-registry.js';
import {createPreview} from '../src/preview.js';
import {assetBase,logoChoices} from '../src/assets.js';
const frame=document.querySelector('#preview'),run=document.querySelector('#run'),results=document.querySelector('#results'),preview=createPreview(frame,()=>{});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const visible=e=>!!e&&e.getClientRects().length>0;
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS — ':'FAIL — ')+name;results.append(li);};
run.onclick=async()=>{run.disabled=true;results.replaceChildren();try{
 for(const t of registry){const source=await(await fetch('../'+t.source)).text();
 for(const theme of ['thanksgiving','australia-day'])for(const width of [320,390,768,1440])for(const mode of ['jukebox','voting'])for(const air of [true,false]){
  const s=t.cloneDefaults(theme),label=t.name+' '+theme+' '+width+' '+mode+' '+air;
  frame.style.width=width+'px';frame.style.height='844px';
  await preview.update(t.render(source,s),s,{air,mode,reset:true,templateId:t.id,landing:t.landing});
  const d=frame.contentDocument;await d.fonts.ready;await wait(40);
  check(label+': fits viewport',d.documentElement.scrollWidth<=d.documentElement.clientWidth+1);
  check(label+': no unsupported countdown',!d.querySelector('.seasonal-countdown'));
  check(label+': header has clear text area',d.querySelector('.share-brand h1').getBoundingClientRect().top>=d.querySelector('.share-brand').getBoundingClientRect().top+80);
  check(label+': decorative layer cannot intercept taps',d.defaultView.getComputedStyle(d.querySelector('.season-header-art')).pointerEvents==='none');
  check(label+': artwork loads',[...d.querySelectorAll('.season-header-art img')].every(i=>i.complete&&i.naturalWidth>0));
  if(theme==='thanksgiving'){
   const layer=d.querySelector('.season-drift'),w=d.defaultView,rect=layer.getBoundingClientRect(),leaves=[...layer.children].filter(visible);
   check(label+': leaves cover the viewport',w.getComputedStyle(layer).position==='fixed'&&Math.abs(rect.height-w.innerHeight)<1&&Math.abs(rect.top)<1);
   check(label+': balanced leaf count',leaves.length===(width<=600?8:12));
   check(label+': leaves never intercept taps',[layer,...leaves].every(e=>w.getComputedStyle(e).pointerEvents==='none'));
   check(label+': leaves load',leaves.every(e=>e.complete&&e.naturalWidth>0));
   const leaf=leaves[0],animation=leaf.getAnimations()[0],timing=animation.effect.getTiming();animation.pause();animation.currentTime=Number(timing.duration)*.8+Number(timing.delay);
   await wait(20);check(label+': leaves reach the lower screen',leaf.getBoundingClientRect().top>w.innerHeight*.65);
   check(label+': request messages stay above leaves',Number(w.getComputedStyle(layer).zIndex)<2147483000);
  }
  const before=[...d.querySelectorAll('.los-menu__item')].filter(visible).map(e=>{const r=e.getBoundingClientRect();return [r.x,r.width,r.y];});
  for(const panel of ['support','info','music']){d.querySelector('[data-tab-target="'+panel+'"]').click();await wait(30);
   const after=[...d.querySelectorAll('.los-menu__item')].filter(visible).map(e=>{const r=e.getBoundingClientRect();return [r.x,r.width,r.y];});
   check(label+': stable navbar '+panel,after.every((r,i)=>r.every((n,j)=>Math.abs(n-before[i][j])<1)));
   check(label+': selected '+panel+' visible',visible(d.querySelector('#'+panel+'-panel')));
  }
  check(label+': song controls follow air state',[...d.querySelectorAll('.los-song-list')].some(visible)===air);
 }
 for(const theme of ['thanksgiving','australia-day'])for(const width of [320,390]){
  const s=t.cloneDefaults(theme);frame.style.width=width+'px';s.logoMode='custom';s.logo=assetBase+'christmas-header.webp';s.showMenuLabels=false;s.flagPlacement='edges';
  await preview.update(t.render(source,s),s,{air:true,mode:'jukebox',reset:true,templateId:t.id,landing:t.landing});await frame.contentDocument.fonts.ready;await wait(40);let d=frame.contentDocument,label=t.name+' '+theme+' custom logo '+width;
  const logo=d.querySelector('.show-logo'),box=logo.getBoundingClientRect(),header=d.querySelector('.share-brand').getBoundingClientRect();
  check(label+': custom image contained',box.width<=width&&box.left>=0&&box.right<=width&&box.top>=header.top+80);
  check(label+': custom logo keeps clear central space',box.left>=header.left+24&&box.right<=header.right-24&&d.defaultView.getComputedStyle(d.querySelector('.season-header-frame')).opacity==='0.55');
  check(label+': icon-only nav fits',d.documentElement.scrollWidth<=d.documentElement.clientWidth+1);
  if(theme==='australia-day'){check(label+': no falling flags even with old edge setting',!d.querySelector('.season-drift'));check(label+': bunting sways in the header',d.defaultView.getComputedStyle(d.querySelector('.season-header-frame'),'::before').animationName==='season-bunting');}
  s.seasonalMotion=false;await preview.update(t.render(source,s),s,{air:true,mode:'jukebox',templateId:t.id,landing:t.landing});check(label+': motion off',!frame.contentDocument.querySelector('.season-drift'));if(theme==='australia-day')check(label+': bunting stops',frame.contentWindow.getComputedStyle(frame.contentDocument.querySelector('.season-header-frame'),'::before').animationName==='none');
  s.headerTopDecorations=false;s.headerBottomDecorations=false;s.navbarDetails=false;await preview.update(t.render(source,s),s,{air:true,mode:'jukebox',templateId:t.id,landing:t.landing});d=frame.contentDocument;
  check(label+': plain header and navbar',!d.querySelector('.season-header-art')&&!d.querySelector('#show-options').classList.contains('season-navbar-on'));
 }
 for(const theme of ['thanksgiving','australia-day'])for(const width of [320,390,1280])for(const custom of [false,true])for(const top of [false,true])for(const bottom of [false,true]){
  const s=t.cloneDefaults(theme);s.headerTopDecorations=top;s.headerBottomDecorations=bottom;
  if(custom){s.logoMode='custom';s.logo=assetBase+'christmas-header.webp';}
  frame.style.width=width+'px';await preview.update(t.render(source,s),s,{air:true,mode:'jukebox',startAtLanding:true,templateId:t.id,landing:t.landing});
  const d=frame.contentDocument,w=d.defaultView;await d.fonts.ready;await wait(20);
  const label=t.name+' '+theme+' '+width+' '+(custom?'logo':'name')+' top '+top+' bottom '+bottom,art=d.querySelector('.season-header-frame'),header=d.querySelector('.share-brand'),style=w.getComputedStyle(header);
  check(label+': top artwork independently visible',!!art&&w.getComputedStyle(art,'::before').display!=='none'?top:!top);
  check(label+': lower artwork independently visible',!!art&&w.getComputedStyle(art,'::after').display!=='none'?bottom:!bottom);
  check(label+': top space follows choice',top?parseFloat(style.paddingTop)>=80:parseFloat(style.paddingTop)<=36);
  check(label+': bottom space follows choice',bottom?parseFloat(style.paddingBottom)>=80:parseFloat(style.paddingBottom)<=28);
  check(label+': all artwork absent when both off',top||bottom?!!art:!art&&!d.querySelector('.season-header-source'));
  check(label+': falling leaves independent of header artwork',!!d.querySelector('.season-drift')===(theme==='thanksgiving'));
  check(label+': fits screen',d.documentElement.scrollWidth<=d.documentElement.clientWidth+1);
 }
 if(t.features.includedArtwork)for(const theme of ['thanksgiving','australia-day'])for(const choice of logoChoices[theme]){
  const s=t.cloneDefaults(theme);s.logoMode='seasonal';s.logoStyle=choice.id;s.combineLogoName=true;frame.style.width='320px';await preview.update(t.render(source,s),s,{air:true,mode:'jukebox',reset:true,templateId:t.id,landing:t.landing});await wait(60);const d=frame.contentDocument;
  check(theme+' included '+choice.id+': logo loads and fits',[...d.querySelectorAll('.share-brand img')].filter(visible).every(i=>i.complete&&i.naturalWidth>0)&&d.documentElement.scrollWidth<=d.documentElement.clientWidth+1);
 }
 }
}catch(error){check(error.stack,false);}finally{run.disabled=false;document.title=results.querySelectorAll('.fail').length+' failures · Seasonal theme checks';}};
