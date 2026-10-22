import {registry} from '../src/template-registry.js';
import {createDesignStore} from '../src/design-store.js';
if(location.hostname!=='localhost'||['4188','4198'].includes(location.port))throw Error('Use a disposable localhost origin.');
const frame=document.querySelector('#editor'),run=document.querySelector('#run'),results=document.querySelector('#results'),status=document.querySelector('#status');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let d,w;
const q=s=>d.querySelector(s),rect=s=>q(s).getBoundingClientRect();
const reload=()=>new Promise(r=>{frame.onload=()=>{d=frame.contentDocument;w=frame.contentWindow;setTimeout(r,650);};frame.contentWindow.location.reload();});
const clear=()=>{for(const key of Object.keys(localStorage))if(key.startsWith('rf-template-builder:'))localStorage.removeItem(key);};
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS - ':'FAIL - ')+name;results.append(li);};
const click=async s=>{q(s).focus({preventScroll:true});q(s).click();await wait(220);};
function seed(id){clear();const store=createDesignStore(localStorage);for(const theme of ['christmas','halloween']){store.select(id,theme);store.save(store.read());}store.select(id,'christmas');}
run.onclick=async()=>{
 const original=Object.entries(localStorage);run.disabled=true;results.replaceChildren();const measurements=[];
 try{
  for(const template of registry){seed(template.id);await reload();
   for(const width of [320,390,768,900,1024,1280,1600])for(const dark of [false,true]){
    frame.style.width=width+'px';frame.style.height='900px';d.documentElement.dataset.theme=dark?'dark':'light';w.scrollTo(0,0);await wait(50);
    const label=template.id+' '+width+' '+(dark?'dark':'light'),intro=rect('.intro'),copy=rect('.intro-copy'),card=rect('.design-toolbar'),work=rect('.workspace');
    check(label+' no horizontal overflow',d.documentElement.scrollWidth<=w.innerWidth+1);
    check(label+' responsive introduction',width>900?copy.right<card.left:card.top>=copy.bottom);
    check(label+' working area follows intro',work.top>=intro.bottom&&work.top-intro.bottom<(width<=760?75:2));
    check(label+' heading keeps room',width<=900||copy.width>=width*.5-50);
    check(label+' change template fits and remains touch friendly',rect('#choose-template').height>=44&&rect('#choose-template').right<=card.right);
    check(label+' no empty status row',rect('.design-switch-status').height===0&&q('.design-update-notice').hidden);
    if(!dark)measurements.push({template:template.id,width,workspaceTop:work.top,headingWidth:copy.width});
   }
   frame.style.width='1280px';await wait(60);await click('[data-editor-group="setup"]');q('[data-season="halloween"]').closest('details').open=true;
   const top=rect('.workspace').top+w.scrollY;await click('[data-season="halloween"]');
   check(template.id+' restoration is announced',q('.design-switch-status').getAttribute('role')==='status'&&q('.design-switch-status').textContent.includes('restored'));
   check(template.id+' confirmation leaves working area fixed',Math.abs(rect('.workspace').top+w.scrollY-top)<1&&w.getComputedStyle(q('.design-switch-status')).position==='fixed');
   check(template.id+' confirmation cannot intercept taps',w.getComputedStyle(q('.design-switch-status')).pointerEvents==='none');
   await wait(6100);check(template.id+' confirmation expires',q('.design-switch-status').textContent===''&&rect('.design-switch-status').height===0);
   await click('#choose-template');check(template.id+' chooser still opens',q('#template-dialog').open);await click('#cancel-template');check(template.id+' chooser restores focus',d.activeElement===q('#choose-template'));
   await click('#start-setup');check(template.id+' setup still opens',q('#setup-wizard').open);await click('#setup-cancel');
  }
 }catch(error){check(error.stack,false);}finally{clear();for(const [key,value] of original)if(key.startsWith('rf-template-builder:'))localStorage.setItem(key,value);await reload();status.textContent=results.children.length+' checks, '+results.querySelectorAll('.fail').length+' failures';status.dataset.measurements=JSON.stringify(measurements);document.title=status.textContent;run.disabled=false;}
};
async function review(id){seed(id);frame.style.width='1440px';frame.style.height='980px';await reload();d.documentElement.dataset.theme='light';w.scrollTo(0,0);}
document.querySelectorAll('[data-review]').forEach(b=>b.onclick=()=>review(b.dataset.review));
document.querySelectorAll('[data-width]').forEach(b=>b.onclick=()=>{frame.style.width=b.dataset.width+'px';frame.style.height=b.dataset.width==='320'?'640px':'980px';});
document.querySelector('#colour').onclick=()=>{d=frame.contentDocument;d.documentElement.dataset.theme=d.documentElement.dataset.theme==='dark'?'light':'dark';};
const capture=new URLSearchParams(location.search).get('capture');
if(capture&&registry.some(t=>t.id===capture)){document.body.classList.add('capture');if(frame.contentDocument.readyState==='complete')await review(capture);else frame.addEventListener('load',()=>review(capture),{once:true});}
