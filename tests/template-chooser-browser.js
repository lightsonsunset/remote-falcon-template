import {registry} from '../src/template-registry.js';
import {createDesignStore} from '../src/design-store.js';
import {fingerprint} from '../src/reusable-details.js';
const frame=document.querySelector('#editor'),run=document.querySelector('#run'),status=document.querySelector('#status'),results=document.querySelector('#results');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS - ':'FAIL - ')+name;results.append(li);};
const clear=()=>{for(const key of Object.keys(localStorage))if(key.startsWith('rf-template-builder:'))localStorage.removeItem(key);};
const saved=()=>fingerprint(Object.entries(localStorage));
let d,w;
const q=s=>d.querySelector(s);
const reload=()=>new Promise(r=>{frame.onload=()=>{d=frame.contentDocument;w=frame.contentWindow;setTimeout(r,700);};frame.contentWindow.location.reload();});
const click=async s=>{const el=q(s);if(!el)throw Error('Missing '+s);el.focus({preventScroll:true});el.click();await wait(180);};
async function previewReady(){for(let i=0;i<50&&!q('#template-preview-loading').hidden;i++)await wait(80);if(!q('#template-preview-error').hidden)throw Error(q('#template-preview-error').textContent);}
const inside=el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=w.innerHeight+1&&r.left>=0&&r.right<=w.innerWidth+1;};
const luminance=colour=>colour.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>{const values=[luminance(a),luminance(b)].sort((a,b)=>b-a);return(values[0]+.05)/(values[1]+.05);};
run.onclick=async()=>{
 if(location.hostname!=='localhost'||['4188','4198'].includes(location.port))throw Error('Use disposable localhost.');
 const original=Object.entries(localStorage);run.disabled=true;results.replaceChildren();
 try{
  clear();const store=createDesignStore(localStorage);
  for(const t of registry){store.select(t.id,'christmas');const value=store.read();value.settings.name='Saved '+t.name;value.settings.welcome='A personal welcome';store.save(value);}
  store.select('festive','christmas');await reload();
  for(const [width,height] of [[320,480],[390,844],[1280,720]])for(const dark of [false,true]){
   frame.style.width=width+'px';frame.style.height=height+'px';d.documentElement.dataset.theme=dark?'dark':'light';
   await click('#choose-template');await previewReady();const before=saved(),body=q('.template-browser-body'),label=width+' '+(dark?'dark':'light');
   check(label+' single shared preview',q('#template-dialog').querySelectorAll('iframe').length===1);
   check(label+' fixed header and footer',inside(q('.template-browser-heading'))&&inside(q('.template-browser-footer')));
   check(label+' layout fits horizontally',q('#template-dialog').scrollWidth<=q('#template-dialog').clientWidth+1&&body.scrollWidth<=body.clientWidth+1);
   const left=q('#template-cards').getBoundingClientRect(),right=q('.template-preview-panel').getBoundingClientRect();
   check(label+' responsive template/preview order',width>640?left.right<right.left:right.top>=left.bottom);
   check(label+' comfortable choice and action targets',[...d.querySelectorAll('#template-cards button,#template-season button,.template-actions button,#cancel-template')].every(el=>el.getBoundingClientRect().height>=44));
   const footerTop=q('.template-browser-footer').getBoundingClientRect().top;
   body.scrollTop=body.scrollHeight;await wait(40);
   check(label+' scrolling body leaves controls visible',inside(q('#setup-template'))&&inside(q('#apply-template'))&&Math.abs(q('.template-browser-footer').getBoundingClientRect().top-footerTop)<1);
   const selected=q('#template-season .selected'),selectedStyle=w.getComputedStyle(selected),titleStyle=w.getComputedStyle(selected.querySelector('strong')),descriptionStyle=w.getComputedStyle(selected.querySelector('small'));
   check(label+' selected theme is distinct and readable',contrast(selectedStyle.backgroundColor,w.getComputedStyle(q('#template-season .season-card:not(.selected)')).backgroundColor)>=3&&contrast(titleStyle.color,selectedStyle.backgroundColor)>=4.5&&contrast(descriptionStyle.color,selectedStyle.backgroundColor)>=4.5&&selected.querySelector('.theme-selection-tick')?.textContent.trim()==='✓');
   const scrollBefore=body.scrollTop,choiceBefore=q('#template-selection-name').textContent;
   await click('#open-template-contribute');
   check(label+' compact ideas dialog stays within the viewport',q('#template-contribute-dialog').open&&q('#template-dialog').open&&inside(q('#template-contribute-dialog'))&&q('#template-contribute-dialog').scrollWidth<=q('#template-contribute-dialog').clientWidth+1);
   check(label+' ideas dialog retains both submission links and private contact',q('#template-contribute-dialog').querySelectorAll('a').length===3&&!q('#template-dialog').textContent.includes('purchased templates'));
   await click('#close-template-contribute');
   check(label+' ideas close preserves chooser focus, scroll and selection',d.activeElement===q('#open-template-contribute')&&body.scrollTop===scrollBefore&&q('#template-selection-name').textContent===choiceBefore&&saved()===before);
   for(const t of registry){
    await click('#template-choice-'+t.id);await previewReady();
    check(label+' '+t.id+' selection updates preview name and saved status',q('#template-preview-label').textContent===t.name+' · Christmas'&&q('#template-selection-status').textContent==='Resume your saved design.');
    for(const season of Object.keys(t.themes)){
     await click('[data-chooser-season="'+season+'"]');await previewReady();
     const pd=q('#template-preview').contentDocument;
     check(label+' '+t.id+' '+season+' loads matching defaults',pd?.title===t.cloneDefaults(season).name&&!q('#template-preview').hidden&&q('#template-selection-name').textContent===t.name+' · '+t.themes[season].name);
    }
    await click('[data-chooser-season="christmas"]');await previewReady();
   }
   check(label+' browsing never changes saved designs',saved()===before);
   await click('#cancel-template');check(label+' closing restores focus without applying',!q('#template-dialog').open&&d.activeElement===q('#choose-template')&&saved()===before);
  }
  frame.style.width='1280px';frame.style.height='900px';d.documentElement.dataset.theme='light';
  await click('#choose-template');const before=saved();
  // Rapid switches also exercise uncached template loads and superseded srcdoc renders.
  for(const season of ['halloween','australia-day','thanksgiving','valentines-day']){q('[data-chooser-season="'+season+'"]').click();q('#template-choice-compact-console').click();q('#template-choice-festive').click();}
  await previewReady();check('Rapid changes retain the final template and theme',q('#template-selection-name').textContent==='Lights on Sunset · Valentine’s Day'&&q('#template-preview').contentDocument.title===registry[0].cloneDefaults('valentines-day').name);
  await click('#explore-template');await wait(400);check('Full preview uses the selection',q('#expanded-preview').open&&q('#expanded-preview-title').textContent==='Lights on Sunset · Valentine’s Day');
  await click('[data-expanded-air="off"]');check('Full preview availability remains interactive',q('[data-expanded-air="off"]').getAttribute('aria-pressed')==='true');
  await click('#close-expanded-preview');check('Full preview returns to its chooser button',q('#template-dialog').open&&d.activeElement===q('#explore-template')&&saved()===before);
  await click('#cancel-template');await click('#choose-template');
  check('Reopening discards browsing choices',q('#template-selection-name').textContent==='Lights on Sunset · Christmas');
  await click('#template-choice-compact-console');await click('#apply-template');
  check('Editor continuation restores the saved candidate',createDesignStore(localStorage).read().settings.name==='Saved Compact console'&&!q('#copy-design-dialog').open&&!q('#template-dialog').open);
  await click('#choose-template');await click('#setup-template');
  check('Setup continuation opens the correct design',q('#setup-wizard').open&&q('#setup-design').textContent==='Compact console · Christmas');await click('#setup-cancel');
  await click('#choose-template');await click('[data-chooser-season="halloween"]');const preCreate=saved();await click('#apply-template');
  check('New theme retains the customisation review',q('#copy-design-dialog').open&&q('#copy-details-title').textContent.includes('Halloween'));
  q('#copy-design-dialog').dispatchEvent(new w.Event('cancel',{cancelable:true}));await wait(80);
  check('Cancelling new-theme review retains saved work',saved()===preCreate&&createDesignStore(localStorage).read().settings.name==='Saved Compact console');
 }catch(error){check(error.stack||error.message,false);}finally{clear();for(const [key,value] of original)localStorage.setItem(key,value);run.disabled=false;status.textContent=results.children.length+' checks, '+results.querySelectorAll('.fail').length+' failures';}
};
