import {cloneDefaults,render,themes} from '../src/template.js';
import {createPreview} from '../src/preview.js';
const frame=document.getElementById('preview'),results=document.getElementById('results'),button=document.getElementById('run');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS — ':'FAIL — ')+name;results.append(li);};
button.onclick=async()=>{
 button.disabled=true;results.replaceChildren();
 try{
  const source=await(await fetch('../templates/christmas.html')).text(),adapter=createPreview(frame,()=>{});
  for(const theme of Object.keys(themes)){
   const s=cloneDefaults(theme);Object.assign(s,{decorations:true,categories:true,newFilter:true,fm:true,newNames:themes[theme].demoSongs[0]});const html=render(source,s);
   for(const width of [320,390,1280]){
    frame.style.width=width+'px';frame.style.height='844px';adapter.update(html,s,{air:true,mode:'jukebox',reset:true});await wait(350);
    const d=frame.contentDocument,nav=d.querySelector('.los-menu');
    for(const [hash,index] of [['#home-panel',0],['#music-panel',1],['#songs-new',1],['#songs-category-2',1],['#support-panel',2],['#info-panel',3],['#info-listening',3],['#unknown-page',0]]){
     frame.contentWindow.location.hash=hash;
     const aligned=()=>{const style=getComputedStyle(nav,'::after'),navBox=nav.getBoundingClientRect(),item=nav.children[index].getBoundingClientRect();return Math.abs(navBox.left+parseFloat(style.left)+parseFloat(style.width)-(item.right-4))<3;};
     // Background tabs can defer animation frames; wait for the resulting position.
     for(let attempt=0;attempt<40&&!aligned();attempt++)await wait(50);
     const style=getComputedStyle(nav,'::after');
     check(`${theme} ${width}px ${hash}: ornament follows selected button`,aligned());
     check(`${theme} ${width}px ${hash}: decoration cannot catch taps`,style.pointerEvents==='none');
    }
    check(`${theme} ${width}px: no background illustration`,getComputedStyle(d.getElementById('home-panel'),'::before').backgroundImage==='none');
    check(`${theme} ${width}px: animation respects current motion preference`,getComputedStyle(nav,'::after').transitionDuration===(frame.contentWindow.matchMedia('(prefers-reduced-motion: reduce)').matches?'0s':'0.18s'));
    adapter.navigate('home');await wait(40);adapter.navigate('music');await wait(40);adapter.navigate('support');await wait(40);
    frame.contentWindow.history.back();await wait(250);check(`${theme} ${width}px: Back restores Music ornament`,frame.contentWindow.location.hash==='#music-panel'&&getComputedStyle(nav).getPropertyValue('--nav-decoration-index').trim()==='1');
    frame.contentWindow.history.forward();await wait(250);check(`${theme} ${width}px: Forward restores Support ornament`,frame.contentWindow.location.hash==='#support-panel'&&getComputedStyle(nav).getPropertyValue('--nav-decoration-index').trim()==='2');
   }
   frame.style.width='390px';
   for(const mode of ['jukebox','voting']){
    adapter.setDragScrolling(true);adapter.update(html,s,{air:true,mode,reset:true});await wait(350);adapter.navigate('music');await wait(40);
    const d=frame.contentDocument,panel=d.getElementById('music-panel');let card=d.querySelector('.los-song-list [role="button"]');
    panel.scrollTop+=card.getBoundingClientRect().top-150;
    const pointer=(type,y,pointerType='mouse')=>card.dispatchEvent(new d.defaultView.PointerEvent(type,{bubbles:true,cancelable:true,clientX:160,clientY:y,button:0,buttons:type==='pointerup'?0:1,pointerType,pointerId:1,isPrimary:true}));
    const before=panel.scrollTop;
    pointer('pointerdown',200);pointer('pointermove',130);pointer('pointerup',130);card.dispatchEvent(new d.defaultView.MouseEvent('click',{bubbles:true,cancelable:true,detail:1}));
    check(`${theme} ${mode}: mouse swipe scrolls without requesting`,panel.scrollTop>before&&getComputedStyle(d.getElementById('requestSuccessful')).display==='none');
    const after=panel.scrollTop;pointer('pointerdown',200,'touch');pointer('pointermove',130,'touch');pointer('pointerup',130,'touch');check(`${theme} ${mode}: native touch is not handled as mouse drag`,panel.scrollTop===after);
    adapter.setDragScrolling(false);pointer('pointerdown',200);pointer('pointermove',130);pointer('pointerup',130);check(`${theme} ${mode}: desktop mode leaves mouse dragging alone`,panel.scrollTop===after);
    adapter.setDragScrolling(true);pointer('pointerdown',200);pointer('pointerup',200);card.dispatchEvent(new d.defaultView.MouseEvent('click',{bubbles:true,cancelable:true,detail:1}));
    check(`${theme} ${mode}: normal click still confirms a request/vote`,getComputedStyle(d.getElementById('requestSuccessful')).display!=='none');
    const queue=d.querySelector('.jukebox-queue-container')?.textContent,vote=d.querySelector('.cell-vote')?.textContent;
    adapter.navigate('info');adapter.navigate('music');await wait(40);
    check(`${theme} ${mode}: editor navigation preserves queue/votes`,d.querySelector('.jukebox-queue-container')?.textContent===queue&&d.querySelector('.cell-vote')?.textContent===vote);
   }
  }
 }catch(err){check(err.stack,false);}finally{button.disabled=false;document.title=`${results.querySelectorAll('.fail').length} failures · Navigation checks`;}
};
