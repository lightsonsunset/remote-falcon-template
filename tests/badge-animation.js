import {registry} from '../src/template-registry.js';
const frame=document.querySelector('#preview'),run=document.querySelector('#run'),status=document.querySelector('#status'),results=document.querySelector('#results');
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS - ':'FAIL - ')+name;results.append(li);};
const artwork='<img alt="" src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 48 48%22%3E%3Crect width=%2248%22 height=%2248%22 fill=%22%23999%22/%3E%3C/svg%3E">';
const rows=[['both','Short title',''],['moving','A long song title that needs to wrap comfortably on a narrow phone','Layout artist'],['plain','Ordinary song','Layout artist']];
run.onclick=async()=>{run.disabled=true;results.replaceChildren();try{
 for(const t of registry){const source=await(await fetch('../'+t.source)).text();
 for(const theme of Object.keys(t.themes))for(const width of [320,390,1280])for(const art of ['album','category','none'])for(const mode of ['jukebox','voting']){
  let before;
  for(const enabled of [false,true]){
   const s={...t.cloneDefaults(theme),movingHeadAnimation:enabled,movingHeadNames:'both\nmoving',newNames:'both',songArtwork:art};
   const custom=width===1280&&art==='none';
   if(custom){s.colours={...s.colours,gold:'#a9e4fa',card:'#203549',text:'#f5f9fc'};if(t.id==='compact-console')s.advancedColours=true;}
   const doc=new DOMParser().parseFromString(t.render(source,s),'text/html'),flags=doc.getElementById('show-options').className;
   const cards=rows.map(([id,title,artist])=>{const cell='<div class="'+(mode==='jukebox'?'jukebox-list':'cell-vote-playlist')+'" data-key="'+id+'">'+(id==='both'?'':artwork)+title+(artist?'<div class="'+(mode==='jukebox'?'jukebox-list-artist':'cell-vote-playlist-artist')+'">'+artist+'</div>':'')+'</div>';return mode==='jukebox'?cell:'<div class="cell-vote-row" style="display:flex;width:100%;align-items:flex-end">'+cell+'<div class="cell-vote">12</div></div>';}).join('');
   doc.body.innerHTML='<div id="show-options" class="'+flags+'"><section id="music-panel" class="content__body" style="display:block;visibility:visible;max-width:680px;margin:auto"><div class="los-song-list"><div class="category-section">'+cards+'</div></div></section></div>';
   frame.style.width=width+'px';frame.style.height='600px';await new Promise(resolve=>{frame.onload=resolve;frame.srcdoc='<!doctype html>'+doc.documentElement.outerHTML;});
   const d=frame.contentDocument,w=frame.contentWindow,items=[...d.querySelectorAll('[data-key]')],sizes=items.map(el=>[el.getBoundingClientRect().width,el.getBoundingClientRect().height]),tag=[t.id,theme,width,art,mode,enabled].join(' ');
   check(tag+' no horizontal overflow',d.documentElement.scrollWidth<=width+1);
   check(tag+' badge text remains separate from NEW',w.getComputedStyle(items[0],'::after').content.includes('Moving spotlights'));
   check(tag+' unmarked song has no fixture',!w.getComputedStyle(items[2],'::after').backgroundImage.includes('data:image/svg+xml'));
   if(!enabled)before=sizes;else{
    check(tag+' card dimensions unchanged',sizes.every((size,i)=>size.every((n,j)=>Math.abs(n-before[i][j])<1)));
    check(tag+' marked cards have fixture',items.slice(0,2).every(el=>w.getComputedStyle(el,'::after').backgroundImage.includes('data:image/svg+xml')));
    check(tag+' decoration never captures taps',items.slice(0,2).every(el=>w.getComputedStyle(el,'::after').pointerEvents==='none'));
    if(custom){
     check(tag+' personalised accent remains on badge',w.getComputedStyle(items[1],'::after').backgroundColor==='rgb(169, 228, 250)');
     check(tag+' fixture and wash use personalised accent',decodeURIComponent(w.getComputedStyle(items[1]).backgroundImage).includes('#a9e4fa')&&decodeURIComponent(w.getComputedStyle(items[1],'::after').backgroundImage).includes('#a9e4fa'));
    }
    // Exercise the emitted reduced-motion rules in this pure CSS fixture too.
    for(const sheet of [...d.styleSheets]){let rules;try{rules=sheet.cssRules;}catch{continue;}for(let i=rules.length-1;i>=0;i--){const rule=rules[i];if(rule.conditionText==='(prefers-reduced-motion: reduce)'){const css=[...rule.cssRules].map(r=>r.cssText).join('\n');sheet.deleteRule(i);sheet.insertRule('@media all{'+css+'}',i);}}}
    check(tag+' reduced motion removes the card wash',w.getComputedStyle(items[1]).getPropertyValue('--los-moving-wash').trim()==='none');
   }
   status.textContent=tag;
  }
 }
 }
}catch(error){check(error.stack,false);}finally{run.disabled=false;status.textContent=results.querySelectorAll('.pass').length+' passed; '+results.querySelectorAll('.fail').length+' failed';document.title=results.querySelectorAll('.fail').length+' failures - Badge animation';}};
