import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {registry,parseBackup} from '../src/template-registry.js';
import {createDesignStore,copyDetails} from '../src/design-store.js';
import {createSetupDraft} from '../src/setup-model.js';
import {headerIdentity,headerLabel} from '../src/header-identity.js';
const memory=()=>{const values=new Map();return {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};};

test('no logo removes only header identity artwork and survives storage and backups in every theme',async()=>{
 for(const t of registry){const source=await readFile(new URL('../'+t.source,import.meta.url),'utf8');for(const theme of Object.keys(t.themes)){
  const s=t.cloneDefaults(theme);Object.assign(s,{logoMode:'none',logo:'https://example.org/saved-logo.png',name:'Our own show',welcome:'Our own welcome',icons:{brand:'crow'}});
  const html=t.render(source,s),header=html.match(/<(?:header|div) class="[^"]*share-brand[^>]*>([\s\S]*?)<\/h1>/)?.[1];assert(header,t.id);
  assert.doesNotMatch(header,/class="show-logo"|fa-crow|cc-brand-icon/);assert.match(header,/Our own show/);assert.match(html,/Our own welcome/);
  assert.equal(header.includes('season-header-art'),!['christmas','halloween'].includes(theme));
  assert.equal(t.validate(s).logo,undefined);
  const storage=memory(),store=createDesignStore(storage);store.select(t.id,theme);store.save({settings:s,catalogue:null});
  const reloaded=createDesignStore(storage).read().settings;assert.equal(reloaded.logoMode,'none');assert.equal(reloaded.logo,s.logo);assert.equal(reloaded.icons.brand,'crow');
  const backup=parseBackup(store.backup());assert.equal(backup.designs[theme].logoMode,'none');
  const draft=createSetupDraft(s,t);assert.equal(draft.finish().logoMode,'none');
  for(const destination of registry)assert.equal(copyDetails(s,destination.cloneDefaults(),['identity'],destination).logoMode,'none');
 }}
});

test('Compact legacy styled-name values display No logo without altering saved settings or output',async()=>{
 const t=registry[1],s=t.cloneDefaults(),source=await readFile(new URL('../'+t.source,import.meta.url),'utf8');
 assert.equal(s.logoMode,'icon');assert.equal(headerLabel(s,t.features),'No logo');
 assert.match(headerIdentity(s,{features:t.features}),/<option value="none" selected>No logo<\/option>/);
 assert.equal(t.render(source,s),t.render(source,{...s,logoMode:'none'}));
 assert.equal(copyDetails(s,registry[0].cloneDefaults(),['identity'],registry[0]).logoMode,'none');
 assert.equal(s.logoMode,'icon');
});
