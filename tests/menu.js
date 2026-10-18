import {registry} from '../src/template-registry.js';
import {createDesignStore} from '../src/design-store.js';
import {availableIconRoles} from '../src/icons.js';
const frame=document.querySelector('#editor'),run=document.querySelector('#run'),results=document.querySelector('#results');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS — ':'FAIL — ')+name;results.append(li);};
const reload=()=>new Promise(r=>{frame.onload=()=>setTimeout(r,700);frame.contentWindow.location.reload();});
const visible=el=>!!el&&el.getClientRects().length>0;
run.onclick=async()=>{
 if(location.hostname!=='localhost')throw Error('Use isolated localhost.');
 const original=Object.entries(localStorage);run.disabled=true;results.replaceChildren();
 try{
 for(const t of registry)for(const theme of Object.keys(t.themes)){
  const s=t.cloneDefaults(theme);s.name='Maple Lane Lights';s.fm=true;s.youtube=true;s.youtubeUrl='https://example.org/video';s.newFilter=true;s.showQueueLimit=true;
  s.copy.NOW_TITLE='Playing at Maple Lane';s.copy.FILTER_ALL='Every song';s.copy.FILTER_NEW='Recent additions';
  const store=createDesignStore(localStorage);store.select(t.id,theme);store.save({settings:s,catalogue:null});await reload();
  const d=frame.contentDocument,q=selector=>d.querySelector(selector),w=frame.contentWindow,preview=()=>q('#preview').contentWindow;
  const click=async selector=>{q(selector).click();await wait(250);};
  const input=async(selector,value)=>{const el=q(selector);if(el.type==='checkbox')el.checked=value;else el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));await wait(500);};
  const reveal=selector=>{const el=q(selector);const section=el.closest('[data-section]');const group=Object.keys(t.groups).find(k=>t.groups[k].sections.includes(+section.dataset.section));q('[data-editor-group="'+group+'"]').click();let ancestor=el.parentElement;while(ancestor&&ancestor!==d.body){if(ancestor.tagName==='DETAILS')ancestor.open=true;ancestor=ancestor.parentElement;}return el;};
  const before=localStorage.getItem(t.storageKey),prefix=t.name+' '+theme;
  check(prefix+' page and general settings are labelled separately',!!q('[aria-label="Edit a viewer page"]')&&!!q('[aria-label="General settings"]')&&q('[data-editor-group="messages"]').firstChild.textContent.trim()==='Request messages');
  for(const [key,g] of Object.entries(t.groups)){
   const hash=preview().location.hash;await click('[data-editor-group="'+key+'"]');
   check(prefix+' '+key+' section ownership',JSON.stringify([...d.querySelectorAll('#settings>[data-section]:not([hidden])')].map(el=>+el.dataset.section))===JSON.stringify(g.sections));
   check(prefix+' '+key+' preview navigation',preview().location.hash===(g.panel?'#'+g.panel+'-panel':hash));
  }
  for(const el of d.querySelectorAll('[data-go-section]')){el.click();const dest=q('[data-section="'+el.dataset.goSection+'"]');check(prefix+' shortcut '+el.textContent,!!dest&&!dest.hidden&&dest.open);}
  check(prefix+' browsing does not alter saved settings',before===localStorage.getItem(t.storageKey));
  for(const [role] of availableIconRoles(t.id==='compact-console'))check(prefix+' one editor control for '+role,d.querySelectorAll('#settings [data-icon-role="'+role+'"]').length===1);
  const placements={'[data-key="musicFM"]':4,'[data-key="showSupportTab"]':14,'[data-key="youtubeUrl"]':31,'[data-copy="NOW_TITLE"]':23,'[data-copy="FILTER_ALL"]':18,'[data-copy="FILTER_NEW"]':6,'[data-copy="MUSIC_CLOSED_TITLE"]':33};
  for(const [selector,section] of Object.entries(placements))check(prefix+' control placement '+selector,q(selector)?.closest('[data-section]').dataset.section===String(section));
  for(const [selector,value,error] of [['[data-key="youtubeUrl"]','http://example.org','youtubeUrl'],['[data-copy="NOW_TITLE"]','','copy.NOW_TITLE']]){
   const field=reveal(selector),old=field.value;await input(selector,value);await click('[data-editor-group="info"]');q('#validation-summary').open=true;await click('#validation-list [data-focus-error="'+error+'"]');
   check(prefix+' relocated error opens its field '+error,d.activeElement===field&&visible(field)&&q('#copy').disabled);
   const rect=field.getBoundingClientRect();check(prefix+' error field clears sticky navigation '+error,rect.top>=q('#editor-groups').getBoundingClientRect().bottom-1);
   await input(selector,old);check(prefix+' correcting relocated field enables export',!q('#copy').disabled);
  }
  const field=reveal('[data-copy="NOW_TITLE"]');await wait(350);field.focus();field.setSelectionRange(4,4);w.scrollTo({top:Math.max(0,w.scrollY-10),behavior:'instant'});await wait(100);
  const outerY=w.scrollY,hash=preview().location.hash,old=field.value;field.value+=' tonight';field.dispatchEvent(new Event('input',{bubbles:true}));field.setSelectionRange(4,4);await wait(650);
  check(prefix+' typing preserves focus, caret and outer scroll',d.activeElement===field&&field.selectionStart===4&&Math.abs(w.scrollY-outerY)<2&&preview().location.hash===hash);
  await click('#history-undo');check(prefix+' undo restores moved wording',q('[data-copy="NOW_TITLE"]').value===old);await click('#history-redo');check(prefix+' redo restores moved wording',q('[data-copy="NOW_TITLE"]').value===old+' tonight');
  reveal('[data-key="showSupportTab"]');await input('[data-key="showSupportTab"]',false);check(prefix+' menu visibility changes through shared navigation',!visible(q('#preview').contentDocument.querySelector('[data-tab-target="support"]')));await input('[data-key="showSupportTab"]',true);
  reveal('[data-icon-role="navMusic"]');await click('[data-icon-role="navMusic"]');await click('[data-pick-icon="snowman"]');for(let attempt=0;attempt<20&&!q('#preview').contentDocument.querySelector('[data-tab-target="music"] i')?.classList.contains('fa-snowman');attempt++)await wait(100);check(prefix+' moved icon picker changes navigation',q('#preview').contentDocument.querySelector('[data-tab-target="music"] i').classList.contains('fa-snowman'));
  let copied='';Object.defineProperty(w.navigator,'clipboard',{configurable:true,value:{writeText:async text=>{copied=text;}}});await click('#copy');await click('#close-output');
  const saved=new Map(Object.entries(localStorage)),roundTrip=createDesignStore({getItem:k=>saved.get(k)||null}).read().settings;
  const source=await(await fetch('../'+t.source)).text();check(prefix+' export still matches canonical saved settings',copied===t.render(source,roundTrip));
  check(prefix+' export contains no editor or demo code',!/<script|editor-group|data-copy-group|Winter Starlight|Moonlit Mischief/.test(copied));
  for(const width of [320,390,1280]){
   frame.style.width=width+'px';await wait(120);
   for(const area of Object.keys(t.groups)){await click('[data-editor-group="'+area+'"]');check(prefix+' '+area+' fits '+width,d.documentElement.scrollWidth<=width+1);}
   for(const section of [1,14,23,31]){const el=q('[data-section="'+section+'"]');const group=Object.keys(t.groups).find(k=>t.groups[k].sections.includes(section));await click('[data-editor-group="'+group+'"]');el.open=true;el.querySelectorAll('details').forEach(row=>row.open=true);check(prefix+' expanded section '+section+' fits '+width,d.documentElement.scrollWidth<=width+1);}
  }
  await reload();check(prefix+' moved settings and icons survive reload',frame.contentDocument.querySelector('[data-copy="NOW_TITLE"]').value===old+' tonight'&&frame.contentDocument.querySelector('[data-icon-role="navMusic"]').textContent.includes('Snowman'));
 }
 }catch(error){check(error.stack,false);}finally{localStorage.clear();for(const [key,value] of original)localStorage.setItem(key,value);await reload();run.disabled=false;document.title=results.querySelectorAll('.fail').length+' failures · Shared menu';}
};
