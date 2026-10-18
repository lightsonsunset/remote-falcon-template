import {registry} from '../src/template-registry.js';
import {iconGlyphs} from '../src/icons.js';
const frame=document.querySelector('#preview'),run=document.querySelector('#run'),results=document.querySelector('#results'),status=document.querySelector('#status');
const visible=e=>!!e&&e.getBoundingClientRect().height>0&&e.getBoundingClientRect().width>0;
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS — ':'FAIL — ')+name;results.append(li);};
const wait=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
const image='<img class="sequence-image" alt="" src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22%3E%3Crect width=%2264%22 height=%2264%22 fill=%22%23999%22/%3E%3C/svg%3E">';
function song(mode,name,{grouped=false,art=false,unavailable=false}={}){
 const cls=mode==='jukebox'?'jukebox-list':'cell-vote-playlist';
 const card='<div class="'+cls+(unavailable?' sequence-unavailable':'')+'" data-key="'+name+'">'+(art?image:'')+(unavailable?'<span>'+name+'</span>':name)+(art?'<div class="'+cls+'-artist">Layout artist</div>':'')+(unavailable?'<span class="sequence-unavailable-hint">Back next show</span>':'')+'</div>';
 return mode==='jukebox'?card:grouped?'<div class="cell-vote-row" style="display:flex;width:100%;align-items:flex-end">'+card+'<div class="cell-vote">2</div></div>':card+'<div class="cell-vote">2</div>';
}
run.onclick=async()=>{run.disabled=true;results.replaceChildren();try{
 for(const t of registry){const source=await(await fetch('../'+t.source)).text();
 for(const theme of ['christmas','halloween'])for(const width of [320,390,1280])for(const mode of ['jukebox','voting'])for(const art of ['album','category','none']){
  const s={...t.cloneDefaults(theme),categories:true,uncategorisedIcon:'ghost',movingHeadNames:'Uncategorised new\nNamed new\nNamed old',newFilter:true,newNames:'Uncategorised new\nNamed new\nNew only',songArtwork:art,categoryNames:['First','Second'],categoryIcons:{First:'tree',Second:'snowman'}};
  const d=new DOMParser().parseFromString(t.render(source,s),'text/html'),flags=d.getElementById('show-options').className;
  const base=d.createElement('base');base.href='about:srcdoc';d.head.prepend(base);
  d.body.innerHTML='<div id="show-options" class="'+flags+'"></div><section id="music-panel" class="content__body" style="display:block;max-width:680px;margin:auto"><div class="music-filter-targets"><span id="songs-all"></span><span class="category-filter-target" id="songs-category-1"></span><span class="category-filter-target" id="songs-category-2"></span><span id="songs-new"></span></div><div class="music-filter"><a href="#songs-all">All</a><a href="#songs-category-1">First</a><a href="#songs-category-2">Second</a><a href="#songs-new">NEW</a></div><div class="los-song-list">'+song(mode,'Uncategorised new',{art:true})+song(mode,'Uncategorised old',{unavailable:true})+'<div class="category-section" style="width:100%;display:flex;flex-wrap:wrap"><div class="category-label">First</div>'+song(mode,'Named new',{grouped:true})+'</div><div class="category-section" style="width:100%;display:flex;flex-wrap:wrap"><div class="category-label">Second</div>'+song(mode,'Named old',{grouped:true,art:true})+song(mode,'New only',{grouped:true,unavailable:true})+'</div></div></section>';
  frame.style.width=width+'px';frame.style.height='844px';await new Promise(resolve=>{frame.onload=resolve;frame.srcdoc='<!doctype html>'+d.documentElement.outerHTML;});
  const doc=frame.contentDocument,w=frame.contentWindow,list=doc.querySelector('.los-song-list'),tag=[t.id,theme,width,mode,art].join(' '),cards=[...list.querySelectorAll('.jukebox-list,.cell-vote-playlist')];
  const current=()=>cards.filter(visible).map(c=>c.dataset.key);
  check(tag+' All includes every song',current().length===5);
  check(tag+' no horizontal overflow',doc.documentElement.scrollWidth<=width+1);
  check(tag+' artwork is independent of categories',cards.every(c=>visible(c.querySelector('img'))===(art==='album'&&!!c.querySelector('img'))));
  if(art==='category')check(tag+' chosen fallback and named icons map correctly',cards.every((c,i)=>w.getComputedStyle(c,'::before').content.includes(String.fromCodePoint(parseInt(iconGlyphs[i<2?'ghost':i===2?'tree':'snowman'],16)))));
  check(tag+' unavailable hint retained',visible(doc.querySelector('.sequence-unavailable-hint')));
  check(tag+' uncategorised NEW badge',w.getComputedStyle(cards[0],'::after').content.includes('Moving spotlights')&&w.getComputedStyle(cards[0]).backgroundImage.includes('data:image/svg+xml'));
  check(tag+' Moving spotlights badge on named old song',w.getComputedStyle(cards[3],'::after').content.startsWith('"Moving spotlights"')&&w.getComputedStyle(cards[3]).backgroundImage==='none');
  check(tag+' badge and content do not overlap',cards.filter(c=>w.getComputedStyle(c,'::after').content.includes('Moving spotlights')).every(c=>{const n=[...c.childNodes].find(n=>n.nodeType===3&&n.textContent.trim())||c.querySelector('span'),r=doc.createRange();r.selectNodeContents(n);const rect=r.getBoundingClientRect(),box=c.getBoundingClientRect(),badge=w.getComputedStyle(c,'::after');return rect.bottom<=box.bottom-parseFloat(w.getComputedStyle(c).paddingBottom)-parseFloat(badge.height)-10+1&&[...c.querySelectorAll('.sequence-unavailable-hint,[class$="-artist"]')].every(el=>el.getBoundingClientRect().bottom<=box.bottom-parseFloat(w.getComputedStyle(c).paddingBottom)-parseFloat(badge.height)-10+1);}));
  check(tag+' NEW-only song retains its corner sash',(t.id==='compact-console'&&mode==='voting'?w.getComputedStyle(cards[4].parentElement,'::after'):w.getComputedStyle(cards[4],'::after')).content.includes('NEW'));
  check(tag+' both labels remain separate',w.getComputedStyle(cards[2],'::after').content.startsWith('"Moving spotlights"')&&(t.id==='compact-console'&&mode==='voting'?w.getComputedStyle(cards[2].parentElement,'::after').content.includes('NEW')&&w.getComputedStyle(cards[2]).backgroundImage==='none':w.getComputedStyle(cards[2]).backgroundImage.includes('data:image/svg+xml')));
  check(tag+' neither label stays unmarked',w.getComputedStyle(cards[1],'::after').content==='none'&&w.getComputedStyle(cards[1]).backgroundImage==='none');
  if(t.id==='festive')check(tag+' dual labels leave room beside the title',cards.filter(c=>s.newNames.split('\n').includes(c.dataset.key)&&s.movingHeadNames.split('\n').includes(c.dataset.key)).every(c=>parseFloat(w.getComputedStyle(c).paddingRight)>=48));
  check(tag+' titles fit their cards',cards.every(c=>{const n=[...c.childNodes].find(n=>n.nodeType===3&&n.textContent.trim())||c.querySelector('span');const r=doc.createRange();r.selectNodeContents(n);const b=c.getBoundingClientRect();return [...r.getClientRects()].every(v=>v.left>=b.left-1&&v.right<=b.right+1);}));
  if(mode==='voting')check(tag+' unwrapped votes align with their own cards',cards.slice(0,2).every(c=>{const a=c.getBoundingClientRect(),b=c.nextElementSibling.getBoundingClientRect();return b.left>=a.right&&Math.abs(a.top-b.top)<1&&Math.abs(a.bottom-b.bottom)<1;}));
  for(const [hash,expected] of [['songs-category-1',['Named new']],['songs-category-2',['Named old','New only']],['songs-new',['Uncategorised new','Named new','New only']],['songs-all',['Uncategorised new','Uncategorised old','Named new','Named old','New only']]]){
   doc.querySelector('a[href="#'+hash+'"]').click();await wait();check(tag+' '+hash+' filters correctly',JSON.stringify(current())===JSON.stringify(expected));
   if(mode==='voting')check(tag+' '+hash+' keeps only matching tallies',[...list.querySelectorAll('.cell-vote')].filter(visible).length===expected.length);
  }
  // An entirely ungrouped list keeps the same fallback/filter behaviour.
  doc.querySelectorAll('.category-section').forEach(e=>e.remove());check(tag+' all-uncategorised list remains visible',current().length===2);
  status.textContent=tag;
 }
 }
}catch(error){check(error.stack,false);}finally{run.disabled=false;status.textContent=results.querySelectorAll('.pass').length+' passed; '+results.querySelectorAll('.fail').length+' failed';document.title=results.querySelectorAll('.fail').length+' failures · Uncategorised songs';}};
