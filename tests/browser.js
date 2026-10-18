import {cloneDefaults,render,renderDraft,themes} from '../src/template.js';
import {createPreview,messageExamples} from '../src/preview.js';
import {viewports} from '../src/viewports.js';
const frame=document.getElementById('test'),results=document.getElementById('results');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const visible=e=>!!e&&e.getClientRects().length>0&&getComputedStyle(e).visibility!=='hidden';
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS — ':'FAIL — ')+name;results.append(li);};
document.getElementById('run').onclick=async()=>{
 results.replaceChildren();const button=document.getElementById('run');button.disabled=true;
 try{
 const source=await (await fetch('../templates/christmas.html')).text(),adapter=createPreview(frame,()=>{});
 for(const theme of Object.keys(themes)){
 const starter=cloneDefaults(theme),starterHTML=render(source,starter);
 for(const mode of ['jukebox','voting']){
  await adapter.update(starterHTML,starter,{mode,air:true});
  adapter.navigate('music');await wait(30);
  const d=frame.contentDocument,rows=[...d.querySelectorAll('.los-song-list [role=button]')];
  check(theme+' '+mode+': two sample sashes with no user NEW assignments',rows.filter(r=>getComputedStyle(r,'::after').content==='"NEW"').length===2&&starter.newNames==='');
 }
 check(theme+': sample sashes never enter the exported template',!starterHTML.includes('data-demo-new')&&themes[theme].demoSongs.every(name=>!starterHTML.includes(name)));
 const s=cloneDefaults(theme);Object.assign(s,{fm:true,pulsemesh:true,listening:'Please bring headphones.',categories:true,newFilter:true,newNames:'New "quotes" & a \\ backslash\n'+themes[theme].demoSongs[2],notice:true,noticeTitle:'Tonight’s notice',noticeText:'A short message for visitors.',donations:true,donationHome:true,donationInfo:true,charity:'A local charity',donationText:'Help our community.',donationUrl:'https://example.org/donate',homeCard:true,homeCardTitle:'Photo spot',homeCardText:'Try our selfie wings.'});
 Object.assign(s,{logoMode:'seasonal',decorations:true,homeLiveSchedule:true,neighbourText:'Please keep driveways clear.\nEnjoy the lights together.'});
 s.copy={LISTEN_TITLE:'Listen to our seasonal magic',SUCCESS_TITLE:'A brilliant pick!',SUCCESS_JUKEBOX:'Your choice is queued. Enjoy the show!',SUCCESS_VOTING:'Your vote is counted. Enjoy the show!'};
 const html=render(source,s);
 for(const {width,height} of Object.values(viewports).flat()){
  frame.style.width=width+'px';frame.style.height=height+'px';
  for(const mode of ['jukebox','voting'])for(const air of [true,false]){
   await adapter.update(html,s,{mode,air,reset:true});
   const d=frame.contentDocument;
   for(const panel of ['home','music','support','info']){
    d.querySelector(`.los-menu a[href="#${panel}-panel"]`).click();await wait(30);
    const el=d.getElementById(panel+'-panel');
    check(`${width}px ${mode} ${air?'on':'off'} ${panel}: visible, no horizontal overflow`,visible(el)&&el.scrollWidth<=el.clientWidth+1);
   }
   check(`${width}px ${mode} ${air?'on':'off'}: notice survives all availability states`,d.getElementById('show-notice').hidden===false);
   d.querySelector('.los-menu a[href="#home-panel"]').click();await wait(30);
   check(`${theme} ${width}px ${mode} ${air?'on':'off'}: live Home schedule follows availability`,[...d.querySelectorAll('.live-schedule')].filter(visible).length===(air?1:0));
   check(`${width}px ${mode} ${air?'on':'off'}: both donation/listening copies rendered safely`,d.querySelectorAll('a[href="https://example.org/donate"]').length===(air?3:3));
   d.querySelector('.los-menu a[href="#music-panel"]').click();await wait(30);
   check(`${width}px ${mode} ${air?'on':'off'}: correct picker state`,visible(d.querySelector('.los-song-list'))===air || (!air&&!d.querySelector('.los-song-list')));
   if(!air)continue;
   const list=d.querySelector('.los-song-list');
   d.querySelector('.music-filter a[href="#songs-new"]').click();await wait(30);
   const rows=[...list.querySelectorAll('[role=button]')].filter(visible);
   check(`${width}px ${mode}: NEW filter and escaped-name sash`,rows.length===4&&rows.every(r=>getComputedStyle(r,'::after').content==='"NEW"'));
   check(`${width}px ${mode}: unavailable NEW song stays disabled`,rows.some(r=>r.classList.contains('sequence-unavailable')&&r.getAttribute('aria-disabled')==='true'));
   d.querySelector('.music-filter a[href="#songs-category-2"]').click();await wait(30);
   check(`${width}px ${mode}: second category filter`,[...list.querySelectorAll('[role=button]')].filter(visible).every(r=>r.closest('.category-section')===list.querySelectorAll('.category-section')[1]));
   d.querySelector('.music-filter a[href="#songs-all"]').click();await wait(30);
   const card=list.querySelectorAll('[role=button]')[1];card.click();await wait(30);
   const message=d.getElementById('requestSuccessful');
   check(`${width}px ${mode}: customised confirmation title and helper`,message.textContent.includes(s.copy.SUCCESS_TITLE)&&message.textContent.includes(s.copy[mode==='jukebox'?'SUCCESS_JUKEBOX':'SUCCESS_VOTING']));
   check(`${width}px ${mode}: visible confirmation intercepts screen taps`,visible(message)&&!!d.elementFromPoint(width/2,height-44)?.closest('.request-feedback'));
   const box=message.firstElementChild.getBoundingClientRect();check(`${width}px ${mode}: confirmation remains a compact centred card`,box.height<Math.min(500,height-32)&&Math.abs(box.y+box.height/2-height/2)<2);
   check(`${theme} ${width}px ${mode}: demo interaction updates queue/vote`,mode==='jukebox'?(d.querySelector('.next-playlist').textContent.includes(themes[theme].demoSongs[1]) && !d.querySelector('.jukebox-queue-container').textContent.trim()):d.querySelector(`[data-key="${themes[theme].demoSongs[1]}"]`).nextElementSibling.textContent==='1');
   d.getElementById('music-panel').scrollTop=230;const before=d.getElementById('music-panel').scrollTop;
   await adapter.update(render(source,{...s,welcome:'Edited welcome'}),s,{mode,air});
   check(`${width}px ${mode}: ordinary edits retain panel and scroll`,frame.contentWindow.location.hash==='#songs-all'&&Math.abs(frame.contentDocument.getElementById('music-panel').scrollTop-before)<=1);
  }
 }
 frame.style.width='320px';frame.style.height='844px';const long={...s,name:'A very long Christmas show name shared with our neighbourhood & friends',newNames:'An extraordinarily long sequence name with many words and unusual characters "雪" & sparkle'.repeat(2)};
 long.copy={...s.copy,NAV_HOME:'Welcome & lights',NAV_MUSIC:'Choose the music',NAV_SUPPORT:'Support our show',NAV_INFO:'Show information'};
 await adapter.update(render(source,long),long,{air:true,mode:'voting',reset:true});
 const d=frame.contentDocument;const large=d.createElement('style');large.textContent='html{font-size:150%!important}';d.head.append(large);
 for(const panel of ['home','music','support','info']){d.querySelector(`a[href="#${panel}-panel"]`).click();await wait(30);const el=d.getElementById(panel+'-panel');check(`320px enlarged text / long content: ${panel}`,el.scrollWidth<=el.clientWidth+1);}
 check(`${theme}: customised listening title appears in both RF mode blocks`,html.split('Listen to our seasonal magic').length===3);
 check(`${theme}: long navigation labels fit at 320px with enlarged text`,[...d.querySelectorAll('.los-menu a')].every(el=>el.scrollWidth<=el.clientWidth+1));
 const detached=new DOMParser().parseFromString(html,'text/html');check('Export contains no preview songs, executable content or event attributes',!detached.querySelector('script')&&![...detached.querySelectorAll('*')].some(el=>[...el.attributes].some(a=>/^on/i.test(a.name)))&&!html.includes(themes[theme].demoSongs[0]));
 const custom={...s,categoryNames:['Family & friends','Spooky classics','A very long third category name','Dance'],donationImage:'',donationUrl:'www.example.org'};
 for(const mode of ['jukebox','voting']){
   const draft=renderDraft(source,custom);await adapter.update(draft.html,draft.settings,{air:true,mode,reset:true});
   const d=frame.contentDocument;
   for(let i=1;i<=4;i++){d.querySelector(`a[href="#songs-category-${i}"]`).click();await wait(30);const groups=[...d.querySelectorAll('.category-section')].filter(visible);check(`${theme} ${mode} category ${i}: matches its ordered section`,groups.length===1&&groups[0].querySelector('.category-label').textContent===custom.categoryNames[i-1]);}
   d.querySelector('a[href="#support-panel"]').click();await wait(30);check(`${theme} ${mode}: unfinished donation URL still renders donation details`,visible(d.querySelector('.support-card.share-donation')));
   await adapter.update(draft.html,draft.settings,{air:false,mode});check(`${theme} ${mode}: unfinished donation URL does not freeze availability`,!frame.contentDocument.querySelector('.los-song-list'));
   for(const example of messageExamples.filter(m=>m.modes.includes(mode))){
     await adapter.update(html,s,{air:true,mode,reset:true});const d=frame.contentDocument;d.querySelector('a[href="#songs-all"]').click();await wait(30);
     d.querySelector(`[data-demo-message="${example.id}"]`).click();await wait(30);const message=d.getElementById(example.id);
     check(`${theme} ${mode}: ${example.id} is visible and blocks underlying taps`,visible(message)&&!!d.elementFromPoint(160,800)?.closest('.request-feedback'));
   }
 }
 for(const home of [true,false])for(const info of [true,false]){
   const placement={...s,donationHome:home,donationInfo:info};await adapter.update(render(source,placement),placement,{air:true,mode:'jukebox',reset:true});const d=frame.contentDocument;
   for(const [panel,show] of [['home',home],['support',true],['info',info]]){d.querySelector(`a[href="#${panel}-panel"]`).click();await wait(30);check(`${theme}: donation ${panel} ${show}`, [...d.querySelectorAll(`#${panel}-panel .share-donation`)].some(visible)===show);}
 }
 }
 }catch(err){check(err.stack,false);}finally{button.disabled=false;document.title=`${results.querySelectorAll('.fail').length} failures · Builder browser checks`;}
};
