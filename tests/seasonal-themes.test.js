import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {registry} from '../src/template-registry.js';
import {themes} from '../src/themes.js';
import {settingsForm} from '../src/editor-form.js';
import {createDesignStore,copyDetails} from '../src/design-store.js';
import {createHistoryBank} from '../src/history.js';
import {createSetupDraft} from '../src/setup-model.js';
import {viewerFilename} from '../src/release-ux.js';
import {seasonalAssetFiles} from '../src/seasonal-style.js';
import {logoChoices} from '../src/assets.js';
const seasons=['thanksgiving','australia-day'];
const sources=new Map(await Promise.all(registry.map(async t=>[t.id,await readFile(new URL('../'+t.source,import.meta.url),'utf8')])));
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};};

test('new seasonal exports keep both RF modes, attribution and script-free decorations',()=>{
 for(const t of registry)for(const theme of seasons){
  const s=t.cloneDefaults(theme),html=t.render(sources.get(t.id),s);
  for(const hook of ['{NOW_PLAYING}','{PLAYLISTS}','{JUKEBOX_QUEUE}','{playlist-voting-dynamic-container}','requestSuccessful','invalidLocationCode'])assert(html.includes(hook),hook);
  assert.match(html,/Dynamic Menu by Matt Orelup/);assert.match(html,/season-header-art/);assert.match(html,/prefers-reduced-motion:reduce/);
  assert.doesNotMatch(html,/<script\b|\son\w+\s*=|\[\[|Demo:|Harvest Moonlight|Under Southern Stars|id="to-(christmas|halloween)-/i);
  assert.doesNotMatch(html,/Share the Christmas Spirit|Santa is|nice list|tinsel/);
  assert.equal(s.flagPlacement,'header');assert.equal(s.headerDecorations,true);assert.equal(s.navbarDetails,true);
  assert(viewerFilename(s,t).endsWith(themes[theme].name.replace(/ /g,'-')+'.html'));
 }
});

test('new seasonal controls share ownership without exposing unsupported countdowns',()=>{
 for(const t of registry)for(const theme of seasons){const s=t.cloneDefaults(theme),html=settingsForm(s,t);
  for(const key of ['headerTopDecorations','headerBottomDecorations','navbarDetails','seasonalMotion'])assert.equal(html.split('data-key="'+key+'"').length-1,1);
  assert(!html.includes('data-key="flagPlacement"'));assert(!html.includes('data-section="21"'));
  assert(!html.includes('data-key="decorationMotion"'));assert(html.includes('data-season="christmas"'));assert(html.includes('data-season="thanksgiving"'));
 }
});

test('header, navbar and motion settings act independently and validate saved values',()=>{
 for(const t of registry){const s=t.cloneDefaults('australia-day'),source=sources.get(t.id);s.flagPlacement='edges';
  let html=t.render(source,s);assert.doesNotMatch(html,/<div class="season-drift /);assert.match(html,/animation:season-bunting/);
  s.headerTopDecorations=false;s.headerBottomDecorations=false;html=t.render(source,s);assert.doesNotMatch(html,/<div class="season-header-art"|<div class="season-drift /);assert.match(html,/season-navbar-on/);
  s.navbarDetails=false;html=t.render(source,s);assert.doesNotMatch(html,/class="[^"]*season-navbar-on/);
  s.headerTopDecorations=true;s.headerBottomDecorations=true;s.seasonalMotion=false;html=t.render(source,s);assert.match(html,/<div class="season-header-art"/);assert.doesNotMatch(html,/<div class="season-drift /);
  assert.throws(()=>t.checkedSettings({...s,flagPlacement:'body'}));assert.throws(()=>t.checkedSettings({...s,seasonalMotion:'yes'}));
 }
});

test('legacy settings gain compatible hidden controls while original exports keep their classes',()=>{
 for(const t of registry)for(const theme of ['christmas','halloween']){const s=t.cloneDefaults(theme);for(const key of ['headerDecorations','headerTopDecorations','headerBottomDecorations','navbarDetails','seasonalMotion','flagPlacement'])delete s[key];
  const restored=t.checkedSettings(s);assert.equal(restored.headerDecorations,true);assert.equal(restored.flagPlacement,'header');
  assert.doesNotMatch(t.render(sources.get(t.id),restored),/season-header-art|season-drift|season-navbar-on/);
 }
});

test('older two-season Compact storage and imports preserve new seasonal work and undo history',()=>{
 const t=registry[1],storage=memory(),legacy={christmas:t.cloneDefaults(),halloween:t.cloneDefaults('halloween')};legacy.christmas.name='Old personal name';
 storage.setItem(t.storageKey,t.settingsFile(legacy));const store=createDesignStore(storage),bank=createHistoryBank();
 assert.equal(store.has(t.id,'thanksgiving'),false);assert.equal(store.isSaved(t.id,'australia-day'),false);
 for(const theme of seasons){store.select(t.id,theme);let value=store.read();const h=bank.get(store.key,value);value.settings.name='Saved '+theme;value.settings.flagPlacement='edges';h.record(value);store.save(value);}
 legacy.christmas.name='Imported original';store.import(t.settingsFile(legacy),()=>{});
 for(const theme of seasons){store.select(t.id,theme);assert.equal(store.read().settings.name,'Saved '+theme);assert.equal(store.read().settings.flagPlacement,'edges');}
 store.save(bank.get(store.key).undo());assert.equal(store.read().settings.name,t.cloneDefaults('australia-day').name);
 store.select(t.id,'thanksgiving');assert.equal(store.read().settings.name,'Saved thanksgiving');
 const again=createDesignStore(storage);again.select(t.id,'thanksgiving');assert.equal(again.read().settings.name,'Saved thanksgiving');
 assert.deepEqual(Object.keys(JSON.parse(store.backup()).designs),Object.keys(themes));
});

test('original theme switching updates defaults while preserving custom content and old countdown choices',()=>{
 const t=registry[0];let s=t.cloneDefaults();s.name='Personal show';s.welcome='Our welcome';s.colours.gold='#abcdef';s.icons.brand='music';s.halloweenCountdown=true;s.countdownFormat='full';
 for(const theme of [...seasons,'halloween','christmas']){s=t.changeTheme(s,theme);assert.equal(s.name,'Personal show');assert.equal(s.welcome,'Our welcome');assert.equal(s.colours.gold,'#abcdef');assert.equal(s.icons.brand,'music');assert.equal(s.halloweenCountdown,true);assert.equal(s.countdownFormat,'full');}
 for(const theme of seasons){const changed=t.changeTheme(t.cloneDefaults(),theme);assert.equal(changed.name,themes[theme].showName);assert.deepEqual(changed.colours,themes[theme].colours);assert.equal(changed.schedule[2].day,themes[theme].holiday);}
});

test('new seasons round-trip, copy content without style, and keep setup edits detached',()=>{
 for(const t of registry)for(const theme of seasons){const s=t.cloneDefaults(theme);s.name='A saved show';s.headerTopDecorations=false;s.headerBottomDecorations=false;s.seasonalMotion=false;s.flagPlacement='edges';
  const file=t.settingsFile(t.separateSeasons?Object.fromEntries(Object.keys(themes).map(k=>[k,k===theme?s:t.cloneDefaults(k)])):s);
  const parsed=t.parseSettings(file);assert.deepEqual(t.separateSeasons?parsed[theme]:parsed,s);
  const draft=createSetupDraft(s,t);draft.value.icons.brand='sun';draft.enter();draft.value.name='Temporary';draft.skip();assert.equal(draft.value.name,s.name);assert.equal(s.icons.brand,undefined);assert.equal(draft.finish().icons.brand,'sun');
  const dest=t.cloneDefaults(theme==='thanksgiving'?'australia-day':'thanksgiving'),copied=copyDetails(s,dest,['identity','schedule'],t);assert.equal(copied.name,s.name);assert.deepEqual(copied.colours,dest.colours);assert.equal(copied.headerDecorations,true);
 }
});

test('all seasonal artwork is lightweight, packaged, and original included-logo choices remain usable',async()=>{
 for(const file of seasonalAssetFiles){const data=await readFile(new URL('../assets/'+file,import.meta.url));if(file.endsWith('.webp')){assert.equal(data.subarray(8,12).toString(),'WEBP');assert(data.length<160000);for(const t of registry)assert(t.assets.includes(file));continue;}const svg=data.toString();assert.match(svg,/^<svg/);assert.doesNotMatch(svg,/<script|<foreignObject|\son\w+\s*=|(?:href|src)=["'](?:https?:|data:)/i);for(const t of registry)assert(t.assets.includes(file));}
 for(const t of registry)for(const theme of seasons)assert(t.downloads[theme]);
 const t=registry[0];for(const theme of seasons)for(const choice of logoChoices[theme]){const s=t.cloneDefaults(theme);s.logoMode='seasonal';s.logoStyle=choice.id;s.combineLogoName=true;const html=t.render(sources.get(t.id),s);assert(html.includes(choice.file));await access(new URL('../assets/'+choice.file,import.meta.url));}
});


test('Australian Home symbol respects custom choices and resets without changing saved icon IDs',()=>{
 const t=registry[0],s=t.cloneDefaults('australia-day'),source=sources.get(t.id);
 assert.match(t.render(source,s),/data-tab-target="home"[^>]*>\s*<i class="season-home-icon"/);
 assert.match(settingsForm(s,t),/Southern Cross/);
 s.icons.navHome='home';assert.match(t.render(source,s),/data-tab-target="home"[^>]*>\s*<i class="fa-solid fa-house"/);
 s.icons.navHome='star';assert.match(t.render(source,s),/data-tab-target="home"[^>]*>\s*<i class="fa-solid fa-star"/);
 delete s.icons.navHome;assert.match(t.render(source,s),/data-tab-target="home"[^>]*>\s*<i class="season-home-icon"/);
 s.theme='christmas';assert.doesNotMatch(t.render(source,s),/season-home-icon/);
});


test('Australia Day wording overrides remain personal and custom card palettes take priority',()=>{
 for(const t of registry){
  const s=t.cloneDefaults('australia-day'),source=sources.get(t.id);
  let html=t.render(source,s);
  assert(html.includes('Snags are cooking, enjoy the tunes'));
  assert(html.includes('Knocked off for the day'));
  assert(html.includes('listening gold, information blue, support red'));
  s.copy.ON_AIR_HELP='My own live message';s.copy.OFF_AIR_HELP='My own return message';
  html=t.render(source,s);assert(html.includes('My own live message'));assert(html.includes('My own return message'));
  assert(!html.includes('Snags are cooking'));assert(!html.includes('Knocked off for the day'));
  for(const key of ['card','gold','text','secondary']){
   const custom=structuredClone(s);custom.colours[key]='#abcdef';if(t.separateSeasons)custom.advancedColours=true;
   html=t.render(source,custom);assert(!html.includes('listening gold, information blue, support red'));
   assert(html.includes('#abcdef'));
  }
 }
});


test('older header-art switches migrate to both independent choices without changing visibility',()=>{
 for(const t of registry)for(const theme of seasons)for(const enabled of [true,false]){
  const old=t.cloneDefaults(theme);delete old.headerTopDecorations;delete old.headerBottomDecorations;old.headerDecorations=enabled;
  const restored=t.checkedSettings(old);
  assert.equal(restored.headerTopDecorations,enabled);assert.equal(restored.headerBottomDecorations,enabled);
  const file=t.settingsFile(t.separateSeasons?Object.fromEntries(Object.keys(themes).map(k=>[k,k===theme?old:t.cloneDefaults(k)])):old);
  const parsed=t.parseSettings(file),fromBackup=t.separateSeasons?parsed[theme]:parsed;assert.equal(fromBackup.headerTopDecorations,enabled);assert.equal(fromBackup.headerBottomDecorations,enabled);
  const storage=memory();storage.setItem(t.storageKey,file);const store=createDesignStore(storage);store.select(t.id,theme);assert.equal(store.read().settings.headerTopDecorations,enabled);assert.equal(store.read().settings.headerBottomDecorations,enabled);
  assert.equal(t.render(sources.get(t.id),restored).includes('<div class="season-header-art"'),enabled);
  old.headerTopDecorations=!enabled;
  const partial=t.checkedSettings(old);assert.equal(partial.headerTopDecorations,!enabled);assert.equal(partial.headerBottomDecorations,enabled);
  for(const key of ['headerTopDecorations','headerBottomDecorations'])assert.throws(()=>t.checkedSettings({...restored,[key]:'yes'}));
 }
});

test('independent header artwork survives storage, backups and history without copying another design style',()=>{
 for(const t of registry)for(const theme of seasons)for(const top of [true,false])for(const bottom of [true,false]){
  const storage=memory(),store=createDesignStore(storage);store.select(t.id,theme);const original=store.read(),changed=structuredClone(original);
  changed.settings.headerTopDecorations=top;changed.settings.headerBottomDecorations=bottom;
  const bank=createHistoryBank(),history=bank.get(store.key,original);history.record(changed);store.save(changed);
  const again=createDesignStore(storage);again.select(t.id,theme);assert.deepEqual(again.read().settings,changed.settings);
  const backup=t.parseSettings(store.backup());assert.deepEqual(t.separateSeasons?backup[theme]:backup,changed.settings);
  const html=t.render(sources.get(t.id),changed.settings);
  assert.equal(/class="[^"\n]* season-header-top(?:[ "])/.test(html),top);assert.equal(/class="[^"\n]* season-header-bottom(?:[ "])/.test(html),bottom);
  assert.equal(html.includes('<div class="season-header-art"'),top||bottom);
  assert.equal(html.includes('<div class="season-drift '),theme==='thanksgiving');
  const copied=copyDetails(changed.settings,t.cloneDefaults(theme),['identity','schedule'],t);assert.equal(copied.headerTopDecorations,true);assert.equal(copied.headerBottomDecorations,true);
  if(!top||!bottom){assert.deepEqual(history.undo(),original);assert.deepEqual(history.redo(),changed);}
 }
});


test('Thanksgiving keeps personal colours, wording and Home icons while supplying compatible defaults',()=>{
 for(const t of registry){
  const s=t.cloneDefaults('thanksgiving'),source=sources.get(t.id);
  let html=t.render(source,s);
  assert(html.includes('Gather round and enjoy the lights'));
  assert(html.includes('Thanks for stopping by - see you next show'));
  assert(html.includes('information forest green, support cranberry'));
  assert(!Object.values(themes.thanksgiving.copy).some(value=>value.includes('\u2014')));
  s.copy.ON_AIR_HELP='Our own message';s.copy.OFF_AIR_HELP='Our own return';
  html=t.render(source,s);assert(html.includes('Our own message'));assert(html.includes('Our own return'));assert(!html.includes('Thanks for stopping by - see you next show'));
  for(const key of ['card','gold','text','secondary']){
   const custom=structuredClone(s);custom.colours[key]='#abcdef';if(t.separateSeasons)custom.advancedColours=true;
   html=t.render(source,custom);assert(!html.includes('information forest green, support cranberry'));assert(html.includes('#abcdef'));
  }
  if(t.landing==='home'){
   assert.match(t.render(source,s),/data-tab-target="home"[^>]*>\s*<i class="season-turkey-icon"/);
   assert.match(settingsForm(s,t),/Turkey/);
   s.icons.navHome='home';assert.match(t.render(source,s),/data-tab-target="home"[^>]*>\s*<i class="fa-solid fa-house"/);
  }
 }
});

test('Thanksgiving falling leaves are independent of header art and stay optional through backup and history',()=>{
 for(const t of registry){
  const s=t.cloneDefaults('thanksgiving');s.headerTopDecorations=false;s.headerBottomDecorations=false;
  let html=t.render(sources.get(t.id),s);assert(html.includes('season-drift-screen'));assert(!html.includes('<div class="season-header-art"'));
  assert.match(settingsForm(s,t),/Show falling leaves/);
  const storage=memory(),store=createDesignStore(storage);store.select(t.id,'thanksgiving');const original=store.read();const changed=structuredClone(original);changed.settings={...s,seasonalMotion:false};
  const history=createHistoryBank().get(store.key,original);history.record(changed);store.save(changed);
  const parsed=t.parseSettings(store.backup()),restored=t.separateSeasons?parsed.thanksgiving:parsed;
  assert.equal(restored.seasonalMotion,false);assert(!t.render(sources.get(t.id),restored).includes('<div class="season-drift '));
  assert.deepEqual(history.undo(),original);assert.deepEqual(history.redo(),changed);
 }
});
