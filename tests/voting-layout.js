import {registry} from '../src/template-registry.js';
const frame=document.querySelector('#preview'),run=document.querySelector('#run'),results=document.querySelector('#results'),status=document.querySelector('#status');
const visible=e=>!!e&&e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0;
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS - ':'FAIL - ')+name;results.append(li);};
const image='<img class="sequence-image" alt="" src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22%3E%3Crect width=%2264%22 height=%2264%22 fill=%22%23999%22/%3E%3C/svg%3E">';
const fixtures=[['short','Short',0],['new-short','Short',3],['new','A longer layout title for wrapping across narrow song cards',12],['both','AnUnbrokenLayoutTitleThatMustWrapInsideTheCardWithoutMovingTheVoteColumn',9999],['missing','No artist',1],['unavailable','Unavailable layout fixture',2]];
const row=([id,title,count],inline)=>'<div class="cell-vote-row"'+(inline?' style="display:flex;width:100%;align-items:flex-end"':'')+'><div class="cell-vote-playlist'+(id==='unavailable'?' sequence-unavailable':'')+'" data-key="'+id+'">'+(id==='missing'?'':image)+(id==='unavailable'?'<span>'+title+'</span>':title)+(id==='missing'?'':'<div class="cell-vote-playlist-artist">Layout artist</div>')+(id==='unavailable'?'<span class="sequence-unavailable-hint">Back next show</span>':'')+'</div><div class="cell-vote">'+count+'</div></div>';
const settle=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
run.onclick=async()=>{run.disabled=true;results.replaceChildren();try{
 const baseline=new URLSearchParams(location.search).has('baseline'),animate=new URLSearchParams(location.search).has('animate');
 for(const t of registry.filter(t=>!baseline||t.id==='compact-console')){const source=await(await fetch('../'+t.source)).text();
 for(const theme of baseline?['christmas']:Object.keys(t.themes))for(const width of baseline?[390]:[320,390,1280])for(const artwork of baseline?['album']:['album','category','none'])for(const inline of baseline?[true]:[false,true]){
  const s={...t.cloneDefaults(theme),songArtwork:artwork,newFilter:true,newNames:'new\nboth\nnew-short',movingHeadNames:'both',movingHeadAnimation:animate,categories:true,showSongArtists:artwork!=='none'};
  const d=new DOMParser().parseFromString(t.render(source,s),'text/html'),flags=d.getElementById('show-options').className;
  d.body.innerHTML='<div id="show-options" class="'+flags+'"></div><div class="music-filter-targets"><span id="songs-all"></span><span id="songs-new"></span><span id="songs-category-1"></span></div><section id="music-panel" class="content__body" style="display:block;max-width:680px;margin:auto"><nav class="music-filter"><a href="#songs-all">All</a><a href="#songs-new">New</a><a href="#songs-category-1">Category</a></nav><div class="los-song-list"><div class="category-section">'+fixtures.map(r=>row(t.id==='festive'&&r[0]==='both'?[r[0],'A very long layout title that wraps across several lines on narrow song cards',r[2]]:r,inline)).join('')+'</div></div></section>';
  frame.style.width=width+'px';frame.style.height='844px';await new Promise(resolve=>{frame.onload=resolve;frame.srcdoc='<!doctype html>'+d.documentElement.outerHTML;});
  const doc=frame.contentDocument,win=frame.contentWindow,tag=[t.id,theme,width,artwork,inline?'RF inline flex':'CSS grid'].join(' ');
  const measure=phase=>{const rows=[...doc.querySelectorAll('.cell-vote-row')].filter(visible),cards=rows.map(r=>r.querySelector('.cell-vote-playlist')),rect=e=>e.getBoundingClientRect();
   check(tag+' '+phase+' card widths match',Math.max(...cards.map(c=>rect(c).width))-Math.min(...cards.map(c=>rect(c).width))<1);
   check(tag+' '+phase+' cards fill the available row',rows.every(r=>Math.abs(rect(r.firstElementChild).width-(rect(r).width-(t.id==='compact-console'?47:0)))<1));
   check(tag+' '+phase+' vote columns align',Math.max(...rows.map(r=>rect(r.lastElementChild).right))-Math.min(...rows.map(r=>rect(r.lastElementChild).right))<1);
   check(tag+' '+phase+' count stays within row',rows.every(r=>rect(r.lastElementChild).left>=rect(r).left&&rect(r.lastElementChild).right<=rect(r).right+1));
   if(t.id==='compact-console')check(tag+' '+phase+' fixed centred vote column',rows.every(r=>Math.abs(rect(r.lastElementChild).width-42)<1&&Math.abs(rect(r.lastElementChild).height-rect(r.firstElementChild).height)<1));
   if(t.id==='compact-console')for(const r of rows.filter(r=>win.getComputedStyle(r,'::after').content==='"NEW"')){
    const c=r.firstElementChild,v=r.lastElementChild,style=win.getComputedStyle(r,'::after'),num=k=>parseFloat(style[k])||0;
    const w=num('width')+(style.boxSizing==='border-box'?0:num('paddingLeft')+num('paddingRight')+num('borderLeftWidth')+num('borderRightWidth'));
    const h=num('height')+(style.boxSizing==='border-box'?0:num('paddingTop')+num('paddingBottom')+num('borderTopWidth')+num('borderBottomWidth'));
    const [ox,oy]=style.transformOrigin.split(' ').map(parseFloat),m=new DOMMatrix(style.transform),left=rect(r).right-num('right')-w,top=rect(r).top+num('top');
    const points=[[0,0],[w,0],[0,h],[w,h]].map(([x,y])=>({x:left+ox+m.a*(x-ox)+m.c*(y-oy)+m.e,y:top+oy+m.b*(x-ox)+m.d*(y-oy)+m.f}));
    const sash={left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),bottom:Math.max(...points.map(p=>p.y))};
    check(tag+' '+phase+' '+c.dataset.key+' NEW is inside card and clear of tally',sash.left>=rect(c).left&&sash.right<=rect(c).right+.5&&sash.right<rect(v).left);
    const title=[...c.childNodes].find(n=>n.nodeType===3&&n.textContent.trim())||c.querySelector('span'),range=doc.createRange();range.selectNodeContents(title);
    check(tag+' '+phase+' '+c.dataset.key+' NEW clears title',[...range.getClientRects()].every(b=>b.right<=sash.left||b.left>=sash.right||b.top>=sash.bottom||b.bottom<=sash.top));
   }
   check(tag+' '+phase+' no horizontal overflow',doc.documentElement.scrollWidth<=width+1&&cards.every(c=>{const n=[...c.childNodes].find(n=>n.nodeType===3&&n.textContent.trim())||c.querySelector('span');const range=doc.createRange();range.selectNodeContents(n);return [...range.getClientRects()].every(r=>r.left>=rect(c).left-1&&r.right<=rect(c).right+1);}));
  };
  measure('All');
  if(t.id==='compact-console')check(tag+' NEW does not add height to a short card',Math.abs(doc.querySelector('[data-key="new-short"]').getBoundingClientRect().height-doc.querySelector('[data-key="short"]').getBoundingClientRect().height)<1);
  check(tag+' artwork and artists respect settings',[...doc.querySelectorAll('.cell-vote-playlist')].every(c=>visible(c.querySelector('img'))===(artwork==='album'&&c.dataset.key!=='missing')&&visible(c.querySelector('.cell-vote-playlist-artist'))===(s.showSongArtists&&c.dataset.key!=='missing')));
  if(animate){const c=doc.querySelector('[data-key=both]');check(tag+' animated fixture and wash are present',win.getComputedStyle(c,'::after').backgroundImage.includes('data:image/svg+xml')&&win.getComputedStyle(c).backgroundImage.includes('data:image/svg+xml'));}
  check(tag+' moving badge remains separate',win.getComputedStyle(doc.querySelector('[data-key="both"]'),'::after').content.includes('Moving spotlights'));
  check(tag+' availability hint remains visible',visible(doc.querySelector('.sequence-unavailable-hint')));
  win.location.hash='#songs-new';await settle();measure('NEW');check(tag+' NEW filter retains only three assignments',[...doc.querySelectorAll('.cell-vote-row')].filter(visible).length===3);
  win.location.hash='#songs-category-1';await settle();measure('Category');check(tag+' category retains all rows',[...doc.querySelectorAll('.cell-vote-row')].filter(visible).length===6);
  doc.documentElement.style.fontSize='24px';await settle();measure('Enlarged text');status.textContent=tag;
 }
 }
 }catch(error){check(error.stack,false);}finally{run.disabled=false;status.textContent=results.querySelectorAll('.pass').length+' passed; '+results.querySelectorAll('.fail').length+' failed';document.title=results.querySelectorAll('.fail').length+' failures - Voting row layout';}
};
