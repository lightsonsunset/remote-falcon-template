import test from 'node:test';
import assert from 'node:assert/strict';
import {registry} from '../src/template-registry.js';
import {detectedCategories,applyCategories,catalogueMatches} from '../src/category-settings.js';
import {categoryIcon} from '../src/song-artwork.js';

test('uncategorised songs do not block or shift named category setup in either template',()=>{
 const catalogue={songs:[{category:''},{category:'Second'},{category:'First'},{category:''}]};
 for(const t of registry){
  const s=t.cloneDefaults();Object.assign(s,{categoryNames:['First','Second'],hiddenCategories:['First'],categoryIcons:{First:'tree',Second:'snowman'},newNames:'Keep this'});
  const before=structuredClone(s),detected=detectedCategories(catalogue,s);
  assert.equal(detected.error,'');assert.deepEqual(detected.names,['First','Second']);assert.deepEqual(s,before);assert.equal(catalogueMatches(catalogue,s),true);
  applyCategories(s,detected.names);assert.deepEqual(s.categoryIcons,before.categoryIcons);assert.deepEqual(s.hiddenCategories,['First']);assert.equal(s.newNames,'Keep this');assert.equal(categoryIcon(s,''),'music');
  assert.equal(catalogueMatches({songs:[...catalogue.songs,{category:'Third'}]},s),false);
 }
});
test('a catalogue with only uncategorised songs has no category filters to detect',()=>{
 const s=registry[0].cloneDefaults(),before=structuredClone(s),result=detectedCategories({songs:[{category:''},{category:''}]},s);
 assert.deepEqual(result.names,[]);assert.match(result.error,/No categories/);assert.deepEqual(s,before);
});
