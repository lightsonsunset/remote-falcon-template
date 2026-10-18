import {registry} from '../src/template-registry.js';
import {createPreview} from '../src/preview.js';
import {iconGlyphs} from '../src/icons.js';
const frame=document.querySelector('#preview'),run=document.querySelector('#run'),results=document.querySelector('#results'),adapter=createPreview(frame,()=>{});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS — ':'FAIL — ')+name;results.append(li);};
const visible=e=>!!e&&e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0;
run.onclick=async()=>{run.disabled=true;results.replaceChildren();try{
 for(const t of registry){const source=await(await fetch('../'+t.source)).text();
 for(const theme of ['christmas','halloween'])for(const width of [320,390,1440])for(const mode of ['jukebox','voting'])for(const artwork of ['album','category','none'])for(const now of [true,false]){
  const s=t.cloneDefaults(theme);Object.assign(s,{songArtwork:artwork,showNowPlayingArtwork:now,newNames:t.themes[theme].demoSongs[0],categoryIcons:{[s.categoryNames[0]]:'tree',[s.categoryNames[1]]:'snowman'}});
  frame.style.width=width+'px';frame.style.height='844px';
  await adapter.update(t.render(source,s),s,{air:true,mode,templateId:t.id,landing:t.landing,startAtLanding:true});adapter.navigate('music');await wait(25);
  const d=frame.contentDocument,win=frame.contentWindow,tag=[t.id,theme,width,mode,artwork,'now '+now].join(' '),cards=[...d.querySelectorAll(mode==='jukebox'?'.jukebox-list':'.cell-vote-playlist')],first=cards[0],player=d.querySelector('.playing-now');
  check(tag+' list cover visibility',cards.length>0&&cards.every(c=>visible(c.querySelector('img'))===(artwork==='album')));
  check(tag+' independent player cover',visible(player.querySelector('img'))===now);
  if(!now)check(tag+' no blank player column',win.getComputedStyle(player).display==='flex'||win.getComputedStyle(player).gridTemplateColumns.split(' ').length===1);
  check(tag+' no horizontal overflow',d.documentElement.scrollWidth<=width+1);
  const before=win.getComputedStyle(first,'::before');check(tag+' category glyph',artwork==='category'?before.content.includes(String.fromCodePoint(parseInt(iconGlyphs.tree,16))):['none','normal',''].includes(before.content));
  if(artwork==='category'){
   check(tag+' glyphs follow categories with filters off',[...d.querySelectorAll('.category-section')].every((section,i)=>{const card=section.querySelector('.jukebox-list,.cell-vote-playlist');return win.getComputedStyle(card,'::before').content.includes(String.fromCodePoint(parseInt(iconGlyphs[i===0?'tree':'snowman'],16)));}));
   const range=d.createRange();const title=[...first.childNodes].find(n=>n.nodeType===3&&n.textContent.trim())||first.querySelector('span');range.selectNodeContents(title);const rect=range.getBoundingClientRect(),box=first.getBoundingClientRect();
   check(tag+' icon and title do not overlap',rect.x>=box.x+70&&rect.right<=box.right+1);
   check(tag+' title and artist align',Math.abs(rect.x-first.querySelector('.jukebox-list-artist,.cell-vote-playlist-artist').getBoundingClientRect().x)<2);
   check(tag+' icon stays decorative and leaves clicks to the row',before.pointerEvents==='none'&&before.content.includes('/ ""'));
  }
  const sashTarget=t.id==='compact-console'&&mode==='voting'?first.parentElement:first;
  check(tag+' NEW sash retained',win.getComputedStyle(sashTarget,'::after').content==='"NEW"');
  if(t.id==='festive'&&mode==='voting'&&artwork==='category'){
   const sash=win.getComputedStyle(first,'::after'),matrix=new DOMMatrix(sash.transform),[ox,oy]=sash.transformOrigin.split(' ').map(parseFloat),w=parseFloat(sash.width),h=parseFloat(sash.height),top=first.getBoundingClientRect().top+parseFloat(sash.top);
   const bottom=top+Math.max(...[[0,0],[w,0],[0,h],[w,h]].map(([x,y])=>matrix.transformPoint({x:x-ox,y:y-oy}).y+oy));
   check(tag+' vote count clears the diagonal NEW sash',first.parentElement.querySelector('.cell-vote').getBoundingClientRect().top>=bottom-1);
  }

  if(artwork==='none')check(tag+' no unused list art column',win.getComputedStyle(first).gridTemplateColumns.split(' ').length===1);
  // Pure layout variation: RF can omit cover images. Icons must not need an img node.
  if(artwork==='category'){first.querySelector('img')?.remove();await wait(5);check(tag+' category icon survives missing album art',win.getComputedStyle(first,'::before').content.includes(String.fromCodePoint(parseInt(iconGlyphs.tree,16))));}
 }
 const s=t.cloneDefaults();Object.assign(s,{songArtwork:'category',showNowPlayingArtwork:false,categories:true,hiddenCategories:[s.categoryNames[0]],categoryIcons:{[s.categoryNames[0]]:'calendar',[s.categoryNames[1]]:'spotify'},newFilter:true,newNames:t.themes.christmas.demoSongs[0]});
 await adapter.update(t.render(source,s),s,{air:true,mode:'jukebox',templateId:t.id,landing:t.landing,startAtLanding:true});adapter.navigate('songs-new');await wait(50);
 let d=frame.contentDocument,c=d.querySelector('.jukebox-list');check(t.id+' NEW filter retains regular category glyph',getComputedStyle(c,'::before').content.includes(String.fromCodePoint(parseInt(iconGlyphs.calendar,16)))&&getComputedStyle(c,'::before').fontWeight==='400');
 adapter.navigate('songs-all');await wait(20);c=d.querySelectorAll('.category-section')[1].querySelector('.jukebox-list');check(t.id+' brand category icon uses brand font',getComputedStyle(c,'::before').fontFamily.includes('Brands'));
 // A mismatched imported snapshot must not suggest that positional art is verified.
 await adapter.update(t.render(source,s),s,{air:true,mode:'jukebox',templateId:t.id,landing:t.landing,categoriesMismatch:true});adapter.navigate('music');await wait(20);d=frame.contentDocument;c=d.querySelector('.jukebox-list');check(t.id+' mismatched mapping uses music-note fallback',getComputedStyle(c,'::before').content.includes(String.fromCodePoint(parseInt(iconGlyphs.music,16))));
 for(const mode of ['jukebox','voting']){await adapter.update(t.render(source,s),s,{air:false,mode,templateId:t.id,landing:t.landing});adapter.navigate('music');await wait(20);check(t.id+' '+mode+' off-air has no song artwork',!frame.contentDocument.querySelector('.jukebox-list,.cell-vote-playlist,.playing-now'));}
 }
 }catch(error){check(error.stack,false);}finally{run.disabled=false;document.title=results.querySelectorAll('.fail').length+' failures · Category artwork';}};
