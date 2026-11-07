import test from 'node:test';
import assert from 'node:assert/strict';
import {registry,parseBackup} from '../src/template-registry.js';
import {welcomeColourForm,updateWelcomeColours} from '../src/welcome-colour-form.js';
import {createDesignStore,copyDetails} from '../src/design-store.js';
import {createSetupDraft,setupKeys} from '../src/setup-model.js';
import {createHistory} from '../src/history.js';
import {transferChoices,applyTransfer} from '../src/reuse-policy.js';
const keys=['customWelcomeColours','welcomeCardColour','welcomeTextColour'],values={customWelcomeColours:true,welcomeCardColour:'#123456',welcomeTextColour:'#fedcba'},pick=s=>Object.fromEntries(keys.map(k=>[k,s[k]]));
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};};
test('shared colour controls retain saved values, use native inputs and remain hidden for plain welcome',()=>{
 for(const style of ['plain','card'])for(const custom of [false,true])for(const setup of [false,true]){
 const s={welcomeStyle:style,...values,customWelcomeColours:custom},before=structuredClone(s),html=welcomeColourForm(s,{setup,namespace:'full-'});assert.deepEqual(s,before);assert.equal(html.includes('data-welcome-colours hidden'),style==='plain');assert.equal(html.includes('data-welcome-colour-fields hidden'),!custom);for(const key of keys)assert.match(html,new RegExp((setup?'data-setup-key':'data-key')+'="'+key+'"'));assert.equal((html.match(/type="color"/g)||[]).length,2);assert.match(html,/Use theme colours/);assert.match(html,/full-.*welcome-contrast/);
 }
 let touched=false;updateWelcomeColours({querySelectorAll(){touched=true;throw Error('layout touched')}},{},{deferContrast:true});assert.equal(touched,false);
});
for(const t of registry)test(t.id+': colour settings survive setup, history, reload, backup, seasonal changes and reuse',()=>{
 for(const theme of Object.keys(t.themes)){
 const original={...t.cloneDefaults(theme),welcomeStyle:'card',showWelcome:false,...values};for(const key of keys)assert.ok(setupKeys[0].includes(key));
 const draft=createSetupDraft(original,t);draft.enter();draft.value.customWelcomeColours=false;draft.value.welcomeCardColour='#000000';draft.skip();assert.deepEqual(pick(draft.finish()),values);draft.value.welcomeStyle='plain';assert.deepEqual(pick(draft.finish()),values);
 const h=createHistory(original),next={...original,customWelcomeColours:false};h.record(next);assert.deepEqual(pick(h.undo()),values);assert.equal(h.redo().customWelcomeColours,false);
 const store=createDesignStore(memory());store.select(t.id,theme);store.save({settings:original,catalogue:null});store.select(t.id,theme==='christmas'?'halloween':'christmas');store.select(t.id,theme);assert.deepEqual(pick(store.read().settings),values);assert.deepEqual(pick(parseBackup(store.backup()).designs[theme]),values);
 for(const target of registry){const destination=target.cloneDefaults('halloween');for(const group of ['welcome','identity'])assert.deepEqual(pick(copyDetails(original,destination,[group],target)),values);const groups=transferChoices(original,t,destination,target);assert.deepEqual(pick(applyTransfer(destination,target,groups,['welcome']).settings),values);}
 }
});
