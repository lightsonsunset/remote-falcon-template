import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {registry} from '../src/template-registry.js';
import {createSetupDraft} from '../src/setup-model.js';
import {copyDetails,createDesignStore} from '../src/design-store.js';
import {createHistoryBank} from '../src/history.js';
const sources=Object.fromEntries(await Promise.all(registry.map(async t=>[t.id,await readFile(new URL('../'+t.source,import.meta.url),'utf8')])));
const backup=(t,s)=>t.settingsFile(t.separateSeasons?{christmas:s.theme==='christmas'?s:t.cloneDefaults(),halloween:s.theme==='halloween'?s:t.cloneDefaults('halloween')}:s);
const restore=(t,text,season)=>{const value=t.parseSettings(text,true);return t.separateSeasons?value[season]:value;};
test('older designs default both artist areas on without losing personalised values',()=>{
 for(const t of registry)for(const season of ['christmas','halloween']){
  const old=t.cloneDefaults(season);delete old.showSongArtists;delete old.showQueueArtists;old.name='Saved show';old.showAlbumArtwork=false;
  const s=restore(t,backup(t,old),season);assert.equal(s.showSongArtists,true);assert.equal(s.showQueueArtists,true);assert.equal(s.name,old.name);assert.equal(s.showAlbumArtwork,false);
 }
});
test('artist choices are independent, round-trip and produce only native viewer CSS',()=>{
 for(const t of registry)for(const season of ['christmas','halloween'])for(const showSongArtists of [true,false])for(const showQueueArtists of [true,false]){
  const s={...t.cloneDefaults(season),showSongArtists,showQueueArtists};assert.deepEqual(restore(t,backup(t,s),season),s);
  const html=t.render(sources[t.id],s),classes=html.match(/<[^>]*id="show-options"[^>]*>/)[0].match(/class="([^"]*)"/)[1];
  assert.equal(classes.includes('hide-song-artists'),!showSongArtists);assert.equal(classes.includes('hide-queue-artists'),!showQueueArtists);
  assert.doesNotMatch(html,/<script\b|Illustrative demo|localhost|data-setup-key|data-key="showSongArtists"/i);
 }
});
test('artist choices survive save/reload, copy, setup draft and independent history',()=>{
 for(const t of registry){
  const initial=t.cloneDefaults(),s={...initial,showSongArtists:false,showQueueArtists:false};
  const draft=createSetupDraft(initial,t);draft.enter();draft.value.showSongArtists=false;draft.value.showQueueArtists=false;assert.deepEqual(initial,t.cloneDefaults());assert.deepEqual(draft.finish(),s);draft.skip();assert.deepEqual(draft.finish(),initial);
  const other=registry.find(x=>x.id!==t.id),copied=copyDetails(s,other.cloneDefaults(),['music'],other);assert.equal(copied.showSongArtists,false);assert.equal(copied.showQueueArtists,false);
  const bank=createHistoryBank(),history=bank.get(t.id,{settings:initial,catalogue:null});history.record({settings:s,catalogue:null});assert.deepEqual(history.undo().settings,initial);assert.deepEqual(history.redo().settings,s);
  const values=new Map(),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)},store=createDesignStore(storage);store.select(t.id,'christmas');assert.ok(store.save({settings:s,catalogue:null}).settings);const loaded=createDesignStore(storage).read().settings;assert.equal(loaded.showSongArtists,false);assert.equal(loaded.showQueueArtists,false);
 }
});
test('artist flags reject malformed values instead of treating strings as booleans',()=>{
 for(const t of registry)for(const key of ['showSongArtists','showQueueArtists'])for(const value of ['false',0,null,[],{}])assert.throws(()=>t.checkedSettings({...t.cloneDefaults(),[key]:value}),/Invalid or missing setting/);
});
