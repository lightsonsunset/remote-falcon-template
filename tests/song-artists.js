import {registry} from '../src/template-registry.js';
const frame=document.querySelector('#preview'),run=document.querySelector('#run'),results=document.querySelector('#results'),status=document.querySelector('#status');
const visible=e=>!!e&&e.getBoundingClientRect().height>0&&e.getBoundingClientRect().width>0;
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS — ':'FAIL — ')+name;results.append(li);};
const artistClass=mode=>mode==='jukebox'?'jukebox-list-artist':'cell-vote-playlist-artist';
const artist=(mode,state)=>state==='absent'?'':'<div class="'+artistClass(mode)+'">'+(state==='present'?'Layout artist':'')+'</div>';
const image='<img class="sequence-image" alt="" src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22%3E%3Crect width=%2264%22 height=%2264%22 fill=%22%23999%22/%3E%3C/svg%3E">';
const title='A longer song title for narrow screens';
const song=(mode,state,withImage)=>{
 const unavailable=!withImage,cls=mode==='jukebox'?'jukebox-list':'cell-vote-playlist';
 const card='<div class="'+cls+(unavailable?' sequence-unavailable':'')+'" data-key="'+state+(withImage?'-image':'-text')+'" data-artist="'+state+'">'+(withImage?image:'')+(unavailable?'<span>'+title+'</span>':title)+artist(mode,state)+(unavailable?'<span class="sequence-unavailable-hint">Back next show</span>':'')+'</div>';
 return mode==='voting'?'<div class="cell-vote-row" style="display:flex;width:100%;align-items:flex-end">'+card+'<div class="cell-vote">2</div></div>':card;
};
run.onclick=async()=>{run.disabled=true;results.replaceChildren();try{
 for(const t of registry){const source=await(await fetch('../'+t.source)).text();
 for(const theme of ['christmas','halloween'])for(const width of [320,390,1280])for(const mode of ['jukebox','voting'])for(const artwork of ['album','category','none'])for(const list of [true,false])for(const queue of [true,false]){
  const s={...t.cloneDefaults(theme),songArtwork:artwork,showNowPlayingArtwork:artwork==='album',showSongArtists:list,showQueueArtists:queue,newNames:'present-image'};
  const d=new DOMParser().parseFromString(t.render(source,s),'text/html'),flags=d.getElementById('show-options').className;
  // Narrow stylesheet fixtures only: no fabricated external data or service responses.
  d.body.innerHTML='<div id="show-options" class="'+flags+'"></div><section id="music-panel" class="content__body" style="display:block;max-width:680px;margin:auto"><div class="playing-now">'+image+title+artist(mode,'present')+'</div><div class="next-playlist">'+title+artist('jukebox','present')+'</div><div class="jukebox-queue">'+title+'<div class="jukebox-queue-artist">Layout artist</div></div><div class="los-song-list">'+['present','empty','absent'].map(state=>[true,false].map(art=>song(mode,state,art)).join('')).join('')+'</div></section>';
  frame.style.width=width+'px';frame.style.height='844px';
  await new Promise(resolve=>{frame.onload=resolve;frame.srcdoc='<!doctype html>'+d.documentElement.outerHTML;});
  const doc=frame.contentDocument,win=frame.contentWindow,cards=[...doc.querySelectorAll('.jukebox-list,.cell-vote-playlist')],tag=[t.id,theme,width,mode,artwork,list,queue].join(' ');
  check(tag+' independent artist visibility',cards.every(c=>visible(c.querySelector('.'+artistClass(mode)))===(list&&c.dataset.artist==='present'))&&[...doc.querySelectorAll('.playing-now,.next-playlist,.jukebox-queue')].every(c=>visible(c.querySelector('.jukebox-list-artist,.cell-vote-playlist-artist,.jukebox-queue-artist'))===queue));
  check(tag+' title retained and no overflow',cards.every(c=>{const node=[...c.childNodes].find(n=>n.nodeType===3&&n.textContent.trim())||c.querySelector('span');const range=doc.createRange();range.selectNodeContents(node);const box=c.getBoundingClientRect();return c.textContent.includes(title)&&[...range.getClientRects()].every(r=>r.left>=box.left-1&&r.right<=box.right+1);})&&doc.documentElement.scrollWidth<=width+1);
  check(tag+' empty artists match missing-artist layout',[0,1].every(i=>Math.abs(cards[2+i].getBoundingClientRect().height-cards[4+i].getBoundingClientRect().height)<1));
  check(tag+' artwork keeps independent choice',cards.every(c=>visible(c.querySelector('img'))===(artwork==='album'&&!!c.querySelector('img'))));
  check(tag+' availability hints and votes retained',[...doc.querySelectorAll('.sequence-unavailable-hint,.cell-vote')].every(visible));
  const newTarget=t.id==='compact-console'&&mode==='voting'?cards[0].parentElement:cards[0];
  check(tag+' NEW sash retained',win.getComputedStyle(newTarget,'::after').content==='"NEW"');
  // Both no-artist representations must also collapse in the player and queue.
  for(const box of doc.querySelectorAll('.playing-now,.next-playlist,.jukebox-queue')){
   const a=box.querySelector('.jukebox-list-artist,.cell-vote-playlist-artist,.jukebox-queue-artist');a.textContent='';const h=box.getBoundingClientRect().height;const emptyHidden=!visible(a);a.remove();check(tag+' '+box.className+' empty artist has no line',emptyHidden&&Math.abs(h-box.getBoundingClientRect().height)<1);
  }
  status.textContent=tag;
 }
 }
}catch(error){check(error.stack,false);}finally{run.disabled=false;status.textContent=results.querySelectorAll('.pass').length+' passed; '+results.querySelectorAll('.fail').length+' failed';document.title=results.querySelectorAll('.fail').length+' failures · Artist layout';}};
