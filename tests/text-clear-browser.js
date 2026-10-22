import {registry} from '../src/template-registry.js';
import {createDesignStore} from '../src/design-store.js';
const frame=document.querySelector('#editor'),results=document.querySelector('#results'),status=document.querySelector('#status'),run=document.querySelector('#run');
const wait=ms=>new Promise(r=>setTimeout(r,ms)),q=s=>frame.contentDocument.querySelector(s),read=()=>createDesignStore(localStorage).read().settings;
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS - ':'FAIL - ')+name;results.append(li);};
const reload=()=>new Promise(r=>{frame.onload=()=>setTimeout(r,450);frame.contentWindow.location.reload();});
const click=async s=>{q(s).click();await wait(80);};
const input=async(s,value)=>{const el=q(s);el.focus({preventScroll:true});el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));await wait(300);};
const clear=async s=>{const field=q(s);field.closest('.clearable-field').querySelector('.clear-text').click();await wait(300);};
const welcome=async t=>{await click('[data-editor-group="'+(t.id==='festive'?'home':'music')+'"]');q('[data-key="welcome"]').closest('details').open=true;};
async function prepare(t,theme='christmas'){
 if(location.hostname!=='localhost'||['4188','4198'].includes(location.port))throw Error('Use a disposable localhost port.');
 const store=createDesignStore(localStorage);store.select(t.id,theme);store.save({settings:t.cloneDefaults(theme),catalogue:null});await reload();await welcome(t);
}
run.onclick=async()=>{
 const saved=Object.entries(localStorage);run.disabled=true;results.replaceChildren();
 try{for(const t of registry){
  status.textContent=t.name;await prepare(t);
  const original=read().welcome,field='[data-key="welcome"]';
  await input(field,'A personal welcome');
  q(field).scrollIntoView({block:'center'});q(field).focus({preventScroll:true});const y=frame.contentWindow.scrollY;
  await clear(field);check(t.id+' clear saves empty text',read().welcome===''&&q(field).value==='');
  check(t.id+' clear returns focus and caret',frame.contentDocument.activeElement===q(field)&&q(field).selectionStart===0);
  check(t.id+' clear preserves editor scroll',Math.abs(frame.contentWindow.scrollY-y)<2);
  check(t.id+' empty button disabled',q(field).closest('.clearable-field').querySelector('button').disabled);
  await click('#history-undo');await wait(300);check(t.id+' Undo restores personal text',read().welcome==='A personal welcome'&&q(field).value==='A personal welcome');
  await click('#history-undo');await wait(300);check(t.id+' clear is separate from typing history',read().welcome===original);
  await click('#history-redo');await click('#history-redo');await wait(300);check(t.id+' Redo clears',read().welcome==='');
  await reload();await welcome(t);check(t.id+' reload preserves blank',read().welcome===''&&q(field).value==='');
  check(t.id+' readonly HTML has no Clear',!q('#html-fallback')?.closest('.clearable-field'));
  await click('[data-editor-group="setup"]');q('[data-key="name"]').closest('details').open=true;
  await clear('[data-key="name"]');check(t.id+' required field still blocks export',q('#copy').disabled&&!q('#validation-summary').hidden);
  await click('#history-undo');await wait(300);check(t.id+' undo fixes validation',!q('#copy').disabled);
  await input('#identity-logoMode','custom');const url=q('#identity-logo');await input('#identity-logo','https://example.com/logo.png');await clear('#identity-logo');check(t.id+' URL clears without selection exception',url.value===''&&frame.contentDocument.activeElement===url);
  await input('#identity-logoMode',t.id==='festive'?'icon':'symbol');await click('[data-icon-role="brand"]');await input('#icon-search','snowman');await clear('#icon-search');check(t.id+' dynamic search clears and restores results',q('#icon-search').value===''&&q('#icon-picker .icon-library').querySelectorAll('button').length>20);await click('#close-icon-picker');
  await input('#identity-logoMode',t.id==='festive'?'icon':'none');
  await click('#start-setup');const savedWelcome=read().welcome;await input('#setup-welcome','Draft greeting');await clear('#setup-welcome');
  await click('#setup-next');await click('#setup-back');check(t.id+' Back retains cleared draft',q('#setup-welcome').value==='');
  await click('#setup-cancel');check(t.id+' cancellation preserves saved design',read().welcome===savedWelcome);
  await click('#start-setup');await input('#setup-welcome','Keep me');await clear('#setup-welcome');
  for(let i=0;i<5;i++)await click('#setup-next');await wait(300);check(t.id+' setup Apply saves cleared value',!q('#setup-wizard').open&&read().welcome==='');
  for(const theme of Object.keys(t.themes)){
   await prepare(t,theme);
   for(const width of [320,390,1280])for(const mode of ['light','dark']){
    frame.style.width=width+'px';frame.style.height=width===320?'568px':'1000px';frame.contentDocument.documentElement.dataset.theme=mode;
    await wait(30);const el=q(field),button=el.closest('.clearable-field').querySelector('button'),r=el.getBoundingClientRect(),b=button.getBoundingClientRect();
    check(t.id+' '+theme+' '+width+' '+mode+' Clear below text',b.top>=r.bottom-1&&b.right<=r.right+1&&b.width>=44&&b.height>=28);
    check(t.id+' '+theme+' '+width+' '+mode+' transparent accessible control',frame.contentWindow.getComputedStyle(button).backgroundColor==='rgba(0, 0, 0, 0)'&&button.getAttribute('aria-label')==='Clear Welcome message'&&!button.closest('label'));
   }
  }
  frame.style.width='1280px';await click('#start-setup');const el=q('#setup-welcome'),label=el.closest('label');label.click();check(t.id+' original label still focuses field',frame.contentDocument.activeElement===el);
  check(t.id+' each text field has exactly one Clear',!![...q('#setup-content').querySelectorAll('.text-clear-input')].length&&[...q('#setup-content').querySelectorAll('.text-clear-input')].every(e=>e.closest('.clearable-field').querySelectorAll(':scope > .clear-text').length===1));
  await click('#setup-cancel');
 }}catch(error){check(error.stack,false);}finally{localStorage.clear();for(const [k,v]of saved)localStorage.setItem(k,v);await reload();run.disabled=false;const failed=results.querySelectorAll('.fail').length;status.textContent=results.children.length+' checks, '+failed+' failures';document.title=failed+' failures - Text clearing';}
};
document.querySelector('#review').onclick=async()=>{frame.style.width='1440px';frame.style.height='1050px';await prepare(registry.find(t=>t.id==='compact-console'),'us-patriotic');frame.contentWindow.scrollTo({top:q('.workspace').getBoundingClientRect().top+frame.contentWindow.scrollY-16,behavior:'instant'});status.textContent='Ready for review';};
