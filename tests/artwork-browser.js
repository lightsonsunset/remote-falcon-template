
import {cloneDefaults,render,themes} from '../src/template.js';
import {createPreview} from '../src/preview.js';
import {logoChoices,decorationChoices} from '../src/assets.js';
const frame=document.querySelector('iframe'),out=document.querySelector('ol'),run=document.querySelector('button'),wait=ms=>new Promise(r=>setTimeout(r,ms));
const check=(text,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS: ':'FAIL: ')+text;out.append(li);};
run.onclick=async()=>{run.disabled=true;out.replaceChildren();try{
 const source=await(await fetch('../templates/christmas.html')).text(),p=createPreview(frame,()=>{});
 for(const theme of ['christmas','halloween']){
  const s=cloneDefaults(theme);Object.assign(s,{logoMode:'seasonal',combineLogoName:true,decorations:true,name:'Neighbourhood Lights & Friends — a very long community light show name'});
  for(const logo of logoChoices[theme])for(const width of [320,390,1280]){
   s.logoStyle=logo.id;frame.width=width;frame.height=844;p.update(render(source,s),s,{air:true,mode:'jukebox',reset:true});await wait(400);p.navigate('home');await wait(30);
   const d=frame.contentDocument,img=d.querySelector('.show-logo');await img.decode();
   check(theme+' '+logo.id+' '+width+'px loads artwork',img.naturalWidth===840);
   const style=d.createElement('style');style.textContent='html{font-size:150%!important}';d.head.append(style);
   const panel=d.querySelector('#home-panel');check(theme+' '+logo.id+' long name at 150% fits '+width+'px',panel.scrollWidth<=panel.clientWidth+1&&d.querySelector('h1').textContent===s.name);
  }
  for(const c of decorationChoices[theme]){
   s[theme+'Decoration']=c.id;frame.width=390;p.update(render(source,s),s,{air:true,mode:'voting',reset:true});await wait(350);
   const d=frame.contentDocument,nav=d.querySelector('.los-menu');let positions=[];
   for(const panel of ['home','music','support','info']){p.navigate(panel);await wait(200);positions.push(parseFloat(getComputedStyle(nav,'::after').left));}
   check(theme+' '+c.id+' follows each panel',positions.every((x,i)=>i===0||x>positions[i-1]));
   check(theme+' '+c.id+' uses chosen art without catching taps',getComputedStyle(nav,'::after').backgroundImage.includes(c.file)&&getComputedStyle(nav,'::after').pointerEvents==='none');
  }
  s.showNameOnHome=false;
  for(const air of [true,false])for(const mode of ['jukebox','voting']){
   p.update(render(source,s),s,{air,mode,reset:true});await wait(350);p.navigate('home');await wait(30);const d=frame.contentDocument,h=d.querySelector('h1');
   check(theme+' '+mode+' '+air+' hidden Home name retains accessible text',h.textContent===s.name&&h.getBoundingClientRect().width===1&&!!d.querySelector('.show-logo'));
  }
  s.showNameOnHome=true;
  for(const mode of ['jukebox','voting'])for(const index of [5,6]){
   p.update(render(source,s),s,{air:true,mode,reset:true});await wait(350);p.navigate('music');await wait(30);
   const d=frame.contentDocument,row=[...d.querySelectorAll('.los-song-list [role=button]')].find(r=>r.textContent.includes(themes[theme].demoSongs[index]));
   check(theme+' '+mode+' extra song '+index+' has no sash or disabled state',!!row&&getComputedStyle(row,'::after').content!=='"NEW"'&&row.getAttribute('aria-disabled')!=='true');
   row.click();await wait(50);
   check(theme+' '+mode+' extra song '+index+' requests normally',mode==='jukebox'?d.querySelector('.next-playlist').textContent.includes(themes[theme].demoSongs[index]):d.querySelector('[data-key="'+themes[theme].demoSongs[index]+'"]').nextElementSibling.textContent==='1');
  }
 }
}catch(e){check(e.stack,false);}finally{run.disabled=false;document.title=out.querySelectorAll('.fail').length+' failures — Artwork checks';}};
