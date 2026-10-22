import {registry} from '../src/template-registry.js';
import {createDesignStore} from '../src/design-store.js';
import {PREFS_KEY} from '../src/storage.js';
const frame=document.querySelector('#editor'),run=document.querySelector('#run'),results=document.querySelector('#results'),status=document.querySelector('#status');
const wait=ms=>new Promise(r=>setTimeout(r,ms)),q=s=>frame.contentDocument.querySelector(s),read=()=>createDesignStore(localStorage).read().settings;
const reload=()=>new Promise(r=>{frame.onload=()=>setTimeout(r,600);frame.contentWindow.location.reload();});
const check=(label,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS - ':'FAIL - ')+label;results.append(li);};
const send=(el,value,type='input')=>{el.value=value;el.dispatchEvent(new Event(type,{bubbles:true}));};
run.onclick=async()=>{
 if(location.hostname!=='localhost'||['4188','4198'].includes(location.port))throw Error('Use a disposable localhost port.');
 const saved=Object.entries(localStorage);run.disabled=true;results.replaceChildren();
 try{for(const t of registry){
  const s=t.cloneDefaults('us-patriotic');s.customNameColour=true;s.nameColour='#ffffff';
  localStorage.setItem(PREFS_KEY,JSON.stringify({tourSeen:true}));const store=createDesignStore(localStorage);store.select(t.id,s.theme);store.save({settings:s,catalogue:null});await reload();
  q('[data-editor-group="setup"]').click();q('[data-section="2"]').open=true;q('.name-style').open=true;await wait(400);
  const d=frame.contentDocument,picker=q('[data-key="nameColour"]'),preview=q('#preview'),oldDocument=preview.contentDocument;picker.focus();
  const advice=q('[data-name-contrast]'),adviceBefore=advice.outerHTML;let warningMutations=0;
  const observer=new MutationObserver(records=>warningMutations+=records.length);observer.observe(advice,{childList:true,attributes:true,subtree:true});
  for(const colour of ['#b38989','#ae4242','#000000','#c15353','#6a53c1','#ffeedd']){send(picker,colour);await wait(400);check(t.id+' drag keeps preview document and picker focus '+colour,preview.contentDocument===oldDocument&&d.activeElement===picker&&picker.isConnected);check(t.id+' drag does not change warning layout '+colour,advice.outerHTML===adviceBefore&&warningMutations===0);}
  observer.disconnect();
  check(t.id+' inline sample and saved colour update while dragging',read().nameColour==='#ffeedd'&&d.defaultView.getComputedStyle(q('[data-name-preview]')).color==='rgb(255, 238, 221)');
  picker.dispatchEvent(new Event('change',{bubbles:true}));await wait(500);
  check(t.id+' commit refreshes viewer with chosen colour',preview.contentDocument!==oldDocument&&preview.contentDocument.defaultView.getComputedStyle(preview.contentDocument.querySelector('.share-brand h1')).color==='rgb(255, 238, 221)');
  q('#history-undo').click();await wait(400);check(t.id+' Undo restores pre-drag colour',read().nameColour==='#ffffff');q('#history-redo').click();await wait(400);check(t.id+' Redo restores chosen colour',read().nameColour==='#ffeedd');
  const committedPicker=q('[data-key="nameColour"]');committedPicker.focus();send(committedPicker,'#000000');send(committedPicker,'#000000','change');await wait(400);
  check(t.id+' completed dark selection shows contrast advice',!q('[data-name-contrast]').hidden&&q('[data-name-contrast]').textContent.includes('hard to read'));
  const warning=q('[data-name-contrast]').outerHTML;send(committedPicker,'#ffeedd');await wait(100);check(t.id+' existing warning stays in place during next drag',q('[data-name-contrast]').outerHTML===warning);
  send(committedPicker,'#ffeedd','change');await wait(400);check(t.id+' completed readable selection clears contrast advice',q('[data-name-contrast]').hidden);
  const advanced=q('[data-key="advancedColours"]');if(advanced){advanced.closest('details').open=true;advanced.checked=true;advanced.dispatchEvent(new Event('input',{bubbles:true}));await wait(400);}
  const palette=q('[data-colour="home"]');if(palette){palette.closest('details').open=true;palette.focus();const docBefore=preview.contentDocument;send(palette,'#111111');await wait(350);check(t.id+' palette drag also preserves preview and focus',preview.contentDocument===docBefore&&d.activeElement===palette);send(palette,'#111111','change');await wait(400);check(t.id+' palette commit refreshes and saves',preview.contentDocument!==docBefore&&read().colours.home==='#111111');}
  for(const mode of ['light','dark']){d.documentElement.dataset.theme=mode;const select=q('#identity-headerArtwork'),option=select.querySelector('option'),style=d.defaultView.getComputedStyle(option);
   check(t.id+' '+mode+' dropdown surface distinct from closed field',style.backgroundColor!==d.defaultView.getComputedStyle(select).backgroundColor);
   check(t.id+' '+mode+' dropdown text opaque',style.color!=='transparent'&&!style.color.endsWith(', 0)'));
   send(select,'classic','input');await wait(350);check(t.id+' '+mode+' native selection updates header',read().headerArtwork==='classic'&&!!preview.contentDocument.querySelector('.header-artwork-picture'));
  }
  const before=JSON.stringify(read());q('#start-setup').click();q('#setup-content .name-style').open=true;const wizardPicker=q('[data-setup-key="nameColour"]');wizardPicker.focus();
  const wizardDocument=preview.contentDocument,wizardAdvice=q('#setup-content [data-name-contrast]').outerHTML;for(const colour of ['#000000','#bbaacc','#aabbcc']){send(wizardPicker,colour);await wait(100);check(t.id+' wizard drag retains focused control '+colour,d.activeElement===wizardPicker&&wizardPicker.isConnected&&!wizardPicker.matches(':disabled'));check(t.id+' wizard warning stays stable during drag '+colour,q('#setup-content [data-name-contrast]').outerHTML===wizardAdvice);}
  check(t.id+' wizard colour stays a draft',JSON.stringify(read())===before&&preview.contentDocument===wizardDocument&&d.defaultView.getComputedStyle(q('#setup-content [data-name-preview]')).color==='rgb(170, 187, 204)');
  send(wizardPicker,'#000000');send(wizardPicker,'#000000','change');check(t.id+' wizard commit updates advice without saving draft',!q('#setup-content [data-name-contrast]').hidden&&JSON.stringify(read())===before);
  q('#setup-cancel').click();check(t.id+' wizard cancellation preserves colour',JSON.stringify(read())===before);
  await reload();check(t.id+' reload retains committed colour',read().nameColour==='#ffeedd');
 }}catch(error){check(error.stack,false);}finally{localStorage.clear();for(const[k,v]of saved)localStorage.setItem(k,v);await reload();run.disabled=false;const fails=results.querySelectorAll('.fail').length;status.textContent=results.children.length+' checks, '+fails+' failures';document.title=fails+' failures - Picker stability';}
};
