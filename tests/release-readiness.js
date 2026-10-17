import {cloneDefaults,settingsFile,parseSettings,render} from '../src/template.js';
import {SETTINGS_KEY,PREFS_KEY} from '../src/storage.js';
const frame=document.querySelector('#editor'),results=document.querySelector('#results'),run=document.querySelector('#run');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS — ':'FAIL — ')+name;results.append(li);};
const reload=()=>new Promise(r=>{frame.onload=()=>setTimeout(r,500);frame.contentWindow.location.reload();});
run.onclick=async()=>{
 if(location.hostname!=='localhost')throw Error('Use isolated localhost.');
 const original=[SETTINGS_KEY,PREFS_KEY].map(k=>[k,localStorage.getItem(k)]);run.disabled=true;results.replaceChildren();
 try{
  const initial=cloneDefaults();initial.name='Twinkling Lane Lights';
  localStorage.setItem(SETTINGS_KEY,settingsFile(initial));localStorage.setItem(PREFS_KEY,JSON.stringify({tourSeen:true}));await reload();
  const d=frame.contentDocument,q=s=>d.querySelector(s),v=()=>q('#preview').contentDocument;
  const click=async s=>{q(s).click();await wait(400);};
  const input=async(s,value)=>{const el=q(s);if(el.type==='checkbox')el.checked=value;else el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));await wait(400);};
  const state=()=>parseSettings(localStorage.getItem(SETTINGS_KEY),true);
  const w=frame.contentWindow, nativeAnchorClick=w.HTMLAnchorElement.prototype.click, blobs=new Map(), downloads=[];
  const nativeObjectURL=w.URL.createObjectURL;
  w.URL.createObjectURL=blob=>{const url=nativeObjectURL.call(w.URL,blob);blobs.set(url,blob);return url;};
  w.HTMLAnchorElement.prototype.click=function(){if(this.download){downloads.push({name:this.download,blob:blobs.get(this.href)});return;}return nativeAnchorClick.call(this);};
  let copied='';Object.defineProperty(w.navigator,'clipboard',{configurable:true,value:{writeText:async text=>{copied=text;}}});
  await click('#copy');await click('#fallback-download');await click('#close-output');await click('#download');await click('#close-output');
  check('Copy, normal download and fallback download contain identical HTML',downloads.length===2&&(await downloads[0].blob.text())===copied&&(await downloads[1].blob.text())===copied);
  check('Both download paths use the show and theme filename',downloads.every(item=>item.name==='Twinkling-Lane-Lights-Christmas.html'));
  Object.defineProperty(w.navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('Clipboard denied for local test');}}});
  await click('#copy');check('Denied clipboard exposes selected HTML and a download',!q('#html-fallback').hidden&&q('#html-fallback').value===copied&&d.activeElement===q('#html-fallback')&&q('#html-fallback').selectionEnd===copied.length&&!q('#fallback-download').disabled);await click('#close-output');
  delete w.navigator.clipboard;w.HTMLAnchorElement.prototype.click=nativeAnchorClick;w.URL.createObjectURL=nativeObjectURL;
  await click('.pane-heading [data-finish-export]');check('Finish focuses existing export heading',d.activeElement===q('#export-heading'));
  await input('[data-key=name]','');await click('.pane-heading [data-finish-export]');check('Finish exposes and focuses validation when incomplete',q('#validation-summary').open&&d.activeElement===q('#validation-count'));check('Validation disclosure remains in keyboard tab order',q('#validation-count').tabIndex===0);await input('[data-key=name]',initial.name);
  const backup=cloneDefaults('halloween');backup.name='Autumn Lights';const before=localStorage.getItem(SETTINGS_KEY);
  const choose=async text=>{const transfer=new DataTransfer();transfer.items.add(new File([text],'saved-design.json',{type:'application/json'}));q('#load-settings').files=transfer.files;q('#load-settings').dispatchEvent(new Event('change',{bubbles:true}));await wait(100);};
  for(const close of ['#cancel-load-settings','#close-load-settings','escape']){
   await choose(settingsFile(backup));check('Backup preview waits for confirmation',q('#load-settings-dialog').open&&localStorage.getItem(SETTINGS_KEY)===before);
   if(close==='escape')q('#load-settings-dialog').dispatchEvent(new Event('cancel',{cancelable:true}));else await click(close);
   check(close+' preserves work and returns focus',!q('#load-settings-dialog').open&&localStorage.getItem(SETTINGS_KEY)===before&&d.activeElement===q('#load-settings-button'));
  }
  await choose('{broken');check('Invalid backup never replaces work',!q('#load-settings-dialog').open&&localStorage.getItem(SETTINGS_KEY)===before&&!q('#load-error').hidden);
  await choose(settingsFile(backup));await click('#confirm-load-settings');check('Confirmed backup loads and saves chosen design',state().name==='Autumn Lights'&&state().theme==='halloween');
  await click('[data-editor-group=setup]');q('[data-section="2"]').open=true;q('.name-style').open=true;
  await input('[data-key=customNameColour]',true);await input('[data-key=nameColour]','#30202c');check('Low-contrast name gets non-blocking advice',q('[data-name-contrast]').textContent.includes('hard to read')&&!q('#copy').disabled);
  await click('#start-setup');q('#setup-content .name-style').open=true;check('Wizard shares contrast advice',q('#setup-content [data-name-contrast]').textContent.includes('hard to read'));await click('#setup-cancel');
  await input('[data-key=nameColour]','#ffffff');check('Readable name clears advice',q('[data-name-contrast]').hidden);
  await click('#open-help');check('Feedback chooser is available from Help',q('#help-dialog a[href$="issues/new/choose"]'));q('#help-dialog').dispatchEvent(new Event('cancel',{cancelable:true}));check('Help Escape returns focus',d.activeElement===q('#open-help'));
  for(const theme of ['christmas','halloween'])for(const mode of ['jukebox','voting'])for(const air of ['on','off']){
   await click('[data-season="'+theme+'"]');await click('[data-mode="'+mode+'"]');await click('[data-air="'+air+'"]');
   const doc=v(),win=doc.defaultView;
   // This local layout test models unsupported :has(). It does not replace RF data.
   for(const sheet of [...doc.styleSheets]){let rules;try{rules=sheet.cssRules;}catch{continue;}
    const strip=parent=>{for(let i=parent.cssRules.length-1;i>=0;i--){const rule=parent.cssRules[i];if(rule.selectorText?.includes(':has(')){parent.deleteRule(i);continue;}if(rule.conditionText==='not selector(:has(*))'){const css=[...rule.cssRules].map(r=>r.cssText).join('\n');parent.deleteRule(i);parent.insertRule('@media all{'+css+'}',i);}else if(rule.cssRules)strip(rule);}};strip(sheet);
   }
   check(theme+' '+mode+' '+air+': legacy pages visible and filters hidden',[...doc.querySelectorAll('.content__body')].every(el=>win.getComputedStyle(el).visibility==='visible')&&[...doc.querySelectorAll('.music-filter')].every(el=>win.getComputedStyle(el).display==='none'));
   check('Legacy notice visible and disabled FM stays hidden',win.getComputedStyle(doc.querySelector('.browser-compat-note')).display!=='none'&&[...doc.querySelectorAll('.share-fm')].every(el=>win.getComputedStyle(el).display==='none'));
   for(const width of [320,390,1280]){q('#preview').style.width=width+'px';await wait(25);check('Legacy '+theme+' fits '+width,doc.querySelector('#show-options').scrollWidth<=width+1);}
   const container=doc.querySelector('#show-options'),info=doc.querySelector('#info-panel');info.scrollIntoView();check('Legacy section anchors can scroll to Info',container.scrollTop>0);
  }
  frame.style.width='390px';await wait(100);check('Narrow editor fits',d.documentElement.scrollWidth<=390);await click('.pane-heading [data-finish-export]');check('Finish opens Settings on narrow screens',q('.workspace').dataset.view==='settings');frame.style.width='1280px';d.documentElement.style.fontSize='125%';await wait(100);check('Enlarged editor has no horizontal overflow',d.documentElement.scrollWidth<=1280);
  const html=render(await(await fetch('../templates/christmas.html')).text(),state());check('Export has no test or demo scripts',!/<script\b|Demo:|localhost|release-readiness/.test(html));
 }catch(e){check(e.stack,false);}
 finally{for(const[k,value]of original)value===null?localStorage.removeItem(k):localStorage.setItem(k,value);await reload();run.disabled=false;document.title=results.querySelector('.fail')?'FAIL — Release readiness':'PASS — Release readiness';}
};
