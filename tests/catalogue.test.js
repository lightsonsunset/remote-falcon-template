import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCSV,parseCatalogue,categoryNamesOf,saveCatalogue,restoreCatalogue} from '../src/catalogue.js';
const header='name,displayName,artist,group,imageUrl,category\r\n';
test('RF CSV parser handles BOM, commas, escaped quotes, multiline text and blank fields',()=>{
 const csv='\ufeff'+header+'"Exact name","Title, with ""quotes""","Artist\nname",,"https://example.org/a.png","Family"\r\nAnother,Another title,Artist,,,Dance\r\n';
 const c=parseCatalogue(csv);assert.equal(c.songs.length,2);assert.equal(c.songs[0].displayName,'Title, with "quotes"');assert.equal(c.songs[0].artist,'Artist\nname');assert.deepEqual(categoryNamesOf(c),['Family','Dance']);assert.equal(c.songs[1].imageUrl,'');
});
test('malformed and unrelated imports fail rather than replacing a catalogue',()=>{
 for(const csv of ['', 'a,b\n1,2',header+'"unfinished',header+'A,B,C,D,E',header+'A,B,C,,,Dance\nA,B,C,,,Family'])assert.throws(()=>parseCatalogue(csv));
 assert.throws(()=>parseCSV('a,"b"broken'));assert.throws(()=>parseCSV('a,b"bad'));assert.throws(()=>parseCatalogue('x'.repeat(2000001)));
});
test('image URLs are HTTPS only and CSV text stays data',()=>{
 const c=parseCatalogue(header+'<script>,=CMD(),Artist,,javascript:alert(1),Family\nOther,Title,Artist,,https://user:password@example.org/a,Family');
 assert.equal(c.songs[0].name,'<script>');assert.equal(c.songs[0].displayName,'=CMD()');assert.equal(c.ignoredImages,2);assert.ok(c.songs.every(s=>s.imageUrl===''));
});
test('exact sequence names preserve significant whitespace',()=>{
 const c=parseCatalogue(header+'"  Exact name  ",Title,Artist,,,Family');assert.equal(c.songs[0].name,'  Exact name  ');
});
test('catalogues persist separately; unavailable storage does not prevent a session preview',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
 const c=parseCatalogue(header+'A,Title,Artist,,https://example.org/image.png,Family');assert.ok(saveCatalogue(storage,c));assert.deepEqual(restoreCatalogue(storage).catalogue,c);assert.ok(saveCatalogue(storage,null));assert.equal(restoreCatalogue(storage).catalogue,null);assert.equal(saveCatalogue(null,c),false);
});
