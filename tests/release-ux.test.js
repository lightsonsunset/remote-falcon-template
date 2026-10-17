import test from 'node:test';
import assert from 'node:assert/strict';
import {cloneDefaults,render,settingsFile,parseSettings} from '../src/template.js';
import {viewerFilename,nameContrastAdvice} from '../src/release-ux.js';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../templates/christmas.html',import.meta.url),'utf8');
test('download names distinguish seasons and safely handle file-system punctuation',()=>{
 const s=cloneDefaults();s.name='Twinkling Lane Lights';assert.equal(viewerFilename(s),'Twinkling-Lane-Lights-Christmas.html');
 s.theme='halloween';assert.equal(viewerFilename(s),'Twinkling-Lane-Lights-Halloween.html');
 for(const name of ['../Bad: "Name"<>|?*\\','...','CON','NUL','a'.repeat(250),'Fête & Lights']){
  s.name=name;const file=viewerFilename(s);assert(file.endsWith('-Halloween.html'));assert(!/[<>:"/\\|?*\u0000-\u001f]/.test(file));assert(file.length<110);assert(!file.startsWith('.'));
 }
});
test('heading contrast considers Home wash, theme, custom and combined colours without mutating settings',()=>{
 for(const theme of ['christmas','halloween']){
  const s=cloneDefaults(theme),before=settingsFile(s);assert.equal(nameContrastAdvice(s),'');assert.equal(settingsFile(s),before);
  s.customNameColour=true;s.nameColour='#30202c';assert(nameContrastAdvice(s));s.nameColour='#ffffff';assert.equal(nameContrastAdvice(s),'');
  s.showNameOnHome=false;s.nameColour='#30202c';assert.equal(nameContrastAdvice(s),'');s.showNameOnHome=true;s.customNameColour=false;s.logoMode='seasonal';s.combineLogoName=true;s.colours.gold='#30202c';assert(nameContrastAdvice(s));
  assert.equal(nameContrastAdvice(parseSettings(settingsFile(s))),nameContrastAdvice(s));
 }
});
test('both exports retain RF markup and include a script-free older-browser fallback',()=>{
 for(const theme of ['christmas','halloween']){
  const html=render(source,cloneDefaults(theme));assert(html.includes('@supports not selector(:has(*))'));assert(html.includes('class="browser-compat-note"'));
  for(const hook of ['{jukebox-dynamic-container}','{playlist-voting-dynamic-container}','{JUKEBOX_QUEUE}','id="invalidLocation"'])assert(html.includes(hook),hook);
  assert(!/<script\b|\son\w+\s*=|localhost|Demo:|Finish &amp; export/.test(html));
  assert(html.includes('#show-options:not(.has-pulsemesh)'));
 }
});
