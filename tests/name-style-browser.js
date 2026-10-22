import {SETTINGS_KEY,PREFS_KEY} from '../src/storage.js';
import {cloneDefaults,settingsFile,parseSettings,render} from '../src/template.js';
import {nameFonts} from '../src/name-style.js';
const frame=document.querySelector('#editor'),results=document.querySelector('#results');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS — ':'FAIL — ')+name;results.append(li);};
const reload=()=>new Promise(r=>{frame.onload=()=>setTimeout(r,600);frame.contentWindow.location.reload();});
document.querySelector('#run').onclick=async()=>{
 if(location.hostname!=='localhost')throw Error('Use isolated localhost.');
 const original=[SETTINGS_KEY,PREFS_KEY].map(k=>[k,localStorage.getItem(k)]);results.replaceChildren();document.querySelector('#run').disabled=true;
 try{
  const initial=cloneDefaults();initial.name='A Very Long Neighbourhood Lights & Music Celebration';initial.logoMode='seasonal';initial.combineLogoName=true;
  localStorage.setItem(SETTINGS_KEY,settingsFile(initial));localStorage.setItem(PREFS_KEY,JSON.stringify({tourSeen:true}));await reload();
  let d=frame.contentDocument;const q=s=>d.querySelector(s),click=async s=>{q(s).click();await wait(350);},input=async(s,value)=>{const el=q(s);if(el.type==='checkbox')el.checked=value;else el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));await wait(400);};
  const state=()=>parseSettings(localStorage.getItem(SETTINGS_KEY),true),viewer=()=>q('#preview').contentDocument;
  await input('#catalogue-source','samples');q('#catalogue-source').dispatchEvent(new Event('change',{bubbles:true}));
  check('Header has four actions and GitHub is in the footer',q('.app-header nav').children.length===4&&q('footer a[href*=github]'));
  check('Single manual download remains independent of form',d.querySelectorAll('a[download]').length===1);
  await click('#open-help');check('Help opens a modal with both guide links',q('#help-dialog').matches(':modal')&&q('#help-dialog a[href="README.html"]')&&q('#help-dialog a[href="START-HERE.html"]'));
  q('#help-dialog').dispatchEvent(new Event('cancel',{cancelable:true}));check('Escape restores Help focus',!q('#help-dialog').open&&d.activeElement===q('#open-help'));
  const before=localStorage.getItem(SETTINGS_KEY);await click('#open-help');await click('#start-tour');check('Help closes before tour opens',!q('#help-dialog').open&&q('#quick-tour').open);await click('#tour-skip');check('Tour preserves settings and restores visible Help focus',localStorage.getItem(SETTINGS_KEY)===before&&d.activeElement===q('#open-help'));
  q('[data-section="2"]').open=true;q('.name-style').open=true;
  check('Default label preserves the existing saved font ID',q('[data-key=nameFont] option[value=current]').textContent==='Default');
  for(const theme of ['christmas','halloween']){
   await click('[data-season="'+theme+'"]');
   for(const font of nameFonts){
    await input('[data-key=nameFont]',font.id);const v=viewer(),h=v.querySelector('.share-brand h1');await v.fonts.ready;
    check(theme+' '+font.label+' font loads with heading-only styling',font.file?[...v.fonts].some(face=>face.family.replaceAll('"','')===font.family&&face.status==='loaded')&&v.defaultView.getComputedStyle(h).fontFamily.includes(font.family)&&!v.defaultView.getComputedStyle(v.querySelector('.section-card h2')).fontFamily.includes('LOS'):!v.defaultView.getComputedStyle(h).fontFamily.includes('LOS'));
    await d.fonts.ready;const sample=q('[data-name-preview]'),sampleStyle=d.defaultView.getComputedStyle(sample);
    check(theme+' '+font.label+' inline sample shows the entered name and loaded font',sample.textContent===state().name&&(font.file?[...d.fonts].some(face=>face.family.replaceAll('"','')===font.family&&face.status==='loaded')&&sampleStyle.fontFamily.includes(font.family):!sampleStyle.fontFamily.includes('LOS')));
    for(const width of [320,390,768,1280]){q('#preview').style.width=width+'px';h.style.fontSize='3rem';await wait(30);check(theme+' '+font.label+' wraps at '+width+' with enlarged text',h.scrollWidth<=h.clientWidth+1&&v.documentElement.scrollWidth<=width+1);}
   }
  }
  await input('[data-key=customNameColour]',true);await input('[data-key=nameColour]','#ffeedd');check('Custom colour applies to Home name',viewer().defaultView.getComputedStyle(viewer().querySelector('.share-brand h1')).color==='rgb(255, 238, 221)');
  check('Inline sample uses the selected name colour',d.defaultView.getComputedStyle(q('[data-name-preview]')).color==='rgb(255, 238, 221)');
  await input('[data-key=showNameOnHome]',false);check('Hidden-name controls disabled and values preserved',q('[data-name-style]').disabled&&state().nameColour==='#ffeedd'&&state().nameFont==='spooky');await input('[data-key=showNameOnHome]',true);
  await click('[data-reset-name-colour]');check('Reset restores template colour and retains selected colour',!state().customNameColour&&state().nameColour==='#ffeedd'&&d.activeElement===q('[data-key=customNameColour]'));
  const saved=localStorage.getItem(SETTINGS_KEY);await click('#start-setup');q('#setup-content .name-style').open=true;await input('[data-setup-key=nameFont]','rounded');await input('[data-setup-key=name]','Lights <b>&</b> Winter');await d.fonts.ready;
  const wizardSample=q('#setup-content [data-name-preview]');check('Wizard sample updates draft text safely without changing the main design',wizardSample.textContent==='Lights <b>&</b> Winter'&&!wizardSample.children.length&&d.defaultView.getComputedStyle(wizardSample).fontFamily.includes('LOS Nunito')&&localStorage.getItem(SETTINGS_KEY)===saved);
  frame.style.width='360px';wizardSample.style.fontSize='3.6rem';await wait(50);check('Large-text wizard sample wraps in a narrow editor',wizardSample.scrollWidth<=wizardSample.clientWidth+1);frame.style.width='100%';await click('#setup-cancel');check('Wizard Cancel leaves saved style unchanged',localStorage.getItem(SETTINGS_KEY)===saved);
  await click('#start-setup');q('#setup-content .name-style').open=true;await input('[data-setup-key=nameFont]','elegant');await click('#setup-next');await click('#setup-next');await click('#setup-next');await click('#setup-next');await click('#setup-next');check('Wizard Apply saves name style',state().nameFont==='elegant');
  await reload();d=frame.contentDocument;check('Settings restoration retains font and disabled custom colour',state().nameFont==='elegant'&&!state().customNameColour);
  for(const mode of ['jukebox','voting'])for(const air of ['on','off']){await click('[data-mode="'+mode+'"]');await click('[data-air="'+air+'"]');await viewer().fonts.ready;check(mode+' '+air+' retains selected font',viewer().fonts.check('700 30px "LOS Playfair Display"'));}
  const v=viewer(),h=v.querySelector('.share-brand h1');h.style.fontFamily='"Missing local font", Georgia, serif';check('Readable fallback keeps heading visible',h.getBoundingClientRect().height>0&&v.defaultView.getComputedStyle(h).fontFamily.includes('Georgia'));
  frame.style.width='360px';await wait(100);check('Narrow editor has no horizontal overflow',d.documentElement.scrollWidth<=360);frame.style.width='100%';
  check('Canonical export remains safe',!/<script\b|localhost|Demo:/.test(render(await (await fetch('../templates/christmas.html')).text(),state())));
 }catch(e){check(e.stack,false);}
 finally{for(const[k,v]of original)v===null?localStorage.removeItem(k):localStorage.setItem(k,v);await reload();document.querySelector('#run').disabled=false;}
};
