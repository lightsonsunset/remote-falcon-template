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
  check('Template choices and exact username are clear',d.title==='Lights on Sunset Template Customiser'&&q('.brand-author').textContent==='by christmasdave'&&q('.intro').textContent.includes('Compact console'));
  check('Existing saved design resumes directly',!q('#template-dialog').open&&!q('#quick-tour').open);
  const initialSettings=localStorage.getItem(SETTINGS_KEY);
  const finishSetup=async(takeTour=false)=>{await click('#start-setup');for(let i=0;i<3;i++)await click('#setup-next');check('Tour choice starts unchecked on every opening',!q('#setup-take-tour').checked);if(takeTour)await click('#setup-take-tour');await click('#setup-next');};
  for(let repeat=0;repeat<2;repeat++){
   await finishSetup();check('Unchecked finish skips the tour on visit '+(repeat+1),!q('#quick-tour').open&&!q('#setup-wizard').open&&d.body.style.overflow==='');
   await finishSetup(true);check('Checked finish starts step one explicitly on visit '+(repeat+1),q('#quick-tour').matches(':modal')&&q('#tour-progress').textContent==='1 of 6'&&JSON.parse(localStorage.getItem(PREFS_KEY)).tourSeen===true);
   check('Tour introduces changing an existing theme',q('#tour-text').textContent.includes('Change your theme'));
   await click('#tour-skip');check('Tour skip restores scrolling and keeps applied settings',d.body.style.overflow===''&&localStorage.getItem(SETTINGS_KEY)===initialSettings);
  }
  await click('#theme');await load();d=frame.contentDocument;
  check('Editor preference survives reload without onboarding',d.documentElement.dataset.theme==='dark'&&!q('#quick-tour').open&&!q('#template-dialog').open);
  await click('[data-editor-group="music"]');await click('[data-device="tablet"]');await click('[data-mode="voting"]');await wait(300);
  const row=v().querySelector('[role="button"]:not(.sequence-unavailable)');row?.click();await wait(100);
  frame.contentWindow.scrollTo(0,200);await wait(100);
  const before={scrollY:frame.contentWindow.scrollY,settings:localStorage.getItem(SETTINGS_KEY),area:q('[data-editor-group].selected').dataset.editorGroup,hash:q('#preview').contentWindow.location.hash,html:q('#preview').srcdoc,details:[...d.querySelectorAll('.settings-pane details')].map(e=>e.open),device:q('[data-device].selected').dataset.device,mode:q('[data-mode].selected').dataset.mode};
  await click('#open-help');await click('#start-tour');check('Tour opens with progress and keyboard focus',q('#quick-tour').open&&q('#tour-progress').textContent==='1 of 6'&&d.activeElement===q('#tour-next'));
  for(let i=0;i<6;i++){
   const box=q('#tour-card').getBoundingClientRect(),spot=q('#tour-highlight').getBoundingClientRect();
   check('Tour step '+(i+1)+' fits and highlights a control',box.x>=0&&box.y>=0&&box.right<=frame.clientWidth+1&&box.bottom<=frame.clientHeight+1&&spot.width>0&&spot.height>0);
   if(i===3)check('Category step uses a compact filter illustration',!q('#tour-visual').hidden&&q('#tour-text').textContent.split(/\s+/).length<40&&q('#tour-visual').textContent.includes('order'));
   if(i<5)await click('#tour-next');
  }
  await click('#tour-back');check('Back returns to the previous explanation',q('#tour-progress').textContent==='5 of 6');await click('#tour-next');await click('#tour-next');
  check('Finish restores selected area and expanded sections',!q('#quick-tour').open&&q('[data-editor-group].selected').dataset.editorGroup===before.area&&JSON.stringify([...d.querySelectorAll('.settings-pane details')].map(e=>e.open))===JSON.stringify(before.details));
  check('Tour leaves show settings and demo frame untouched',before.settings===localStorage.getItem(SETTINGS_KEY)&&q('#preview').srcdoc===before.html&&q('#preview').contentWindow.location.hash===before.hash&&q('[data-device].selected').dataset.device===before.device&&q('[data-mode].selected').dataset.mode===before.mode);
  check('Finish restores launcher focus',d.activeElement===q('#open-help'));
  check('Finish restores editor scroll',Math.abs(frame.contentWindow.scrollY-before.scrollY)<2);
  await click('#open-help');await click('#start-tour');await click('#tour-next');q('#quick-tour').dispatchEvent(new Event('cancel',{cancelable:true}));await wait(100);check('Escape cancellation restores the previous area',!q('#quick-tour').open&&q('[data-editor-group].selected').dataset.editorGroup===before.area);
  for(const width of [320,390,650,1280]){
   frame.style.width=width+'px';await wait(150);await click('#open-help');await click('#start-tour');
   for(let i=0;i<6;i++){
    const c=q('#tour-card').getBoundingClientRect();check(`Tour ${i+1} fits ${width}px`,c.left>=0&&c.right<=width+1&&c.top>=0&&c.bottom<=frame.clientHeight+1);
    if(i===3)check('Category step uses a compact filter illustration',!q('#tour-visual').hidden&&q('#tour-text').textContent.split(/\s+/).length<40&&q('#tour-visual').textContent.includes('order'));
   if(i<5)await click('#tour-next');
   }
   await click('#tour-skip');check('Skip closes and restores narrow view '+width,!q('#quick-tour').open&&q('.workspace').dataset.view==='settings'&&d.documentElement.scrollWidth<=width+1);
  }
  await click('[data-editor-group="setup"]');await click('[data-season="halloween"]');check('Hero remains season-neutral',q('.intro h1').textContent==='Make your Remote Falcon page your own.'&&!q('#season-label'));
  check('Tour and welcome do not enter the viewer export',!q('#preview').srcdoc.includes('tour-card')&&!q('#preview').srcdoc.includes('welcome-features'));
 }catch(error){check(error.stack,false);}finally{
  for(const [key,value] of originals){if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);}await load();run.disabled=false;document.title=results.querySelector('.fail')?'FAIL — Tour':'PASS — Tour';
 }
};
