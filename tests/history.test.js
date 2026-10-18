import test from 'node:test';
import assert from 'node:assert/strict';
import {createHistory,createHistoryBank} from '../src/history.js';
test('typing and URL completion are one reversible transaction; branching invalidates redo',()=>{
 const h=createHistory({url:''});h.record({url:'www.example.org'},{label:'Edit link',group:'url'});h.record({url:'https://www.example.org'},{label:'Edit link',group:'url'});
 assert.deepEqual(h.undo(),{url:''});assert.deepEqual(h.redo(),{url:'https://www.example.org'});h.undo();h.record({url:'unfinished'});assert.equal(h.status.canRedo,false);
});
test('catalogue, category and NEW settings restore together without aliasing',()=>{
 const before={settings:{newNames:'',categories:false},catalogue:null},h=createHistory(before);
 const after={settings:{newNames:'Fixture A',categories:true},catalogue:{songs:[{name:'Fixture A'}]}};h.record(after,{label:'Import catalogue'});after.catalogue.songs=[];
 assert.deepEqual(h.undo(),before);assert.equal(h.redo().catalogue.songs.length,1);
});
test('history is bounded, independent per design, and does not store no-op edits',()=>{
 const bank=createHistoryBank(),a=bank.get('a',{n:0}),b=bank.get('b',{n:7});
 for(let n=1;n<=105;n++)a.record({n});for(let i=0;i<100;i++)a.undo();assert.equal(a.value.n,5);assert.equal(a.undo(),null);assert.equal(b.value.n,7);
 b.record({n:7});assert.equal(b.status.canUndo,false);
});
