import {registry} from '../src/template-registry.js';
import {createPreview} from '../src/preview.js';
const frame=document.querySelector('#preview'),run=document.querySelector('#run'),results=document.querySelector('#results'),adapter=createPreview(frame,()=>{});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS — ':'FAIL — ')+name;results.append(li);};
run.onclick=async()=>{run.disabled=true;results.replaceChildren();try{
 for(const t of registry){const source=await(await fetch('../'+t.source)).text();
  for(const season of Object.keys(t.themes))for(const mode of ['jukebox','voting'])for(const width of [320,390,1280]){
   const s=t.cloneDefaults(season);Object.assign(s,{categories:true,newFilter:true});
   frame.style.width=width+'px';frame.style.height='640px';
   await adapter.update(t.render(source,s),s,{air:true,mode,reset:true,templateId:t.id,landing:'music'});adapter.navigate('music');await wait(50);
   const d=frame.contentDocument,w=frame.contentWindow,compact=t.id==='compact-console',scroller=compact?d.scrollingElement:d.querySelector('#music-panel');
   const list=d.querySelector(mode==='voting'?'#voting_playlists_container':'#playlists_container');
   const filter=list.closest('.music-picker-section').querySelector('.music-filter');
   const label=t.name+' '+season+' '+mode+' '+width+'px';
   // A CSS fixture for RF's inline voting category display. This is not a live-service test.
   if(mode==='voting')list.querySelectorAll('.category-section').forEach(e=>e.style.display='block');
   // Bypass the preview's click listener so these exercise native fragment navigation.
   d.addEventListener('click',e=>{if(e.target.closest('.music-filter a'))e.stopImmediatePropagation();},true);
   scroller.scrollTo({top:scroller.scrollTop+filter.getBoundingClientRect().top-120,behavior:'instant'});await wait(80);
   check(label+': test begins scrolled',scroller.scrollTop>20);
   const visibleRows=()=>[...list.querySelectorAll(mode==='voting'?'.cell-vote-row':'.jukebox-list')].filter(e=>e.getBoundingClientRect().height);
   const gapsOK=()=>{const rows=visibleRows();return rows.length>1&&rows.slice(1).every((e,i)=>e.getBoundingClientRect().top-rows[i].getBoundingClientRect().bottom>=11.9);};
   if(compact)check(label+': All rows have a visible gap',gapsOK());
   for(const hash of ['#songs-category-1','#songs-category-2','#songs-new','#songs-all']){
    const before=scroller.scrollTop;filter.querySelector('a[href="'+hash+'"]').click();await wait(80);
    const expected=Math.min(before,scroller.scrollHeight-scroller.clientHeight);
    check(label+' '+hash+': native target without scroll jump ('+before+' → '+scroller.scrollTop+', expected '+expected+')',d.querySelector(':target')?.id===hash.slice(1)&&Math.abs(scroller.scrollTop-expected)<=1);
    if(compact)check(label+' '+hash+': visible row spacing',gapsOK());
   }
   w.history.back();await wait(120);check(label+': Back restores NEW filter',d.location.hash==='#songs-new');
   w.history.forward();await wait(120);check(label+': Forward restores All filter',d.location.hash==='#songs-all');
   check(label+': no horizontal overflow',d.documentElement.scrollWidth<=width+1);
  }
 }
}catch(e){check(e.stack,false);}finally{run.disabled=false;document.title=results.querySelectorAll('.fail').length+' failures · Category navigation checks';}};
