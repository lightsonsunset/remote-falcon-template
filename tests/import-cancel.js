import {createDesignStore} from '../src/design-store.js';
import {cloneDefaults,settingsFile} from '../src/template.js';
import {SETTINGS_KEY,PREFS_KEY} from '../src/storage.js';
import {CATALOGUE_KEY,parseCatalogue} from '../src/catalogue.js';
const frame=document.querySelector('#editor'),run=document.querySelector('#run'),results=document.querySelector('#results'),fileInput=document.querySelector('#test-file');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS — ':'FAIL — ')+name;results.append(li);};
const reload=()=>new Promise(r=>{frame.onload=()=>setTimeout(r,500);frame.contentWindow.location.reload();});
const keys=[SETTINGS_KEY,PREFS_KEY,CATALOGUE_KEY],snapshot=()=>keys.map(k=>localStorage.getItem(k));
fileInput.onchange=()=>{run.disabled=!fileInput.files.length;};
run.onclick=async()=>{
 if(location.hostname!=='localhost')throw Error('Use isolated localhost.');
 const original=snapshot(),file=fileInput.files[0];run.disabled=true;results.replaceChildren();
 try{
  const parsed=parseCatalogue(await file.text(),file.name);if(parsed.songs.length<3)throw Error('Choose an export with at least three songs.');
  localStorage.setItem(SETTINGS_KEY,settingsFile(cloneDefaults()));localStorage.setItem(PREFS_KEY,JSON.stringify({tourSeen:true}));localStorage.removeItem(CATALOGUE_KEY);await reload();
  let d=frame.contentDocument;const q=s=>d.querySelector(s),unchanged=before=>JSON.stringify(snapshot())===JSON.stringify(before);
  const choose=async()=>{const transfer=new DataTransfer();transfer.items.add(file);q('#catalogue-file').files=transfer.files;q('#catalogue-file').dispatchEvent(new Event('change',{bubbles:true}));for(let i=0;i<100&&!q('#new-picker').open;i++)await wait(20);if(!q('#new-picker').open)throw Error('Import review did not open.');};
  const pickThree=()=>{q('#clear-new').click();for(const el of [...d.querySelectorAll('[data-pick-new]')].slice(0,3))el.click();};
  const changeCategories=()=>{const move=q('[data-picker-down]:not(:disabled)');if(move)move.click();else if(!q('#picker-setup-categories').disabled)q('#picker-setup-categories').click();};
  const close=async how=>{if(how==='escape')q('#new-picker').dispatchEvent(new Event('cancel',{cancelable:true}));else q(how).click();await wait(30);};
  const before=snapshot();await choose();check('Choosing a CSV only opens a pending review',unchanged(before)&&q('#catalogue-source').value==='samples'&&q('#pick-new').disabled);
  check('Import review explains confirmation and offers Cancel import',q('#cancel-new-bottom').textContent==='Cancel import'&&q('#apply-new').textContent==='Import & apply choices'&&q('#new-picker-note').textContent.includes('Nothing changes'));
  pickThree();changeCategories();check('Three pending ticks produce three pending sashes',q('#new-picker-count').textContent.includes('3 NEW')&&d.querySelectorAll('[data-pick-new]:checked').length===3);await close('#cancel-new');
  check('X discards the file, NEW choices and category edits',unchanged(before)&&q('#catalogue-source').value==='samples'&&!q('#new-picker').open);
  for(const how of ['#cancel-new-bottom','escape']){
   await choose();check('Reimport after cancellation starts with zero ticks and zero count',q('#new-picker-count').textContent.includes('0 NEW')&&d.querySelectorAll('[data-pick-new]:checked').length===0);
   pickThree();changeCategories();await close(how);check(how==='escape'?'Escape discards all pending import choices':'Cancel import discards all pending import choices',unchanged(before)&&q('#catalogue-source').value==='samples');
  }
  await choose();q('[data-pick-new="0"]').click();if(!q('#picker-setup-categories').disabled)q('#picker-setup-categories').click();q('#apply-new').click();await wait(450);
  const stored=createDesignStore(localStorage).read().catalogue;check('Confirmation saves the real CSV and selected NEW name',JSON.stringify(stored)===JSON.stringify(parsed)&&createDesignStore(localStorage).read().settings.newNames===parsed.songs[0].name&&q('#catalogue-source').value==='imported');
  check('Applied import is immediately available to the catalogue controls',!q('#pick-new').disabled&&!q('#detect-categories').disabled&&q('#catalogue-summary').textContent===parsed.songs.length+' imported songs');
  q('#catalogue-source').value='samples';q('#catalogue-source').dispatchEvent(new Event('change'));await wait(50);const saved=snapshot();
  for(const how of ['#cancel-new','#cancel-new-bottom','escape']){
   await choose();check('Replacement review restores saved ticks and their count',q('#new-picker-count').textContent.includes('1 NEW')&&d.querySelectorAll('[data-pick-new]:checked').length===1);
   pickThree();changeCategories();await close(how);check('Cancelling replacement retains prior catalogue, settings and preview source',unchanged(saved)&&q('#catalogue-source').value==='samples');
  }
  q('#pick-new').click();check('Existing catalogue editor still uses Apply choices and Cancel',q('#apply-new').textContent==='Apply choices'&&q('#cancel-new-bottom').textContent==='Cancel');pickThree();await close('#cancel-new-bottom');check('Cancelling edits to the existing catalogue preserves saved choices',unchanged(saved));
  q('#pick-new').click();check('Reopening existing NEW choices has no stale count',q('#new-picker-count').textContent.includes('1 NEW')&&d.querySelectorAll('[data-pick-new]:checked').length===1);pickThree();q('#apply-new').click();await wait(400);check('Apply keeps exact names separated correctly',createDesignStore(localStorage).read().settings.newNames===parsed.songs.slice(0,3).map(s=>s.name).join('\n'));
  await reload();d=frame.contentDocument;q('#pick-new').click();check('Applied choices survive reload with matching checkboxes and count',q('#new-picker-count').textContent.includes('3 NEW')&&d.querySelectorAll('[data-pick-new]:checked').length===3);await close('#cancel-new');
 }catch(e){check(e.stack,false);}
 finally{keys.forEach((k,i)=>original[i]===null?localStorage.removeItem(k):localStorage.setItem(k,original[i]));await reload();run.disabled=false;document.title=results.querySelector('.fail')?'FAIL — CSV confirmation':'PASS — CSV confirmation';}
};
