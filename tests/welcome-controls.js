import {registry,parseBackup} from '../src/template-registry.js';
import {createDesignStore} from '../src/design-store.js';
const frame=document.querySelector('#editor'),run=document.querySelector('#run'),results=document.querySelector('#results'),status=document.querySelector('#status');
const wait=ms=>new Promise(r=>setTimeout(r,ms)),q=s=>frame.contentDocument.querySelector(s),read=()=>createDesignStore(localStorage).read().settings;
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS - ':'FAIL - ')+name;results.append(li);};
const reload=()=>new Promise(r=>{frame.onload=()=>setTimeout(r,500);frame.contentWindow.location.reload();});
const click=async selector=>{q(selector).click();await wait(60);};
const input=async(selector,value)=>{const el=q(selector);if(el.type==='checkbox')el.checked=value;else el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));await wait(350);};
const welcome=async t=>{await click('[data-editor-group="'+t.landing+'"]');q('[data-section="11"]').open=true;};
run.onclick=async()=>{
 if(location.hostname!=='localhost'||['4188','4198'].includes(location.port))throw Error('Use a disposable localhost port.');
 const saved=Object.entries(localStorage);run.disabled=true;results.replaceChildren();
 try{for(const t of registry)for(const theme of Object.keys(t.themes)){
 const tag=t.id+' '+theme;status.textContent=tag;const s=t.cloneDefaults(theme);s.welcome='Our saved welcome';s.showWelcome=true;
 const store=createDesignStore(localStorage);store.select(t.id,theme);store.save({settings:s,catalogue:null});await reload();await welcome(t);
 await input('[data-key=welcomeStyle]','card');await input('[data-key=welcomePosition]','status');await input('[data-key=showWelcome]',false);
 check(tag+' hide retains wording and style',read().welcome===s.welcome&&read().showWelcome===false&&read().welcomeStyle==='card'&&read().welcomePosition==='status');
 check(tag+' header tagline unaffected',read().headerTagline===s.headerTagline);
 await click('#history-undo');await wait(350);check(tag+' Undo visibility only',read().showWelcome&&read().welcomeStyle==='card');
 await click('#history-redo');await wait(350);check(tag+' Redo visibility only',!read().showWelcome&&read().welcome===s.welcome);
 await reload();await welcome(t);check(tag+' reload restores controls',!q('[data-key=showWelcome]').checked&&q('[data-key=welcomeStyle]').value==='card'&&q('[data-key=welcomePosition]').value==='status');
 const before=JSON.stringify(read());
 for(const close of ['#setup-cancel','#setup-close','escape']){
 await click('#start-setup');await input('[data-setup-key=showWelcome]',true);await input('#setup-welcome','Draft words');await input('#setup-welcomePosition','above-header');
 check(tag+' Quick edits detached',JSON.stringify(read())===before);
 if(close==='escape'){q('#setup-wizard').dispatchEvent(new Event('cancel',{cancelable:true}));await wait(60);}else await click(close);
 check(tag+' '+close+' discards and restores focus',JSON.stringify(read())===before&&!q('#setup-wizard').open&&frame.contentDocument.activeElement===q('#start-setup'));
 }
 await click('#start-setup');await input('#setup-welcome','Skipped words');await input('#setup-welcomeStyle','plain');await click('#setup-skip');await click('#setup-back');check(tag+' Skip restores entire welcome',q('#setup-welcome').value===s.welcome&&q('#setup-welcomeStyle').value==='card');
 await input('[data-setup-key=showWelcome]',true);await input('#setup-welcome','Applied welcome');await input('#setup-welcomePosition','above-header');await click('#setup-next');await click('#setup-back');check(tag+' Back retains welcome draft',q('#setup-welcome').value==='Applied welcome'&&q('#setup-welcomePosition').value==='above-header');
 for(const width of [320,390,1280]){frame.style.width=width+'px';await wait(40);const d=q('#setup-wizard'),r=d.getBoundingClientRect();check(tag+' '+width+' Quick fits',r.left>=0&&r.right<=frame.clientWidth+1&&d.scrollWidth<=d.clientWidth+1);}
 for(let i=0;i<4;i++)await click('#setup-next');check(tag+' review explains style and position',q('.setup-review').textContent.includes('Card like visitor guidance / Above the header'));
 await click('#setup-next');await wait(350);check(tag+' Apply commits welcome',read().showWelcome&&read().welcome==='Applied welcome'&&read().welcomePosition==='above-header'&&read().welcomeStyle==='card');
 const backup=parseBackup(createDesignStore(localStorage).backup()).designs[theme];check(tag+' backup retains welcome choices',backup.showWelcome&&backup.welcome==='Applied welcome'&&backup.welcomeStyle==='card'&&backup.welcomePosition==='above-header');
 await click('#history-undo');await wait(350);check(tag+' Apply is one Undo transaction',JSON.stringify(read())===before);
 }}catch(error){check(error.stack,false);}finally{localStorage.clear();for(const [k,v]of saved)localStorage.setItem(k,v);await reload();run.disabled=false;const failed=results.querySelectorAll('.fail').length;status.textContent=results.children.length+' checks, '+failed+' failures';document.title=failed+' failures - Welcome controls';}
};
