import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {settingsForm} from '../src/editor-form.js';
import {completeWebAddress,messagePreviews} from '../src/editor-layout.js';
import {copyFields} from '../src/copy.js';
import {cloneDefaults,render} from '../src/template.js';

test('editor keeps every wording field once and escapes stored content',()=>{
 const s=cloneDefaults();s.name='A "quote" <img onerror="bad">';s.faq[0].question='<img src=x onerror=bad()> & FAQ';
 const html=settingsForm(s);
 for(const [key] of copyFields)assert.equal(html.split('data-copy="'+key+'"').length-1,1,key);
 assert.doesNotMatch(html,/<img src=x|<img onerror/);assert.match(html,/&lt;img src=x onerror=bad\(\)&gt; &amp; FAQ/);
 assert.match(html,/data-preview-message="requestSuccessful"/);assert.equal(Object.keys(messagePreviews).length,10);
});
test('www completion only adds HTTPS to a recognisable host',()=>{
 assert.equal(completeWebAddress(' www.example.org/donate?q=a&b=2 '),'https://www.example.org/donate?q=a&b=2');
 for(const url of ['javascript:alert(1)','http://example.org','https://example.org','data:text/html,test','www.','www.example.org@evil.test','www.example.org bad','/images/logo.png'])assert.equal(completeWebAddress(url),url);
});
test('both downloadable starters match the canonical RF renderer',async()=>{
 const source=await readFile(new URL('../templates/christmas.html',import.meta.url),'utf8');
 for(const [theme,file] of [['christmas','Festive RF Template.html'],['halloween','Halloween RF Template.html']]){
  assert.equal(render(source,cloneDefaults(theme)),await readFile(new URL('../downloads/'+file,import.meta.url),'utf8'));
 }
});
