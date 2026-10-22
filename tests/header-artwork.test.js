import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {registry,parseBackup} from '../src/template-registry.js';
import {createDesignStore} from '../src/design-store.js';
import {createSetupDraft} from '../src/setup-model.js';
import {headerArtworkValue,setHeaderArtwork} from '../src/header-artwork.js';
import {logoChoices,logoFile} from '../src/assets.js';
import {transferChoices,applyTransfer,transferValue} from '../src/reuse-policy.js';
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};

test('US fireworks follow motion independently of top and bottom artwork in both exports',async()=>{
 for(const t of registry){const source=await readFile(t.source,'utf8');for(const upper of ['theme','classic','lights','crest','none'])for(const bottom of [false,true])for(const motion of [false,true]){
  const s=t.cloneDefaults('us-patriotic');setHeaderArtwork(s,upper);s.headerBottomDecorations=bottom;s.seasonalMotion=motion;
  const html=t.render(source,s);assert.equal((html.match(/class="celebration-firework celebration-firework-/g)||[]).length,motion?2:0);
  assert(!/<script\b|\son\w+=|localhost|127\.0\.0\.1/.test(html));
 }}
});

test('upper artwork and logo can independently use included pictures in every template and theme',async()=>{
 for(const t of registry){const source=await readFile(t.source,'utf8');for(const theme of Object.keys(t.themes)){
  const s=t.cloneDefaults(theme);s.name='A personalised show';s.logoMode='seasonal';s.logoStyle='crest';setHeaderArtwork(s,'classic');
  const html=t.render(source,s),header=html.match(/<(?:header|div) class="[^"]*share-brand[^>]*>([\s\S]*?)<\/h1>/)[1];
  assert.match(header,/header-artwork-picture/);assert(header.indexOf('header-artwork-picture')<header.indexOf('class="show-logo"'));
  assert(header.includes(logoChoices[theme][0].file));assert(header.includes(logoFile(s)));
  assert(t.assets.includes(logoFile(s)));assert(t.assets.includes(logoChoices[theme][0].file));
  assert(!html.includes('<script'));assert(!header.includes('cc-lights'));assert(!header.includes('cc-web'));
  setHeaderArtwork(s,'none');const hidden=t.render(source,s);assert(!hidden.includes('<div class="header-artwork-picture"'));assert(hidden.includes(logoFile(s)));assert.equal(s.logoMode,'seasonal');
  s.logoMode='none';setHeaderArtwork(s,'lights');assert(t.render(source,s).includes(logoChoices[theme][1].file));assert.equal(s.logoStyle,'crest');
 }}
});

test('legacy hidden artwork and included or custom logos retain their slots on migration',async()=>{
 for(const t of registry){const source=await readFile(t.source,'utf8');for(const theme of Object.keys(t.themes))for(const off of [false,true]){
  const old=t.cloneDefaults(theme);delete old.headerArtwork;old.logoMode='custom';old.logo='https://example.org/own.png';old.headerTopDecorations=!off;old.headerBottomDecorations=!off;old.decorations=!off;
  const migrated=t.checkedSettings(old);assert.equal(headerArtworkValue(migrated),off?'none':'theme');assert.equal(migrated.logo,old.logo);assert.equal(migrated.logoMode,'custom');
  assert.equal(t.render(source,old),t.render(source,migrated));
  delete old.headerTopDecorations;delete old.headerBottomDecorations;old.headerDecorations=!off;
  assert.equal(headerArtworkValue(t.checkedSettings(old)),off?'none':'theme');
 }}
});

test('header choices survive reload, backup and detached setup; invalid choices are rejected',()=>{
 for(const t of registry)for(const theme of Object.keys(t.themes)){
  const storage=memory(),s=t.cloneDefaults(theme),store=createDesignStore(storage);setHeaderArtwork(s,'lights');s.logoMode='custom';s.logo='https://example.org/own.png';
  store.select(t.id,theme);store.save({settings:s,catalogue:null});
  assert.equal(createDesignStore(storage).read().settings.headerArtwork,'lights');
  assert.deepEqual(parseBackup(store.backup()).designs[theme],s);
  const draft=createSetupDraft(s,t);setHeaderArtwork(draft.value,'none');assert.equal(s.headerArtwork,'lights');draft.skip();assert.equal(draft.value.headerArtwork,'lights');setHeaderArtwork(draft.value,'crest');assert.equal(draft.finish().headerArtwork,'crest');
  assert.throws(()=>t.checkedSettings({...s,headerArtwork:'javascript:bad'}),/header artwork/);
 }
});

test('reuse offers one effective header choice independently of logo settings and untouched defaults',()=>{
 for(const a of registry)for(const b of registry){
  const s=a.cloneDefaults('christmas'),d=b.cloneDefaults('halloween');setHeaderArtwork(s,'lights');s.logoMode='custom';s.logo='https://example.org/personal.png';
  const groups=transferChoices(s,a,d,b),items=groups.flatMap(g=>g.items);assert.equal(items.filter(i=>i.id==='headerArtwork').length,1);const headerItem=items.find(i=>i.id==='headerArtwork');assert(transferValue(headerItem,headerItem.value).includes(logoChoices.halloween[1].label));assert.equal(transferValue(headerItem,headerItem.current),'Theme default');assert(!items.some(i=>i.id==='headerTopDecorations'));
  const headerOnly=applyTransfer(d,b,groups,['headerArtwork']).settings;assert.equal(headerOnly.headerArtwork,'lights');assert.equal(headerOnly.logoMode,d.logoMode);assert.equal(headerOnly.logo,d.logo);
  const logoOnly=applyTransfer(d,b,groups,['logoMode','logo']).settings;assert.equal(logoOnly.headerArtwork,'theme');assert.equal(logoOnly.logo,s.logo);
  s.headerTopDecorations=false;const hidden=transferChoices(s,a,d,b);assert.equal(applyTransfer(d,b,hidden,['headerArtwork']).settings.headerTopDecorations,false);
 }
});
