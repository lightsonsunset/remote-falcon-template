import test from 'node:test';
import assert from 'node:assert/strict';
import {registry,parseBackup} from '../src/template-registry.js';
import {welcomeControls,welcomeSummary} from '../src/header-identity.js';
import {settingsForm} from '../src/editor-form.js';
import {createSetupDraft,setupKeys} from '../src/setup-model.js';
import {createDesignStore,copyDetails,copyGroups} from '../src/design-store.js';
import {transferPolicy,transferChoices,applyTransfer} from '../src/reuse-policy.js';
import {createHistory} from '../src/history.js';
const keys=['welcome','showWelcome','welcomeStyle','welcomePosition','customWelcomeColours','welcomeCardColour','welcomeTextColour'];
const values={welcome:'Our <welcome> & friends',showWelcome:false,welcomeStyle:'card',welcomePosition:'status',customWelcomeColours:true,welcomeCardColour:'#263746',welcomeTextColour:'#ffffff'};
const pick=s=>Object.fromEntries(keys.map(k=>[k,s[k]]));
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};};
test('one independent welcome control set serves editor and Quick Setup',()=>{
 for(const t of registry){const s={...t.cloneDefaults(),...values};
 for(const setup of [false,true]){const html=welcomeControls(s,{setup}),attr=setup?'data-setup-key':'data-key';for(const key of keys)assert.equal(html.split(attr+'="'+key+'"').length,2);assert.match(html,/Our &lt;welcome&gt; &amp; friends/);assert.doesNotMatch(html,/showWelcome" checked/);assert.match(html,/<option value="card" selected>/);assert.match(html,/<option value="status" selected>/);assert.match(html,/<option value="header"[^>]*>With show name<\/option>/);assert.doesNotMatch(html,/disabled|showHeaderTagline/);assert.equal(html.split('Below On air is only shown while your show is on air.').length,2);}
 const html=settingsForm(s,{features:t.features,presets:t.presets});for(const key of keys)assert.equal(html.split('data-key="'+key+'"').length,2);
 assert.equal(welcomeSummary(s),'Hidden (wording kept)');assert.match(welcomeControls({...s,showWelcome:undefined}),/showWelcome" checked/);
 for(const key of keys){assert(setupKeys[0].includes(key));assert(copyGroups.welcome.includes(key));assert(copyGroups.identity.includes(key));assert(transferPolicy.welcome.keys.includes(key));}
 }
});
test('welcome settings survive Quick Skip, Cancel isolation, Apply, Undo, store reload and backup',()=>{
 for(const t of registry)for(const theme of Object.keys(t.themes)){
 const original=t.cloneDefaults(theme),before=structuredClone(original),draft=createSetupDraft(original,t);draft.enter();Object.assign(draft.value,values);assert.deepEqual(original,before);draft.skip();assert.deepEqual(draft.value,before);
 Object.assign(draft.value,values);const applied=draft.finish();assert.deepEqual(pick(applied),values);assert.deepEqual(original,before);
 const history=createHistory(original);history.record(applied);assert.deepEqual(history.undo(),before);assert.deepEqual(pick(history.redo()),values);
 const storage=memory(),store=createDesignStore(storage);store.select(t.id,theme);store.save({settings:applied,catalogue:null});assert.deepEqual(pick(createDesignStore(storage).read().settings),values);assert.deepEqual(pick(parseBackup(store.backup()).designs[theme]),values);
 for(const target of registry){for(const group of ['welcome','identity'])assert.deepEqual(pick(copyDetails(applied,target.cloneDefaults(),[group],target)),values);
 const destination=target.cloneDefaults(),groups=transferChoices(applied,t,destination,target);assert.deepEqual(pick(applyTransfer(destination,target,groups,keys).settings),values);}
 }
});
test('welcome reuse groups visibility and layout without importing unchanged seasonal wording',()=>{
 for(const t of registry){const source=t.cloneDefaults('christmas');source.welcomeStyle='card';const destination=t.cloneDefaults('halloween');
 let groups=transferChoices(source,t,destination,t),item=groups.flatMap(g=>g.items).find(i=>i.id==='welcome');assert(item);assert.equal(item.value.welcome,destination.welcome);assert.deepEqual(transferPolicy.welcome.keys,keys);assert.equal(applyTransfer(destination,t,groups,['welcome']).settings.welcome,destination.welcome);
 destination.welcome='Personal destination';groups=transferChoices(source,t,destination,t,{existing:true});assert.equal(applyTransfer(destination,t,groups,['welcome']).settings.welcome,destination.welcome);
 source.welcome='';groups=transferChoices(source,t,destination,t);assert.equal(applyTransfer(destination,t,groups,['welcome']).settings.welcome,'');
 }
});

test('raw header or absent position displays With show name without mutating settings',()=>{for(const t of registry)for(const value of ['header',undefined])for(const setup of [false,true]){const s={...t.cloneDefaults(),welcomePosition:value},before=structuredClone(s),html=welcomeControls(s,{setup});assert.match(html,/<option value="header" selected>/);assert.match(html,/<option value="header"[^>]*>With show name<\/option>/);assert.deepEqual(s,before);}});
