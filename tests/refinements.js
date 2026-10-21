import {registry} from '../src/template-registry.js';
import {createPreview} from '../src/preview.js';
import {setInformationCards,newInformationCard} from '../src/information-cards.js';
const frame=document.querySelector('#preview'),run=document.querySelector('#run'),results=document.querySelector('#results'),adapter=createPreview(frame,()=>{});
const visible=e=>!!e&&e.getClientRects().length>0;
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS — ':'FAIL — ')+name;results.append(li);};
run.onclick=async()=>{run.disabled=true;results.replaceChildren();try{
 for(const t of registry){const source=await(await fetch('../'+t.source)).text();
 for(const theme of ['christmas','halloween'])for(const width of [320,390,1440]){
  const s=t.cloneDefaults(theme);s.showMainGuidance=true;s.showMenuLabels=false;s.homeCard=true;s.logoMode=t.features.headerIconMode;s.icons.brand='crow';s.neighbourTitle='Visitor guidance';s.neighbourText='Please keep driveways clear.';
  setInformationCards(s,Array.from({length:5},(_,i)=>({...newInformationCard(),title:'Card '+i,text:'A little information for visitors.',image:i%2?'https://lightsonsunset.github.io/remote-falcon-template/assets/christmas-header.webp':''})));
  // Image geometry is checked without depending on external image hosting.
  frame.style.width=width+'px';frame.style.height='844px';
  for(const mode of ['jukebox','voting'])for(const position of ['above-header','below-header','status'])for(const air of [true,false]){
   s.guidancePosition=position;await adapter.update(t.render(source,s),s,{air,mode,templateId:t.id,landing:t.landing,startAtLanding:true});const d=frame.contentDocument,main=d.getElementById(t.landing+'-panel'),header=main.querySelector('.share-brand');
   const guidance=[...main.querySelectorAll('.rf-titles')].filter(el=>el.textContent==='Visitor guidance'&&visible(el));const label=[t.id,theme,width,mode,position,air?'on':'off'].join(' ');
   check(label+' guidance visibility',guidance.length===(air?1:0));
   if(air){const g=guidance[0],isBefore=!!(g.compareDocumentPosition(header)&Node.DOCUMENT_POSITION_FOLLOWING);check(label+' position',position==='above-header'?isBefore:!isBefore);if(position==='status')check(label+' beneath status',!!(main.querySelector('.show-status--live').compareDocumentPosition(g)&Node.DOCUMENT_POSITION_FOLLOWING));}
   check(label+' no horizontal overflow',d.documentElement.scrollWidth<=width+1);
   const icon=main.ownerDocument.querySelector('[data-tab-target="music"] i');check(label+' icons-only size and accessible label',getComputedStyle(icon).fontSize==='24px'&&icon.parentElement.getAttribute('aria-label')&&icon.parentElement.getBoundingClientRect().height>=44);
  }
  adapter.navigate(t.features.extraInformationPage.toLowerCase());await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));let d=frame.contentDocument;
  const cards=[...d.querySelectorAll('.home-extra')];check(t.id+' '+theme+' '+width+' five visible cards',cards.length===5&&cards.every(visible));
  check(t.id+' '+width+' image squares and text width',cards.every((card,i)=>i%2?card.querySelector('.extra-info-image').getBoundingClientRect().width===64:!card.querySelector('.extra-info-content')));
  const field=document.createElement('input');field.value='Editor field';field.setAttribute('aria-label','Scroll preservation check');frame.before(field);
  const gap=document.createElement('div');gap.style.height='500px';frame.before(gap);
  frame.contentWindow.location.hash='#info-listening';await new Promise(r=>setTimeout(r,450));
  frame.contentWindow.scrollTo({top:100,behavior:'instant'});frame.contentDocument.getElementById('info-panel').scrollTo({top:80,behavior:'instant'});
  field.focus({preventScroll:true});field.setSelectionRange(3,6);window.scrollTo({top:150,behavior:'instant'});
  const outerY=scrollY,frameY=frame.contentWindow.scrollY,panelY=frame.contentDocument.getElementById('info-panel').scrollTop;
  s.name+=' updated';await adapter.update(t.render(source,s),s,{air:false,mode:'voting',templateId:t.id,landing:t.landing});
  check(t.id+' '+width+' outer scroll and field caret retained',scrollY===outerY&&document.activeElement===field&&field.selectionStart===3&&field.selectionEnd===6);
  check(t.id+' '+width+' nested page and both scroll containers retained',frame.contentWindow.location.hash==='#info-listening'&&frame.contentWindow.scrollY===frameY&&frame.contentDocument.getElementById('info-panel').scrollTop===panelY);
  const first=adapter.update(t.render(source,s),s,{air:false,mode:'voting',templateId:t.id,landing:t.landing});
  await new Promise(r=>setTimeout(r,5));s.welcome+=' changed';const second=adapter.update(t.render(source,s),s,{air:false,mode:'voting',templateId:t.id,landing:t.landing});await Promise.all([first,second]);
  check(t.id+' '+width+' overlapping edits retain page and scroll',frame.contentWindow.location.hash==='#info-listening'&&frame.contentWindow.scrollY===frameY&&frame.contentDocument.getElementById('info-panel').scrollTop===panelY&&scrollY===outerY);
  s.fm=true;await adapter.update(t.render(source,s),s,{air:true,mode:'jukebox',templateId:t.id,landing:t.landing});
  // In-frame links must move the viewer, never its surrounding editor/scrollers.
  const navigationChecks=[],bounds=()=>[scrollX,scrollY,frame.getBoundingClientRect().top];
  for(const panel of ['music','support','info','music']){
   const before=bounds();frame.contentDocument.querySelector('[data-tab-target="'+panel+'"]').click();
   await new Promise(r=>setTimeout(r,120));
   navigationChecks.push([panel,frame.contentWindow.location.hash==='#'+panel+'-panel'&&bounds().every((n,i)=>Math.abs(n-before[i])<1)]);
  }
  const nested=frame.contentDocument.querySelector('a[href="#info-listening"]');
  const beforeNested=bounds();nested.click();await new Promise(r=>setTimeout(r,120));
  navigationChecks.push(['listening link',frame.contentWindow.location.hash==='#info-listening'&&bounds().every((n,i)=>Math.abs(n-beforeNested[i])<1)]);
  for(const [panel,ok] of navigationChecks)check(t.id+' '+theme+' '+width+' '+panel+' link preserves editor viewport',ok);
  adapter.navigate('music');await new Promise(r=>setTimeout(r,80));frame.contentDocument.querySelector('[data-tab-target="info"]').click();await new Promise(r=>setTimeout(r,80));
  const beforeBack=bounds();frame.contentWindow.history.back();await new Promise(r=>setTimeout(r,120));check(t.id+' '+width+' Back retains preview navigation without moving editor',frame.contentWindow.location.hash==='#music-panel'&&bounds().every((n,i)=>Math.abs(n-beforeBack[i])<1));
  const beforeForward=bounds();frame.contentWindow.history.forward();await new Promise(r=>setTimeout(r,120));check(t.id+' '+width+' Forward retains preview navigation without moving editor',frame.contentWindow.location.hash==='#info-panel'&&bounds().every((n,i)=>Math.abs(n-beforeForward[i])<1));
  field.remove();gap.remove();
  s.neighbourTitle='';s.neighbourText='';await adapter.update(t.render(source,s),s,{air:true,mode:'jukebox',templateId:t.id,landing:t.landing,startAtLanding:true});check(t.id+' '+width+' empty guidance removed',!frame.contentDocument.querySelector('.visitor-guidance'));
 }
 }
}catch(error){check(error.stack,false);}finally{run.disabled=false;document.title=results.querySelectorAll('.fail').length+' failures · Shared refinements';}};
