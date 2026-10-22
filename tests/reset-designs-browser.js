import {registry} from '../src/template-registry.js';
import {createDesignStore} from '../src/design-store.js';
import {parseCatalogue} from '../src/catalogue.js';
import {fingerprint} from '../src/reusable-details.js';
const frame=document.querySelector('#editor'),run=document.querySelector('#run'),status=document.querySelector('#status'),results=document.querySelector('#results');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS - ':'FAIL - ')+name;results.append(li);};
const clear=()=>{for(const key of Object.keys(localStorage))if(key.startsWith('rf-template-builder:'))localStorage.removeItem(key);};
const state=()=>createDesignStore(localStorage),saved=()=>fingerprint(Object.entries(localStorage));
let d,w;
const q=s=>d.querySelector(s);
const reload=()=>new Promise(r=>{frame.onload=()=>{d=frame.contentDocument;w=frame.contentWindow;setTimeout(r,650);};frame.contentWindow.location.reload();});
const click=async s=>{const el=q(s);if(!el)throw Error('Missing '+s);el.focus({preventScroll:true});el.click();await wait(300);};
run.onclick=async()=>{
 if(location.hostname!=='localhost'||['4188','4198'].includes(location.port))throw Error('Use disposable localhost.');
 const original=Object.entries(localStorage);run.disabled=true;results.replaceChildren();
 try{for(const t of registry){
  clear();const store=createDesignStore(localStorage);const cat=parseCatalogue('name,displayName,artist,group,imageUrl,category\nlocal,Local fixture,,,,Season','local-fixture.csv');
  for(const template of registry)for(const theme of Object.keys(template.themes)){store.select(template.id,theme);const next=store.read();next.settings.name='Personal '+template.id+' '+theme;next.settings.welcome='A personal welcome';next.settings.icons.navMusic='headphones';next.settings.colours.card='#123456';next.settings.newNames='local';next.catalogue=cat;store.save(next);}
  store.select(t.id,'halloween');await reload();const before=saved(),label=t.name;
  for(const width of [320,390,1280])for(const dark of [false,true]){
   frame.style.width=width+'px';frame.style.height=(width===320?480:900)+'px';d.documentElement.dataset.theme=dark?'dark':'light';
   await click('#reset-settings');check(label+' '+width+' defaults to current and names the design',q('[name="reset-scope"][value="current"]').checked&&q('#reset-current-name').textContent===t.name+' · Halloween');
   check(label+' '+width+' safe initial focus and radio tap targets',d.activeElement===q('#cancel-reset')&&[...d.querySelectorAll('.reset-scope label')].every(el=>el.getBoundingClientRect().height>=44));
   await click('[name="reset-scope"][value="all"]');check(label+' '+width+' all scope and catalogue policy visible',q('#confirm-reset').textContent==='Reset all saved designs'&&q('#reset-dialog').textContent.includes('Imported song lists stay available'));
   check(label+' '+width+' no horizontal overflow',q('#reset-dialog').scrollWidth<=q('#reset-dialog').clientWidth+1&&d.documentElement.scrollWidth<=width+1);
   const dialog=q('#reset-dialog');dialog.scrollTop=dialog.scrollHeight;check(label+' '+width+' confirmation reachable on short screens',q('#confirm-reset').getBoundingClientRect().bottom<=w.innerHeight+1);
   await click('#cancel-reset');check(label+' '+width+' cancel preserves all settings and focus',!dialog.open&&saved()===before&&d.activeElement===q('#reset-settings'));
  }
  frame.style.width='1280px';frame.style.height='900px';d.documentElement.dataset.theme='light';
  await click('#reset-settings');await click('[name="reset-scope"][value="all"]');q('#reset-dialog').dispatchEvent(new w.Event('cancel',{cancelable:true}));await wait(80);check(label+' Escape cancels with focus restored',saved()===before&&!q('#reset-dialog').open&&d.activeElement===q('#reset-settings'));
  await click('#reset-settings');check(label+' reopening clears all-scope choice',q('[name="reset-scope"][value="current"]').checked);await click('#confirm-reset');
  check(label+' current reset changes only this theme',state().all().every(x=>x.key===t.id+':halloween'?fingerprint(x.settings)===fingerprint(t.cloneDefaults('halloween')):x.settings.name.startsWith('Personal ')));
  check(label+' current reset keeps imported catalogue',state().read().catalogue.filename==='local-fixture.csv');await click('#history-undo');check(label+' current reset can be undone',state().read().settings.name==='Personal '+t.id+' halloween');
  await click('#reset-settings');await click('[name="reset-scope"][value="all"]');await click('#confirm-reset');
  check(label+' all reset restores all twelve themed defaults',state().all().length===12&&state().all().every(x=>fingerprint(x.settings)===fingerprint(registry.find(a=>a.id===x.template).cloneDefaults(x.season))));
  check(label+' all reset keeps all catalogues',state().all().every(x=>x.catalogue.filename==='local-fixture.csv'));
  check(label+' all reset restores focus and announces scope',d.activeElement===q('#reset-settings')&&q('#history-status').textContent.includes('12 saved designs'));
  await click('#history-undo');check(label+' undo restores current settings only',state().read().settings.name==='Personal '+t.id+' halloween'&&state().all().filter(x=>x.key!==t.id+':halloween').every(x=>!x.settings.name.startsWith('Personal ')));await click('#history-redo');check(label+' redo restores current defaults',fingerprint(state().read().settings)===fingerprint(t.cloneDefaults('halloween')));
  await click('[data-editor-group="setup"]');q('[data-season="christmas"]').closest('details').open=true;await click('[data-season="christmas"]');await click('#history-undo');check(label+' another theme has its own reset undo',state().read().settings.name==='Personal '+t.id+' christmas');await click('#history-redo');
  await reload();check(label+' reset persists across reload',state().all().every(x=>fingerprint(x.settings)===fingerprint(registry.find(a=>a.id===x.template).cloneDefaults(x.season)))&&state().all().every(x=>x.catalogue.filename==='local-fixture.csv'));
 }
 }catch(error){check(error.stack||error.message,false);}finally{clear();for(const [key,value] of original)localStorage.setItem(key,value);run.disabled=false;status.textContent=results.children.length+' checks, '+results.querySelectorAll('.fail').length+' failures';}
};
