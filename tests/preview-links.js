import {cloneDefaults,render,themes} from '../src/template.js';
import {createPreview} from '../src/preview.js';
const frame=document.getElementById('preview'),results=document.getElementById('results'),run=document.getElementById('run');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS — ':'FAIL — ')+name;results.append(li);};
run.onclick=async()=>{
 run.disabled=true;results.replaceChildren();
 try{
  const source=await(await fetch('../templates/christmas.html')).text(),notices=[],adapter=createPreview(frame,text=>notices.push(text)),parentURL=location.href;
  for(const theme of Object.keys(themes))for(const mode of ['jukebox','voting'])for(const air of [true,false]){
   const label=`${theme} ${mode} ${air?'on':'off'} air`,s=cloneDefaults(theme);
   Object.assign(s,{categories:true,newFilter:true,fm:true,frequency:'88.7',pulsemesh:true});
   const html=render(source,s);adapter.update(html,s,{mode,air,reset:true});await wait(350);
   const d=frame.contentDocument;
   check(`${label}: explicit preview base`,d.baseURI==='about:srcdoc');
   const links=[...d.querySelectorAll('a[href^="#"]')];
   check(`${label}: every fragment resolves within the preview`,links.every(a=>a.href.startsWith('about:srcdoc#')));
   for(const hash of ['#music-panel','#support-panel','#info-panel','#home-panel',...(air?['#songs-category-2','#songs-new','#info-listening']:[])]){
    const a=d.querySelector(`a[href="${hash}"]`);
    if(!a)throw Error(`Missing test link ${hash}`);
    a.click();await wait(40);
    check(`${label} ${hash}: click stays in the same viewer document`,frame.contentDocument===d&&d.location.hash===hash&&!d.querySelector('#settings')&&location.href===parentURL);
    check(`${label} ${hash}: CSS target belongs to the viewer`,d.querySelector(':target')?.id===hash.slice(1));
   }
   // Also exercise native anchor navigation without the parent click adapter.
   // This catches inherited editor URLs even when interception masks the bug.
   const nativeLink=d.querySelector('.los-menu a[href="#music-panel"]');
   if(nativeLink.href.startsWith('about:srcdoc#')){
    adapter.navigate('home');await wait(40);
    const nativeOnly=e=>{if(e.target.closest('a')===nativeLink)e.stopImmediatePropagation();};
    d.addEventListener('click',nativeOnly,true);nativeLink.click();await wait(80);d.removeEventListener('click',nativeOnly,true);
    check(`${label}: native link cannot load the editor`,frame.contentDocument===d&&d.location.hash==='#music-panel');
   }
   adapter.navigate('home');await wait(40);adapter.navigate('music');await wait(40);adapter.navigate('info');await wait(40);
   frame.contentWindow.history.back();await wait(120);check(`${label}: Back keeps the viewer`,frame.contentDocument===d&&d.location.hash==='#music-panel');
   frame.contentWindow.history.forward();await wait(120);check(`${label}: Forward keeps the viewer`,frame.contentDocument===d&&d.location.hash==='#info-panel');
   const external=d.querySelector('a[href="https://pulsemesh.io/download"]');
   if(external){const before=notices.length;external.click();await wait(30);check(`${label}: external links remain blocked`,frame.contentDocument===d&&notices.length===before+1);}
   adapter.update(html,s,{mode,air});await wait(350);
   check(`${label}: ordinary edits retain panel and isolated base`,frame.contentDocument.baseURI==='about:srcdoc'&&frame.contentWindow.location.hash==='#info-panel');
   check(`${label}: exports remain free of preview-only base and scripts`,!/<base\b|about:srcdoc|<script\b/i.test(html));
  }
 }catch(error){check(error.stack,false);}
 finally{run.disabled=false;document.title=`${results.querySelectorAll('.fail').length} failures · Preview links`;}
};
