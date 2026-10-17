import {cloneDefaults,render} from '../src/template.js';
import {createPreview} from '../src/preview.js';
const frame=document.querySelector('#viewer'),run=document.querySelector('#run'),results=document.querySelector('#results');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const visible=el=>!!el&&el.getClientRects().length>0;
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS — ':'FAIL — ')+name;results.append(li);};
run.onclick=async()=>{
 if(location.hostname!=='localhost')throw Error('Use isolated localhost.');
 run.disabled=true;results.replaceChildren();let notification='';
 try{
  const source=await(await fetch('../templates/christmas.html')).text(),adapter=createPreview(frame,text=>notification=text);
  for(const theme of ['christmas','halloween'])for(const mode of ['jukebox','voting'])for(const air of [true,false])for(const choice of ['download','listen','both'])for(const width of [320,390,1280]){
   const s=cloneDefaults(theme);Object.assign(s,{fm:true,pulsemesh:true,pulsemeshButtons:choice,pulsemeshUrl:'https://player.pulsemesh.io/',listening:'Please keep the footpath clear.\nYou can also listen near our speakers.'});
   frame.style.width=width+'px';adapter.update(render(source,s),s,{mode,air,reset:true});await wait(160);
   const d=frame.contentDocument,prefix=`${theme} ${mode} ${air?'on':'off'} ${choice} ${width}px`,count=choice==='both'?2:1;
   adapter.navigate('home');await wait(15);
   check(prefix+': Home has only chosen buttons when on air',[...d.querySelectorAll('#home-panel .pulsemesh-download')].filter(visible).length===(air?count:0));
   adapter.navigate('info');await wait(15);
   const faq=d.querySelector('#info-listening'),content=faq.querySelector('.linked-listening'),links=[...content.querySelectorAll('a')].filter(visible);
   check(prefix+': FAQ link choices and safe attributes',links.length===count&&links.every(a=>a.target==='_blank'&&a.rel.includes('noopener')&&a.rel.includes('noreferrer')));
   const fm=content.querySelector('.share-fm').getBoundingClientRect(),pulse=content.querySelector('.share-pulsemesh').getBoundingClientRect(),extra=content.querySelector('.other-listening').getBoundingClientRect();
   check(prefix+': FM, links and multiline instructions are separated',pulse.top>=fm.bottom+5&&extra.top>=pulse.bottom+5&&frame.contentWindow.getComputedStyle(content.querySelector('.other-listening')).whiteSpace==='pre-line');
   check(prefix+': FAQ fits without horizontal scrolling',faq.scrollWidth<=faq.clientWidth+1&&links.every(a=>a.scrollWidth<=a.clientWidth+1));
   const oldHash=frame.contentWindow.location.hash;notification='';links[0].click();await wait(10);check(prefix+': preview links stay isolated',notification.includes('External links are disabled')&&frame.contentWindow.location.hash===oldHash);
   if(width===320&&choice==='both'){
    const large=d.createElement('style');large.textContent='html{font-size:150%!important}';d.head.append(large);
    check(prefix+': enlarged FAQ text fits',faq.scrollWidth<=faq.clientWidth+1);
    if(air){adapter.navigate('home');await wait(15);const buttons=[...d.querySelectorAll('.pulsemesh-download')].filter(visible);check(prefix+': enlarged Home buttons fit',buttons.length===2&&buttons.every(a=>a.scrollWidth<=a.clientWidth+1));}
   }
  }
  const s=cloneDefaults();s.listening='Extra instructions only.\nSecond line.';adapter.update(render(source,s),s,{air:true,mode:'jukebox',reset:true});await wait(160);adapter.navigate('info');await wait(15);
  let d=frame.contentDocument;check('Extra instructions alone leave no empty FM or PulseMesh rows',[...d.querySelector('.linked-listening').children].filter(visible).length===1);
  s.listening='';adapter.update(render(source,s),s,{reset:true});await wait(160);adapter.navigate('info');await wait(15);d=frame.contentDocument;
  check('No listening options retain fallback text',frame.contentWindow.getComputedStyle(d.querySelector('.linked-listening'),'::after').content.includes('announced'));
 }catch(error){check(error.stack,false);}finally{run.disabled=false;document.title=results.querySelector('.fail')?'FAIL — Listening':'PASS — Listening';}
};
