import {cloneDefaults,render} from '../src/template.js';
import {createPreview} from '../src/preview.js';
const frame=document.getElementById('preview'),results=document.getElementById('results');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS — ':'FAIL — ')+name;results.append(li);};
const title='A Rather Long Song Title for a Night of Lights';
const artwork='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#386c53"/></svg>');
document.getElementById('run').onclick=async()=>{
 results.replaceChildren();
 try{
  const source=await(await fetch('../templates/christmas.html')).text();
  for(const theme of ['christmas','halloween'])for(const mode of ['jukebox','voting'])for(const width of [320,390,1280])for(const showAlbumArtwork of [true,false]){
   const s=cloneDefaults(theme);s.showAlbumArtwork=showAlbumArtwork;s.newNames='With art\nWithout art';
   const d=new DOMParser().parseFromString(render(source,s),'text/html'),cls=mode==='jukebox'?'jukebox-list':'cell-vote-playlist';
   // RF renders available titles as text nodes, omits unset images, and keeps
   // the artist in its own div. These are CSS fixtures, not service responses.
   d.body.innerHTML='<main id="show-options"><section class="content__body" style="display:block;position:relative;padding:16px"><div class="los-song-list"></div></section></main>';
   const list=d.querySelector('.los-song-list');
   for(const image of [true,false])for(const unavailable of [false,true]){
    const card=d.createElement('div');card.className=cls+(unavailable?' sequence-unavailable':'');card.dataset.key=image?'With art':'Without art';
    if(image){const img=d.createElement('img');img.src=artwork;img.className='sequence-image';card.append(img);}
    if(unavailable){const span=d.createElement('span');span.textContent=title;card.append(span);}else card.append(title);
    const artist=d.createElement('div');artist.className=cls+'-artist';artist.textContent='Example Artist';card.append(artist);
    if(unavailable){const hint=d.createElement('div');hint.className='sequence-unavailable-hint';hint.textContent='Back next show';card.append(hint);}
    if(mode==='voting'){const row=d.createElement('div');row.className='cell-vote-row';const count=d.createElement('div');count.className='cell-vote';count.textContent='3';row.append(card,count);list.append(row);}else list.append(card);
   }
   frame.style.width=width+'px';frame.srcdoc='<!doctype html>'+d.documentElement.outerHTML;await wait(100);
   for(const enlarged of [false,true]){
    const doc=frame.contentDocument;doc.documentElement.style.fontSize=enlarged?'200%':'';await wait(20);
    const prefix=`${theme} ${mode} ${width}px artwork ${showAlbumArtwork?'on':'off'} ${enlarged?'enlarged':'normal'}`;
    for(const [i,card] of [...doc.querySelectorAll('.'+cls)].entries()){
     const image=i<2,titleNode=[...card.childNodes].find(n=>n.nodeType===3&&n.textContent.trim())||card.querySelector('span'),range=doc.createRange();range.selectNodeContents(titleNode);
     const rect=range.getBoundingClientRect(),artist=card.querySelector('.'+cls+'-artist').getBoundingClientRect(),box=card.getBoundingClientRect(),style=frame.contentWindow.getComputedStyle(card);
     check(`${prefix} row ${i}: title and artist align`,Math.abs(rect.x-artist.x)<2);
     check(`${prefix} row ${i}: text fits its card`,rect.right<=box.right+1&&artist.right<=box.right+1);
     if(!image||!showAlbumArtwork)check(`${prefix} row ${i}: no unused artwork column`,style.gridTemplateColumns.split(' ').length===1&&artist.width>box.width*.5);
     else check(`${prefix} row ${i}: artwork column retained`,card.querySelector('img').getBoundingClientRect().width>0&&style.gridTemplateColumns.split(' ').length===2);
     check(`${prefix} row ${i}: NEW sash retained`,frame.contentWindow.getComputedStyle(card,'::after').content==='"NEW"');
    }
   }
  }
  const adapter=createPreview(frame,()=>{}),s=cloneDefaults();
  const catalogue={songs:[{name:'No image example',displayName:'A song without artwork',artist:'Example Artist',category:'Christmas',imageUrl:''}]};
  for(const mode of ['jukebox','voting']){
   adapter.update(render(source,s),s,{mode,air:true,reset:true,catalogue});await wait(200);adapter.navigate('music');await wait(50);
   const card=frame.contentDocument.querySelector(mode==='jukebox'?'.jukebox-list':'.cell-vote-playlist');
   check(`${mode}: imported preview omits an unset image`,card&&!card.querySelector('img'));
   check(`${mode}: available preview title matches RF text-node structure`,card&&[...card.childNodes].some(n=>n.nodeType===3&&n.textContent==='A song without artwork'));
  }
 }catch(error){check(error.stack,false);}
 document.title=`${results.querySelectorAll('.fail').length} failures · Song artwork`;
};
