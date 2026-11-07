import {registry} from '../src/template-registry.js';
import {createDesignStore} from '../src/design-store.js';
const frame=document.querySelector('#editor'),run=document.querySelector('#run'),results=document.querySelector('#results'),status=document.querySelector('#status');
const wait=ms=>new Promise(r=>setTimeout(r,ms)),q=s=>frame.contentDocument.querySelector(s),qa=s=>[...frame.contentDocument.querySelectorAll(s)],read=()=>createDesignStore(localStorage).read().settings;
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS - ':'FAIL - ')+name;results.append(li);};
const reload=()=>new Promise(r=>{frame.onload=()=>setTimeout(r,700);frame.contentWindow.location.reload();});
const click=async s=>{q(s).click();await wait(100);};
const input=async(s,value)=>{const el=q(s);if(el.type==='checkbox')el.checked=value;else el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));await wait(450);};
run.onclick=async()=>{
 if(location.hostname!=='localhost'||['4188','4198','4302'].includes(location.port))throw Error('Use a disposable localhost test origin.');
 const saved=Object.entries(localStorage);run.disabled=true;results.replaceChildren();
 try{for(const t of registry)for(const width of [390,1280]){
  localStorage.clear();const store=createDesignStore(localStorage);store.select(t.id,'christmas');store.save({settings:t.cloneDefaults('christmas'),catalogue:null});frame.style.width=width+'px';await reload();const tag=t.id+' '+width;status.textContent=tag;
  check(tag+' starts with all sections collapsed',qa('#settings details[data-section]').every(d=>!d.open));
  for(const group of Object.keys(t.groups)){
   await click('[data-editor-group="'+group+'"]');check(tag+' '+group+' does not auto-expand',qa('#settings details[data-section]').filter(d=>!d.hidden).every(d=>!d.open));
   check(tag+' '+group+' is selected',q('[data-editor-group="'+group+'"]').getAttribute('aria-pressed')==='true');
  }
  await click('[data-editor-group="'+t.landing+'"]');await click('[data-section="11"] > summary');check(tag+' Welcome opens manually',q('[data-section="11"]').open);
  await click('[data-editor-group="info"]');await click('[data-editor-group="'+t.landing+'"]');check(tag+' manual expansion survives returning',q('[data-section="11"]').open);
  await click('[data-section="11"] > summary');await click('[data-editor-group="info"]');await click('[data-editor-group="'+t.landing+'"]');check(tag+' manual collapse survives returning',!q('[data-section="11"]').open);
  check(tag+' no Music controls inside Welcome',!q('[data-section="11"] [data-key="homeMusicLink"]')&&!q('[data-section="11"] [data-icon-role="musicLink"]'));
  if(t.features.homeMusicLink!==false){
   check(tag+' separate Music section starts collapsed',q('[data-section="34"]')&&!q('[data-section="34"]').open&&!q('[data-section="34"]').hidden);
   await click('[data-section="34"] > summary');await click('[data-copy-group="icons-musicLink"] > summary');await click('[data-icon-role="musicLink"]');await click('[data-pick-icon="headphones"]');await wait(450);
   check(tag+' icon update preserves only manual sections',q('[data-section="34"]').open&&!q('[data-section="11"]').open&&read().icons.musicLink==='headphones');
   await input('[data-copy="HOME_JUKEBOX_HELP"]','Our custom request help');await input('[data-key="homeMusicLink"]',false);
   check(tag+' hide retains icon and text',read().homeMusicLink===false&&read().copy.HOME_JUKEBOX_HELP==='Our custom request help'&&read().icons.musicLink==='headphones');
   check(tag+' hide affects only Home shortcut',q('#preview').contentDocument.querySelector('.music-tab-callout').hidden&&!!q('#preview').contentDocument.querySelector('.los-menu a[href="#music-panel"]'));
   await click('#history-undo');await wait(450);check(tag+' Undo restores link and manual state',read().homeMusicLink&&q('[data-section="34"]').open&&!q('[data-section="11"]').open);
   await click('#history-redo');await wait(450);check(tag+' Redo hides link without opening other sections',!read().homeMusicLink&&!q('[data-section="11"]').open);
   await reload();await click('[data-editor-group="home"]');check(tag+' reload keeps settings but sections start collapsed',!q('[data-section="34"]').open&&!read().homeMusicLink&&read().icons.musicLink==='headphones');
   await click('[data-section="34"] > summary');await input('[data-key="homeMusicLink"]',true);await click('[data-section="34"] [data-go-section="15"]');check(tag+' deliberate shortcut reveals shared headings',q('[data-section="15"]').open&&!q('[data-section="15"]').hidden);
  }else check(tag+' Compact has no Home Music section',!q('[data-section="34"]')&&!q('[data-key="homeMusicLink"]'));
  // Explicit validation navigation still reveals its target after the new collapsed defaults.
  await click('[data-editor-group="info"]');await click('[data-section="17"] > summary');await input('[data-copy="INFO_TITLE"]','');await click('[data-section="17"] > summary');await click('[data-editor-group="'+t.landing+'"]');
  q('#validation-summary').open=true;await click('[data-focus-error="copy.INFO_TITLE"]');check(tag+' validation reveals and focuses its field',q('[data-section="17"]').open&&!q('[data-section="17"]').hidden&&frame.contentDocument.activeElement===q('[data-copy="INFO_TITLE"]'));
  await input('[data-copy="INFO_TITLE"]','Show information');const before=JSON.stringify(read());await click('#start-setup');await click('#setup-cancel');check(tag+' wizard cancel preserves settings and manual state',JSON.stringify(read())===before&&q('[data-section="17"]').open);
  check(tag+' editor fits viewport',frame.contentDocument.documentElement.scrollWidth<=frame.contentWindow.innerWidth+1);
 }}catch(error){check(error.stack,false);}finally{localStorage.clear();for(const [k,v]of saved)localStorage.setItem(k,v);await reload();run.disabled=false;status.textContent=results.children.length+' checks, '+results.querySelectorAll('.fail').length+' failures';document.title=status.textContent;}
};
