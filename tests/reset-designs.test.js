import test from 'node:test';
import assert from 'node:assert/strict';
import {createDesignStore} from '../src/design-store.js';
import {registry,parseBackup} from '../src/template-registry.js';
import {createHistoryBank} from '../src/history.js';
import {parseCatalogue} from '../src/catalogue.js';
import {PREFS_KEY} from '../src/storage.js';
const memory=()=>{const data=new Map();return {data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
const catalogue=parseCatalogue('name,displayName,artist,group,imageUrl,category\nunit,Unit song,,,,Seasonal','unit.csv');
function seed(store,t,theme){store.select(t.id,theme);const state=store.read();Object.assign(state.settings,{name:'Personal '+t.id+' '+theme,welcome:'Personal welcome',newNames:'unit',frequency:'88.7'});state.settings.colours.card='#123456';state.settings.copy.SUCCESS_TITLE='My success message';state.catalogue=structuredClone(catalogue);store.save(state);return state;}

test('all-design reset uses each template and theme defaults, preserves catalogues and preferences, and supports independent undo/redo',()=>{
 const storage=memory(),store=createDesignStore(storage),bank=createHistoryBank(),before=new Map();
 storage.setItem('unrelated-app','keep');
 for(const t of registry)for(const theme of Object.keys(t.themes)){const state=seed(store,t,theme);before.set(store.key,state);bank.get(store.key,state);}
 const active=store.key,prefs=storage.getItem(PREFS_KEY),result=store.resetAll((key,a,b)=>bank.get(key,a).record(b,{label:'Reset all saved designs'}));
 assert.deepEqual(result,{saved:true,count:12});assert.equal(store.key,active);assert.equal(storage.getItem(PREFS_KEY),prefs);assert.equal(storage.getItem('unrelated-app'),'keep');
 const restored=createDesignStore(storage);
 for(const t of registry)for(const theme of Object.keys(t.themes)){
  restored.select(t.id,theme);assert.deepEqual(restored.read().settings,t.cloneDefaults(theme));assert.deepEqual(restored.read().catalogue,catalogue);assert(restored.isSaved(t.id,theme));
  store.select(t.id,theme);const h=bank.get(store.key);assert.equal(h.status.undoLabel,'Reset all saved designs');store.save(h.undo());assert.deepEqual(store.read(),before.get(store.key));store.save(h.redo());assert.deepEqual(store.read().settings,t.cloneDefaults(theme));assert.deepEqual(store.read().catalogue,catalogue);
 }
});

test('reset includes an unsaved current design without creating unused themes and clears reuse links in both directions',()=>{
 const storage=memory(),store=createDesignStore(storage);seed(store,registry[0],'christmas');seed(store,registry[1],'halloween');store.connect('festive:christmas',['frequency']);const changed=store.read();changed.settings.frequency='90.1';store.save(changed);store.select('festive','christmas');assert.equal(store.pending().length,1);
 store.select('compact-console','us-patriotic');assert(!store.has('compact-console','us-patriotic'));assert.deepEqual(store.resetAll(),{saved:true,count:3});assert.equal(store.all().length,3);
 const restored=createDesignStore(storage);for(const design of restored.all()){restored.select(design.template,design.season);assert.deepEqual(restored.pending(),[]);const file=parseBackup(restored.backup());assert.deepEqual(file.reuse[design.season],{});}
 assert(!restored.has('festive','valentines-day'));assert(!restored.has('compact-console','thanksgiving'));
});

test('legacy settings reset preserves migration recovery copies and imported song lists',()=>{
 const t=registry[0],storage=memory(),s=t.cloneDefaults('halloween');s.name='Legacy personalised name';const raw=t.settingsFile(s);storage.setItem(t.storageKey,raw);storage.setItem(t.catalogueKey,JSON.stringify(catalogue));const store=createDesignStore(storage);
 assert.equal(store.resetAll().saved,true);assert.equal(storage.getItem(t.storageKey+':before-seasonal-designs'),raw);const reload=createDesignStore(storage);assert.equal(reload.read().settings.name,t.cloneDefaults('halloween').name);assert.deepEqual(reload.read().catalogue,catalogue);
});

test('failed persistence is reported and original settings remain undoable in the session',()=>{
 const storage=memory(),store=createDesignStore(storage),bank=createHistoryBank();const original=seed(store,registry[0],'christmas'),old=storage.getItem(registry[0].storageKey);storage.setItem=()=>{throw Error('Unavailable storage');};
 assert.equal(store.resetAll((key,a,b)=>bank.get(key,a).record(b)).saved,false);assert.equal(store.isSaved('festive','christmas'),false);assert.equal(storage.getItem(registry[0].storageKey),old);assert.deepEqual(bank.get(store.key).undo(),original);assert.deepEqual(store.read().catalogue,catalogue);
});
