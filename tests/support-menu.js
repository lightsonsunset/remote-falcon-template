import {cloneDefaults,render,supportCardDefaults} from '../src/template.js';
import {createPreview} from '../src/preview.js';
const frame=document.querySelector('#viewer'),run=document.querySelector('#run'),results=document.querySelector('#results');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const visible=el=>!!el&&el.getClientRects().length>0;
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS — ':'FAIL — ')+name;results.append(li);};
run.onclick=async()=>{
 if(location.hostname!=='localhost')throw Error('Use isolated localhost.');
 run.disabled=true;results.replaceChildren();
 try{
  const source=await(await fetch('../templates/christmas.html')).text(),adapter=createPreview(frame,()=>{});
  for(const theme of ['christmas','halloween'])for(const mode of ['jukebox','voting'])for(const air of [true,false])for(const width of [320,390,1280])for(const shown of [true,false]){
   const s=cloneDefaults(theme);Object.assign(s,{showSupportTab:shown,decorations:true,categories:true,newFilter:true,donations:true,donationUrl:'https://example.org/give',donationHome:true,donationInfo:true,fm:true});
   s.donationRecipients=[{name:'Community creator',description:'Meet our local makers.',url:'https://example.org/creator',image:'',home:true,info:true,...supportCardDefaults}];
   frame.style.width=width+'px';adapter.update(render(source,s),s,{mode,air,reset:true});await wait(180);
   const d=frame.contentDocument,w=frame.contentWindow,nav=d.querySelector('.los-menu'),items=[...nav.children].filter(visible),prefix=`${theme} ${mode} ${air?'on':'off'} ${width}px ${shown?'shown':'hidden'}`;
   check(prefix+': visible buttons fill equal columns',items.length===(shown?4:3)&&Math.max(...items.map(e=>e.getBoundingClientRect().width))-Math.min(...items.map(e=>e.getBoundingClientRect().width))<1&&items.every(e=>e.getBoundingClientRect().height>=44));
   check(prefix+': hidden Support is not focusable',shown||(()=>{nav.querySelector('[data-tab-target="support"]').focus();return d.activeElement!==nav.querySelector('[data-tab-target="support"]');})());
   for(const [hash,index] of [['#home-panel',0],['#music-panel',1],['#songs-category-2',1],['#info-panel',shown?3:2],['#info-listening',shown?3:2]]){
    w.location.hash=hash;
    const aligned=()=>{const style=w.getComputedStyle(nav,'::after');return Math.abs(nav.getBoundingClientRect().left+parseFloat(style.left)+34-(items[index].getBoundingClientRect().right-4))<3;};
    for(let attempt=0;attempt<30&&!aligned();attempt++)await wait(25);
    check(prefix+' '+hash+': decoration follows visible button',aligned()&&w.getComputedStyle(nav,'::after').pointerEvents==='none');
   }
   adapter.navigate('support');await wait(25);
   check(prefix+': direct Support target retains both full cards',visible(d.querySelector('#support-panel'))&&d.querySelectorAll('#support-panel .support-action').length===2&&(shown||w.getComputedStyle(nav,'::after').content==='none'));
   for(const page of ['home','info']){
    adapter.navigate(page);await wait(20);
    const links=[...d.querySelectorAll('#'+page+'-panel a.donation-card')].filter(visible);
    check(prefix+' '+page+': both cards retain recipient destinations',links.length===2&&links.some(a=>a.href==='https://example.org/give')&&links.some(a=>a.href==='https://example.org/creator'));
   }
   if(width===320){
    const style=d.createElement('style');style.textContent='html{font-size:150%!important}';d.head.append(style);
    check(prefix+': enlarged menu fits',nav.scrollWidth<=nav.clientWidth+1&&items.every(e=>e.scrollWidth<=e.clientWidth+1));
   }
   check(prefix+': motion preference retained',w.getComputedStyle(nav,'::after').transitionDuration===(w.matchMedia('(prefers-reduced-motion: reduce)').matches?'0s':'0.18s'));
  }
  const s=cloneDefaults();s.showSupportTab=false;s.decorations=true;adapter.update(render(source,s),s,{air:true,mode:'jukebox',reset:true});await wait(180);
  adapter.navigate('music');await wait(20);adapter.navigate('support');await wait(20);adapter.navigate('info');await wait(20);
  frame.contentWindow.history.back();await wait(200);check('Back retains a direct Support page with its menu hidden',frame.contentWindow.location.hash==='#support-panel'&&visible(frame.contentDocument.querySelector('#support-panel')));
  frame.contentWindow.history.forward();await wait(200);check('Forward returns to Info in the third menu position',frame.contentWindow.location.hash==='#info-panel'&&frame.contentWindow.getComputedStyle(frame.contentDocument.querySelector('.los-menu')).getPropertyValue('--nav-decoration-index').trim()==='2');
 }catch(error){check(error.stack,false);}finally{run.disabled=false;document.title=results.querySelector('.fail')?'FAIL — Support menu':'PASS — Support menu';}
};
