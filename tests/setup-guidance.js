import {registry,parseBackup} from '../src/template-registry.js';
import {createDesignStore} from '../src/design-store.js';
import {setupSteps} from '../src/setup-model.js';
const frame=document.querySelector('#editor'),run=document.querySelector('#run'),results=document.querySelector('#results');
const wait=ms=>new Promise(r=>setTimeout(r,ms)),read=()=>createDesignStore(localStorage).read().settings;
const keys=['showMainGuidance','guidancePosition','neighbourTitle','neighbourText'],values=s=>JSON.stringify(keys.map(k=>s[k]));
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS - ':'FAIL - ')+name;results.append(li);};
const reload=()=>new Promise(r=>{frame.onload=()=>setTimeout(r,400);frame.contentWindow.location.reload();});
const q=s=>frame.contentDocument.querySelector(s),click=async s=>{q(s).click();await wait(35);};
const input=(key,value)=>{const el=q('[data-setup-key="'+key+'"]');if(el.type==='checkbox')el.checked=value;else el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));};
const start=async()=>{await click('#start-setup');for(let i=0;i<setupSteps.length-2;i++)await click('#setup-next');};
const dirty=()=>{input('showMainGuidance',true);input('guidancePosition','above-header');input('neighbourTitle','Welcome <friends> & neighbours');input('neighbourText','Please keep driveways clear.\nEnjoy the show.');};
const fits=()=>{const el=q('#setup-wizard'),r=el.getBoundingClientRect();return r.left>=0&&r.right<=frame.clientWidth+1&&r.top>=0&&r.bottom<=frame.clientHeight+1&&el.scrollWidth<=el.clientWidth+1;};
run.onclick=async()=>{
 if(location.hostname!=='localhost'||['4188','4198'].includes(location.port))throw Error('Use a disposable localhost port.');
 run.disabled=true;results.replaceChildren();const saved=Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)]));
 try{for(const t of registry)for(const theme of Object.keys(t.themes)){
  const tag=t.id+' '+theme,initial=t.cloneDefaults(theme),store=createDesignStore(localStorage);store.select(t.id,theme);store.save({settings:initial,catalogue:null});await reload();
  await start();check(tag+' dedicated step and original defaults',q('#setup-title').textContent==='Visitor guidance'&&q('[data-setup-key="showMainGuidance"]').checked===initial.showMainGuidance&&q('#setup-neighbourText').value===initial.neighbourText);
  check(tag+' correct Info explanation',q('#setup-content').textContent.includes('The same message also appears on Info.')===!!t.features.guidanceInfo);
  check(tag+' position follows main visibility',q('[data-setup-feature]').hidden===!initial.showMainGuidance);
  for(const close of ['#setup-cancel','#setup-close','escape']){
   dirty();check(tag+' pending guidance never changes saved settings',values(read())===values(initial));
   if(close==='escape'){q('#setup-wizard').dispatchEvent(new Event('cancel',{cancelable:true}));await wait(35);}else await click(close);
   check(tag+' '+close+' discards draft and restores focus',values(read())===values(initial)&&!q('#setup-wizard').open&&frame.contentDocument.activeElement===q('#start-setup'));
   await start();check(tag+' reopen restores saved message',q('#setup-neighbourTitle').value===initial.neighbourTitle);
  }
  for(const width of [320,390,1280]){
   frame.style.width=width+'px';frame.style.height=(width===320?568:1000)+'px';await wait(40);
   check(tag+' '+width+' guidance fits and switch is tappable',fits()&&q('[data-setup-key="showMainGuidance"]').closest('label').getBoundingClientRect().height>=44);
   await click('#setup-next');check(tag+' '+width+' review fits',fits());await click('#setup-back');
  }
  await click('#theme');check(tag+' dark mode fits',fits());await click('#theme');
  // Move through the new step without applying; Back and Skip have distinct draft semantics.
  dirty();await click('#setup-back');await click('#setup-next');check(tag+' Back preserves message and position',q('#setup-neighbourTitle').value==='Welcome <friends> & neighbours'&&q('#setup-guidancePosition').value==='above-header');
  input('neighbourTitle','Discard this revision');input('guidancePosition','below-header');await click('#setup-skip');
  check(tag+' Skip restores step-entry values in review',q('.setup-guidance-review').textContent.includes('Welcome <friends> & neighbours')&&q('.setup-guidance-review').textContent.includes('Above the header')&&!q('.setup-guidance-review').textContent.includes('Discard this revision'));
  check(tag+' review explains Info placement',q('.setup-guidance-review').textContent.includes('Also shown on Info.')===!!t.features.guidanceInfo);
  check(tag+' review text is escaped',!q('.setup-guidance-review friends'));
  await click('#setup-next');await wait(250);const applied=read();
  check(tag+' Apply saves guidance with unchanged other settings',values(applied)===JSON.stringify([true,'above-header','Welcome <friends> & neighbours','Please keep driveways clear.\nEnjoy the show.'])&&Object.keys(initial).every(k=>keys.includes(k)||JSON.stringify(initial[k])===JSON.stringify(applied[k])));
  await click('#history-undo');check(tag+' Undo restores previous guidance',values(read())===values(initial));await click('#history-redo');check(tag+' Redo restores guidance',values(read())===values(applied));
  const backup=createDesignStore(localStorage).backup(),restored=parseBackup(backup);check(tag+' backup retains guidance',values(restored.designs[theme])===values(applied));
  await reload();await start();check(tag+' reload retains applied guidance',q('#setup-neighbourTitle').value===applied.neighbourTitle&&q('#setup-guidancePosition').value==='above-header');
  input('showMainGuidance',false);check(tag+' hiding main keeps wording and position',q('[data-setup-feature]').hidden&&q('#setup-neighbourText').value===applied.neighbourText&&q('#setup-guidancePosition').value==='above-header');
  await click('#setup-next');check(tag+' review reports hidden main screen',q('.setup-guidance-review').textContent.includes('Hidden on the main screen.'));await click('#setup-back');
  input('neighbourTitle','');input('neighbourText','');await click('#setup-next');check(tag+' empty guidance review is explicit',q('.setup-guidance-review').textContent.includes('No guidance message.')&&!q('.setup-guidance-review').textContent.includes('Also shown on Info.'));await click('#setup-next');
  const source=await(await fetch('../'+t.source)).text(),html=t.render(source,read());check(tag+' empty guidance exports no empty card or wizard code',!html.includes('class="section-card visitor-guidance')&&!/<script|data-setup-|setup-guidance-review/.test(html));
 }
 }catch(error){check(error.stack,false);}finally{localStorage.clear();for(const [k,v] of Object.entries(saved))localStorage.setItem(k,v);await reload();run.disabled=false;document.querySelector('#status').textContent=results.querySelectorAll('.pass').length+' passed; '+results.querySelectorAll('.fail').length+' failed';}
};
document.querySelector('#review').onclick=async()=>{const t=registry[0],store=createDesignStore(localStorage);store.select(t.id,'christmas');store.save({settings:t.cloneDefaults('christmas'),catalogue:null});frame.style.width='1280px';frame.style.height='1000px';await reload();await start();frame.scrollIntoView({block:'start'});};
