import test from 'node:test';
import assert from 'node:assert/strict';
import {readPreferences,writePreferences,PREFS_KEY} from '../src/storage.js';
test('tour completion and editor theme persist independently',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
 writePreferences(storage,{theme:'dark'});writePreferences(storage,{tourSeen:true});writePreferences(storage,{theme:'light'});
 assert.deepEqual(readPreferences(storage),{theme:'light',tourSeen:true});assert.deepEqual([...values.keys()],[PREFS_KEY]);
});
test('unavailable or invalid preferences leave the editor usable',()=>{
 assert.deepEqual(readPreferences(null),{});assert.equal(writePreferences(null,{tourSeen:true}),false);
 for(const raw of ['not JSON','null','[]','4'])assert.deepEqual(readPreferences({getItem:()=>raw}),{});
 const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
 assert.deepEqual(readPreferences(blocked),{});assert.equal(writePreferences(blocked,{theme:'dark'}),false);
});
