import {cloneDefaults,settingsFile,render,parseSettings} from '../src/template.js';
import {SETTINGS_KEY} from '../src/storage.js';
import {restoreCatalogue} from '../src/catalogue.js';
import {createPreview} from '../src/preview.js';
const editor=document.querySelector('#editor'),viewer=document.querySelector('#viewer'),results=document.querySelector('#results'),run=document.querySelector('#run');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS — ':'FAIL — ')+name;results.append(li);};
const visible=e=>!!e&&e.getClientRects().length>0&&e.ownerDocument.defaultView.getComputedStyle(e).display!=='none';
const load=()=>new Promise(r=>{editor.onload=()=>setTimeout(r,400);editor.contentWindow.location.reload();});
run.onclick=async()=>{
 if(location.hostname!=='localhost')throw Error('Use isolated localhost origin.');
 run.disabled=true;results.replaceChildren();const original=localStorage.getItem(SETTINGS_KEY),cat=restoreCatalogue(localStorage).catalogue;
 try{
  localStorage.setItem(SETTINGS_KEY,settingsFile(cloneDefaults()));await load();let d=editor.contentDocument;
  const q=s=>d.querySelector(s),p=()=>q('#preview').contentDocument;
  const input=async(selector,value)=>{const el=q(selector);if(el.type==='checkbox')el.checked=value;else el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));await wait(400);};
  const click=async selector=>{q(selector).click();await wait(400);};
  check('Primary catalogue controls use consistent wording',q('#detect-categories').textContent==='Detect categories'&&q('#pick-new').textContent==='Set NEW sashes'&&q('#catalogue-options').textContent==='Import details & help');
  if(cat){
   await input('[data-key="newNames"]',cat.songs[0].name);await click('#detect-categories');const before=q('[data-key="newNames"]').value;
   check('Detection opens review without changing selections',q('#category-picker').open&&q('[data-key="newNames"]').value===before);await click('#cancel-categories');check('Cancel leaves categories unchanged',!q('[data-key="categories"]').checked);
   await click('#detect-categories');await click('#apply-categories');check('Apply opens Music category settings',q('[data-editor-group="music"]').getAttribute('aria-pressed')==='true'&&q('[data-section="18"]').open&&q('[data-key="newNames"]').value===before);
   const names=[...d.querySelectorAll('[data-category]')].map(e=>e.value);
   if(names.length>1){
    await input('[data-category-show="0"]',false);check('Hidden category remains in ordered settings',q('[data-category="0"]').value===names[0]&&d.querySelectorAll('[data-category]').length===names.length);
    check('Only its filter button disappears',!p().querySelector('.category-filter-link[href="#songs-category-1"]')&&!!p().querySelector('.category-filter-link[href="#songs-category-2"]'));
    await click('#detect-categories');await click('#apply-categories');check('Detection keeps hidden choice',!q('[data-category-show="0"]').checked);
    await input('[data-category="0"]','Temporary mismatch');check('Mismatch is explained without blocking export',!q('#category-warning').hidden&&!q('#catalogue-warning').hidden&&!q('#copy').disabled);
    check('Mismatch disables remaining category buttons',p().querySelector('.category-filter-link').getAttribute('aria-disabled')==='true');await click('#detect-categories');await click('#apply-categories');check('Detection recovers mismatched names',q('#catalogue-warning').hidden&&!p().querySelector('.category-filter-link[aria-disabled]'));
   }
   await click('#pick-new');await click('#clear-new');await click('#cancel-new');check('Cancelled NEW clear keeps selections',q('[data-key="newNames"]').value===before);
  }else check('Import required guidance',q('#detect-categories').disabled&&q('#pick-new').disabled&&q('#pick-new-help').textContent.includes('Import'));
  await click('[data-editor-group="home"]');await input('[data-key="homeMusicLink"]',false);check('Home Music link hidden but navbar retained',!visible(p().querySelector('.music-tab-button'))&&visible(p().querySelector('.los-menu a[href="#music-panel"]')));
  await click('[data-editor-group="setup"]');await click('[data-season="halloween"]');check('Halloween has independent off toggle',!q('[data-key="halloweenCountdown"]').checked&&!p().querySelector('#to-halloween-days'));
  await input('[data-key="halloweenCountdown"]',true);await input('[data-copy="COUNTDOWN_TITLE"]','Our spooky evening');await click('[data-editor-group="home"]');check('Halloween countdown uses edited title',visible(p().querySelector('.halloween-countdown'))&&p().querySelector('.halloween-countdown').textContent.includes('Our spooky evening'));
  await input('[data-key="queueCount"]',true);await input('[data-key="votesRemaining"]',true);await load();d=editor.contentDocument;
  check('New settings restore',!q('[data-key="homeMusicLink"]').checked&&q('[data-key="halloweenCountdown"]').checked&&q('[data-key="queueCount"]').checked&&q('[data-key="votesRemaining"]').checked);
  const restored=parseSettings(localStorage.getItem(SETTINGS_KEY));check('Settings backup preserves hidden choices',Array.isArray(restored.hiddenCategories));
  const source=await(await fetch('../templates/christmas.html')).text(),s=cloneDefaults('halloween');Object.assign(s,{categories:true,categoryNames:['First','Middle','Last'],hiddenCategories:['First','Middle'],newFilter:true,newNames:'One More Rainbow',homeMusicLink:false,halloweenCountdown:true,queueCount:true,votesRemaining:true});
  const demo=createPreview(viewer,()=>{}),v=()=>viewer.contentDocument;
  const update=async options=>{demo.update(render(source,s),s,options);await wait(180);};
  const hash=async target=>{viewer.contentWindow.location.hash=target;await wait(50);};
  const groups=()=>[...v().querySelectorAll('.los-song-list>.category-section')].filter(visible);
  for(const mode of ['jukebox','voting']){
   await update({mode,air:true,reset:true,locationMode:'code'});await hash('#music-panel');
   await hash('#songs-category-3');check(`Last button maps to third group: ${mode}`,groups().length===1&&groups()[0].querySelector('.category-label').textContent==='Last');
   await hash('#songs-category-1');check(`Hidden filter URL falls back to All: ${mode}`,groups().length===3&&visible(v().querySelector('#music-panel')));
   await hash('#songs-all');await hash('#songs-category-3');viewer.contentWindow.history.back();await wait(80);check(`Back restores All: ${mode}`,groups().length===3);viewer.contentWindow.history.forward();await wait(80);check(`Forward restores Last: ${mode}`,groups().length===1);
   await hash('#songs-all');check(`Code entry uses compact Music card: ${mode}`,visible(v().querySelector('.location-code-card input')));
   const counter=v().querySelector(mode==='jukebox'?'.rf-queue-size':'.votes-remaining');check(`Initial counter: ${mode}`,counter.textContent===(mode==='jukebox'?'0':'5 of 5 votes left this show'));
   const song=v().querySelector(mode==='jukebox'?'.jukebox-list:not(.sequence-unavailable)':'.cell-vote-playlist:not(.sequence-unavailable)');song.click();await wait(50);check(`Counter updates after local choice: ${mode}`,counter.textContent===(mode==='jukebox'?'1':'4 of 5 votes left this show'));
   const feedback=v().querySelector('#requestSuccessful'),box=viewer.getBoundingClientRect(),hit=v().elementFromPoint(20,20);check(`Confirmation blocks background taps: ${mode}`,visible(feedback)&&!!hit?.closest('.request-feedback'));
   await update({mode,air:true,categoriesMismatch:true,reset:true});await hash('#songs-category-3');check(`Mismatch disarms positional filtering: ${mode}`,groups().length===3&&v().querySelector('.category-filter-link').getAttribute('aria-disabled')==='true');
   await hash('#songs-new');
   const newRows=[...v().querySelectorAll('.los-song-list [role=button]')].filter(visible);
   check(`NEW works during mismatch: ${mode}`,newRows.some(row=>row.dataset.key===s.newNames)&&newRows.length===3&&newRows.every(row=>row.dataset.key===s.newNames||row.hasAttribute('data-demo-new')));
   for(const air of [true,false]){await update({mode,air});await hash('#home-panel');check(`Seasonal card visible: ${mode}/${air}`,visible(v().querySelector('.halloween-countdown')));check(`Home shortcut stays hidden: ${mode}/${air}`,!visible(v().querySelector('.music-tab-button')));}
  }
  s.hiddenCategories=[...s.categoryNames];s.newFilter=false;await update({mode:'jukebox',air:true,locationMode:'code'});await hash('#music-panel');check('No enabled filters hides bar',!visible(v().querySelector('.music-filter')));
  for(const width of [320,390,768,1280]){viewer.style.width=width+'px';v().documentElement.style.fontSize='150%';await wait(40);check(`Access card fits enlarged text at ${width}px`,v().documentElement.scrollWidth<=width+1);}
  s.hiddenCategories=['First','Middle'];s.newFilter=true;await update({mode:'voting',air:true});await hash('#music-panel');const vote=v().querySelector('.votes-remaining');vote.textContent='';check('Empty RF vote wording collapses',!visible(vote));
  check('Export excludes preview and custom scripts',!/<script|onchange=|Demo:|Illustrative|locationNotice|timeRemaining/i.test(render(source,s)));
 }catch(e){check(e.stack,false);}finally{if(original===null)localStorage.removeItem(SETTINGS_KEY);else localStorage.setItem(SETTINGS_KEY,original);await load();run.disabled=false;document.title=results.querySelector('.fail')?'FAIL — Polish':'PASS — Polish';}
};
