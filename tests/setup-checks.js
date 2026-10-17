import {SETTINGS_KEY,PREFS_KEY} from '../src/storage.js';
import {cloneDefaults,settingsFile,parseSettings,render} from '../src/template.js';
const frame=document.querySelector('#editor'),run=document.querySelector('#run'),results=document.querySelector('#results');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const load=()=>new Promise(resolve=>{frame.onload=()=>setTimeout(resolve,550);frame.contentWindow.location.reload();});
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS — ':'FAIL — ')+name;results.append(li);};
run.onclick=async()=>{
 if(location.hostname!=='localhost')throw Error('Use isolated localhost.');
 run.disabled=true;results.replaceChildren();const original=[SETTINGS_KEY,PREFS_KEY].map(k=>[k,localStorage.getItem(k)]);
 try{
  const initial=cloneDefaults();initial.donations=true;initial.donationUrl='';initial.newNames='My special song';initial.copy.SUCCESS_TITLE='Custom success';initial.playlistsMusic=true;initial.playlists=[{icon:'spotify',title:'My playlist',description:'My songs',url:'https://open.spotify.com/'}];
  localStorage.setItem(SETTINGS_KEY,settingsFile(initial));localStorage.removeItem(PREFS_KEY);await load();
  let d=frame.contentDocument;const q=s=>d.querySelector(s),click=async s=>{q(s).click();await wait(100);};
  const input=(s,value)=>{const el=q(s);if(el.type==='checkbox')el.checked=value;else el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));};
  const saved=()=>localStorage.getItem(SETTINGS_KEY),start=async()=>{await click('#start-setup');};
  check('Welcome offers setup, editor and smaller tour link',q('#tour-welcome').open&&d.activeElement===q('#welcome-setup')&&q('#welcome-skip').textContent==='Open the editor'&&q('#welcome-tour').closest('.welcome-tour-link'));
  const originalSettings=saved();await click('#welcome-setup');
  check('Welcome starts focused modal setup and remembers choice',!q('#tour-welcome').open&&q('#setup-wizard').matches(':modal')&&d.activeElement===q('#setup-title')&&JSON.parse(localStorage.getItem(PREFS_KEY)).tourSeen);
  input('#setup-name','Cancelled name');await click('[data-setup-theme="halloween"]');await click('#setup-cancel');
  check('Cancel restores scroll and applies no draft/theme edits',saved()===originalSettings&&!q('#setup-wizard').open&&d.body.style.overflow==='');
  await start();check('Reopen starts with saved name',q('#setup-name').value===initial.name);
  input('#setup-name','');await click('#setup-next');check('Name validation stays on step one and focuses field',q('#setup-progress').textContent==='Step 1 of 4'&&d.activeElement===q('#setup-name')&&q('#setup-error-name').textContent);
  await click('#setup-skip');check('Skip restores invalid step to original values',q('#setup-progress').textContent==='Step 2 of 4');
  input('#setup-dates','Discard these dates');await click('#setup-add-row');input('[data-setup-row="3"][data-part="day"]','Holiday');input('[data-setup-row="3"][data-part="hours"]','Late');await click('#setup-skip');await click('#setup-back');
  check('Add later preserves existing dates and schedule',q('#setup-dates').value===initial.dates&&d.querySelectorAll('[data-setup-remove]').length===3);
  await click('#setup-back');await click('[data-setup-theme="halloween"]');input('#setup-name','Our "A&B" Lights');input('#setup-welcome','Hello neighbours');input('#setup-logoMode','custom');input('#setup-logo','http://example.org/logo.png');await click('#setup-next');
  check('Unsafe logo link is blocked with an inline error',q('#setup-progress').textContent==='Step 1 of 4'&&q('#setup-error-logo').textContent);
  input('#setup-logo','www.example.org/logo.png');q('#setup-logo').dispatchEvent(new Event('focusout',{bubbles:true}));check('Bare www logo completes using editor rules',q('#setup-logo').value==='https://www.example.org/logo.png');
  input('#setup-logoMode','seasonal');await click('#setup-next');input('#setup-dates','24–31 October');input('[data-setup-row="0"][data-part="hours"]','7pm–9pm');await click('#setup-add-row');input('[data-setup-row="3"][data-part="day"]','School holidays');input('[data-setup-row="3"][data-part="hours"]','Until late');await click('#setup-next');
  input('[data-setup-key="fm"]',true);input('#setup-frequency','invalid');await click('#setup-next');check('FM validates only when enabled',q('#setup-progress').textContent==='Step 3 of 4'&&q('#setup-error-frequency').textContent);input('#setup-frequency','99.1');input('[data-setup-key="pulsemesh"]',true);
  check('Legacy setup defaults to download-only and artwork on',q('#setup-pulsemeshButtons').value==='download'&&q('#setup-pulsemesh-link').hidden&&q('[data-setup-key="showAlbumArtwork"]').checked);
  input('#setup-pulsemeshButtons','both');await click('#setup-next');check('Both buttons require a display link',q('#setup-progress').textContent==='Step 3 of 4'&&q('#setup-error-pulsemeshUrl').textContent&&d.activeElement===q('#setup-pulsemeshUrl'));
  input('#setup-pulsemeshUrl','javascript:alert(1)');await click('#setup-next');check('Unsafe display link is blocked',q('#setup-progress').textContent==='Step 3 of 4'&&q('#setup-error-pulsemeshUrl').textContent);
  input('#setup-pulsemeshUrl','https://player.pulsemesh.io/');input('[data-setup-key="showAlbumArtwork"]',false);input('#setup-listening','Or use our speakers');await click('#setup-next');
  check('Review includes display link and artwork choice',q('#setup-content').textContent.includes('Listen on PulseMesh: https://player.pulsemesh.io/')&&q('#setup-content').textContent.includes('hidden — text-only cards'));
  check('Review shows theme, schedule, both listening choices and next steps',q('#setup-content').textContent.includes('Halloween')&&q('#setup-content').textContent.includes('Until late')&&q('#setup-content').textContent.includes('99.1 FM')&&q('#setup-content').textContent.includes('Download PulseMesh')&&q('#setup-content').textContent.includes('NEW sashes'));
  check('No settings are saved before Apply',saved()===originalSettings);
  await click('#setup-back');check('Back retains listening answers',q('#setup-frequency').value==='99.1'&&q('[data-setup-key="pulsemesh"]').checked);await click('#setup-next');await click('#setup-next');await wait(350);
  const applied=parseSettings(saved(),true);
  check('Apply saves both buttons, link and artwork choice',applied.pulsemeshButtons==='both'&&applied.pulsemeshUrl==='https://player.pulsemesh.io/'&&!applied.showAlbumArtwork);
  check('Apply saves settings and opens Home in preview',applied.name==='Our "A&B" Lights'&&applied.theme==='halloween'&&applied.schedule.length===4&&!q('#setup-wizard').open&&q('[data-editor-group="home"]').classList.contains('selected')&&q('#preview').contentWindow.location.hash==='#home-panel');
  check('Unrelated incomplete support, custom text and NEW settings are retained',applied.donations&&applied.donationUrl===''&&applied.newNames===initial.newNames&&applied.copy.SUCCESS_TITLE===initial.copy.SUCCESS_TITLE&&JSON.stringify(applied.playlists)===JSON.stringify(initial.playlists));
  check('Existing unrelated errors stay visible without preventing setup',q('#copy').disabled&&!q('#validation-summary').hidden&&!q('#setup-result').hidden);
  await load();d=frame.contentDocument;await start();check('Applied settings survive reload and prefill reopened wizard',q('#setup-name').value===applied.name&&q('#setup-logoMode').value==='seasonal');q('#setup-wizard').dispatchEvent(new Event('cancel',{cancelable:true}));await wait(80);check('Escape cancels and returns focus to launcher',!q('#setup-wizard').open&&d.activeElement===q('#start-setup')&&saved()===settingsFile(applied));
  await start();await click('#setup-next');await click('#setup-back');input('#setup-name','');await click('#setup-skip'); // returns to valid entry
  check('Skipping on a revisit keeps the step-entry answers',q('#setup-progress').textContent==='Step 2 of 4');await click('#setup-cancel');
  await start();await click('#setup-skip');await click('#setup-skip');
  check('Music choices restore on reopening',q('#setup-pulsemeshButtons').value==='both'&&q('#setup-pulsemeshUrl').value===applied.pulsemeshUrl&&!q('[data-setup-key="showAlbumArtwork"]').checked);
  input('#setup-pulsemeshButtons','download');check('Download-only hides link without clearing it',q('#setup-pulsemesh-link').hidden&&q('#setup-pulsemeshUrl').value===applied.pulsemeshUrl);input('#setup-pulsemeshButtons','listen');input('#setup-pulsemeshUrl','https://example.org/changed');input('[data-setup-key="showAlbumArtwork"]',true);await click('#setup-skip');await click('#setup-back');
  check('Skip restores all music settings together',q('#setup-pulsemeshButtons').value==='both'&&q('#setup-pulsemeshUrl').value===applied.pulsemeshUrl&&!q('[data-setup-key="showAlbumArtwork"]').checked);
  input('#setup-pulsemeshButtons','listen');input('#setup-pulsemeshUrl','https://example.org/cancelled');input('[data-setup-key="showAlbumArtwork"]',true);await click('#setup-close');check('Closing cancels URL, button and artwork edits',saved()===settingsFile(applied));
  for(const [width,height] of [[320,568],[390,844],[768,1024],[1280,900]]){
   frame.style.width=width+'px';frame.style.height=height+'px';await wait(100);await start();
   for(let i=0;i<4;i++){
    const box=q('#setup-wizard').getBoundingClientRect();check(`Step ${i+1} fits ${width} × ${height}`,box.left>=0&&box.right<=width+1&&box.top>=0&&box.bottom<=height+1&&q('#setup-wizard').scrollWidth<=q('#setup-wizard').clientWidth+1);
    if(i<3)await click('#setup-next');
   }
   await click('#setup-cancel');
  }
  await click('#theme');await start();check('Wizard uses dark editor colours',d.documentElement.dataset.theme==='dark'&&frame.contentWindow.getComputedStyle(q('#setup-wizard')).backgroundColor==='rgb(26, 41, 34)');await click('#setup-close');
  frame.style.width='320px';frame.style.height='568px';const larger=d.createElement('style');larger.textContent='#setup-wizard button,#setup-wizard input,#setup-wizard textarea,#setup-wizard select,#setup-wizard p,#setup-wizard span,#setup-wizard strong,#setup-wizard small,#setup-wizard dd,#setup-wizard dt{font-size:20px!important}';d.head.append(larger);await start();
  for(let i=0;i<4;i++){check('Larger text has no horizontal overflow on compact step '+(i+1),q('#setup-wizard').scrollWidth<=q('#setup-wizard').clientWidth+1);if(i<3)await click('#setup-next');}await click('#setup-cancel');larger.remove();
  // Storage denial is local to this mounted editor and restored immediately afterwards.
  const win=frame.contentWindow,oldSet=win.Storage.prototype.setItem;win.Storage.prototype.setItem=function(){throw Error('Storage unavailable');};
  try{await start();input('#setup-name','Unsaved but editable');for(let i=0;i<4;i++)await click('#setup-next');check('Storage failure still applies to editable form and reports not saved',q('[data-key="name"]').value==='Unsaved but editable'&&q('#save-status').textContent==='Not saved locally');}finally{win.Storage.prototype.setItem=oldSet;}
  const valid=structuredClone(applied);valid.donations=false;valid.playlistsMusic=false;const html=render(await(await fetch('../templates/christmas.html')).text(),valid);check('Wizard data uses native renderer without setup scripts or controls',html.includes('99.1')&&!/setup-wizard|welcome-setup|<script|Demo:/.test(html));
 }catch(error){check(error.stack,false);}finally{
  for(const [key,value] of original){if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);}await load();run.disabled=false;document.title=results.querySelector('.fail')?'FAIL — Setup':'PASS — Setup';
 }
};
