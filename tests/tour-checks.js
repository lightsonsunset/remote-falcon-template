import {SETTINGS_KEY,PREFS_KEY} from '../src/storage.js';
import {cloneDefaults,settingsFile} from '../src/template.js';
const frame=document.querySelector('#editor'),run=document.querySelector('#run'),results=document.querySelector('#results');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const load=()=>new Promise(r=>{frame.onload=()=>setTimeout(r,500);frame.contentWindow.location.reload();});
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS — ':'FAIL — ')+name;results.append(li);};
run.onclick=async()=>{
 if(location.hostname!=='localhost')throw Error('Use isolated localhost.');
 run.disabled=true;results.replaceChildren();const originals=[SETTINGS_KEY,PREFS_KEY].map(k=>[k,localStorage.getItem(k)]);
 try{
  localStorage.setItem(SETTINGS_KEY,settingsFile(cloneDefaults()));localStorage.removeItem(PREFS_KEY);await load();
  let d=frame.contentDocument,q=s=>d.querySelector(s),v=()=>q('#preview').contentDocument;
  const click=async s=>{q(s).click();await wait(150);};
  check('Named template and exact username are clear',d.title==='Lights on Sunset Template Customiser'&&q('.brand-author').textContent==='by christmasdave'&&q('.intro').textContent.includes('One layout'));
  check('First visit opens welcome, with setup focused and tour optional',q('#tour-welcome').open&&!q('#quick-tour').open&&d.activeElement===q('#welcome-setup'));
  check('Welcome blocks background interaction and explains features',q('#tour-welcome').matches(':modal')&&d.body.style.overflow==='hidden'&&q('.welcome-features').textContent.includes('category filters'));
  const initialSettings=localStorage.getItem(SETTINGS_KEY);
  await click('#welcome-skip');check('Start editing remembers dismissal without changing settings',!q('#tour-welcome').open&&JSON.parse(localStorage.getItem(PREFS_KEY)).tourSeen===true&&localStorage.getItem(SETTINGS_KEY)===initialSettings&&d.body.style.overflow==='');
  await click('#theme');await load();d=frame.contentDocument;
  check('Theme preference and welcome dismissal survive reload',d.documentElement.dataset.theme==='dark'&&!q('#tour-welcome').open);
  for(const action of ['close','escape','tour']){
   localStorage.setItem(PREFS_KEY,JSON.stringify({theme:'dark'}));await load();d=frame.contentDocument;
   if(action==='escape'){q('#tour-welcome').dispatchEvent(new Event('cancel',{cancelable:true}));await wait(100);}
   else await click(action==='close'?'#welcome-close':'#welcome-tour');
   check('Welcome '+action+' remembers choice and closes welcome',!q('#tour-welcome').open&&JSON.parse(localStorage.getItem(PREFS_KEY)).tourSeen===true);
   if(action==='tour'){check('Welcome transitions directly into step one',q('#quick-tour').open&&q('#tour-progress').textContent==='1 of 6');await click('#tour-skip');}
   check('Welcome '+action+' restores scrolling and keeps settings',d.body.style.overflow===''&&localStorage.getItem(SETTINGS_KEY)===initialSettings);
   await load();d=frame.contentDocument;check('Welcome '+action+' stays dismissed on reload',!q('#tour-welcome').open);
  }
  for(const [width,height] of [[320,568],[390,844],[1280,900]]){
   frame.style.width=width+'px';frame.style.height=height+'px';localStorage.setItem(PREFS_KEY,JSON.stringify({theme:'light'}));await load();d=frame.contentDocument;
   const box=q('#tour-welcome').getBoundingClientRect();check('Welcome fits '+width+' × '+height,box.left>=0&&box.right<=width+1&&box.top>=0&&box.bottom<=height+1&&d.documentElement.scrollWidth<=width+1);
   await click('#welcome-skip');
  }
  await click('[data-editor-group="music"]');await click('[data-device="tablet"]');await click('[data-mode="voting"]');await wait(300);
  const row=v().querySelector('[role="button"]:not(.sequence-unavailable)');row?.click();await wait(100);
  frame.contentWindow.scrollTo(0,200);await wait(100);
  const before={scrollY:frame.contentWindow.scrollY,settings:localStorage.getItem(SETTINGS_KEY),area:q('[data-editor-group].selected').dataset.editorGroup,hash:q('#preview').contentWindow.location.hash,html:q('#preview').srcdoc,details:[...d.querySelectorAll('.settings-pane details')].map(e=>e.open),device:q('[data-device].selected').dataset.device,mode:q('[data-mode].selected').dataset.mode};
  await click('#start-tour');check('Tour opens with progress and keyboard focus',q('#quick-tour').open&&q('#tour-progress').textContent==='1 of 6'&&d.activeElement===q('#tour-next'));
  for(let i=0;i<6;i++){
   const box=q('#tour-card').getBoundingClientRect(),spot=q('#tour-highlight').getBoundingClientRect();
   check('Tour step '+(i+1)+' fits and highlights a control',box.x>=0&&box.y>=0&&box.right<=frame.clientWidth+1&&box.bottom<=frame.clientHeight+1&&spot.width>0&&spot.height>0);
   if(i<5)await click('#tour-next');
  }
  await click('#tour-back');check('Back returns to the previous explanation',q('#tour-progress').textContent==='5 of 6');await click('#tour-next');await click('#tour-next');
  check('Finish restores selected area and expanded sections',!q('#quick-tour').open&&q('[data-editor-group].selected').dataset.editorGroup===before.area&&JSON.stringify([...d.querySelectorAll('.settings-pane details')].map(e=>e.open))===JSON.stringify(before.details));
  check('Tour leaves show settings and demo frame untouched',before.settings===localStorage.getItem(SETTINGS_KEY)&&q('#preview').srcdoc===before.html&&q('#preview').contentWindow.location.hash===before.hash&&q('[data-device].selected').dataset.device===before.device&&q('[data-mode].selected').dataset.mode===before.mode);
  check('Finish restores launcher focus',d.activeElement===q('#start-tour'));
  check('Finish restores editor scroll',Math.abs(frame.contentWindow.scrollY-before.scrollY)<2);
  await click('#start-tour');await click('#tour-next');q('#quick-tour').dispatchEvent(new Event('cancel',{cancelable:true}));await wait(100);check('Escape cancellation restores the previous area',!q('#quick-tour').open&&q('[data-editor-group].selected').dataset.editorGroup===before.area);
  for(const width of [320,390,650,1280]){
   frame.style.width=width+'px';await wait(150);await click('#start-tour');
   for(let i=0;i<6;i++){
    const c=q('#tour-card').getBoundingClientRect();check(`Tour ${i+1} fits ${width}px`,c.left>=0&&c.right<=width+1&&c.top>=0&&c.bottom<=frame.clientHeight+1);
    if(i<5)await click('#tour-next');
   }
   await click('#tour-skip');check('Skip closes and restores narrow view '+width,!q('#quick-tour').open&&q('.workspace').dataset.view==='settings'&&d.documentElement.scrollWidth<=width+1);
  }
  await click('[data-editor-group="setup"]');await click('[data-season="halloween"]');check('Hero remains season-neutral',q('.intro h1').textContent==='Your show. Your colours. Your way.'&&!q('#season-label'));
  check('Tour and welcome do not enter the viewer export',!q('#preview').srcdoc.includes('tour-card')&&!q('#preview').srcdoc.includes('welcome-features'));
 }catch(error){check(error.stack,false);}finally{
  for(const [key,value] of originals){if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);}await load();run.disabled=false;document.title=results.querySelector('.fail')?'FAIL — Tour':'PASS — Tour';
 }
};
