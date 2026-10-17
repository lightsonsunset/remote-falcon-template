import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {cloneDefaults,changeTheme,settingsFile,parseSettings,render,renderDraft,validate} from '../src/template.js';
import {createSetupDraft,setupErrors} from '../src/setup-model.js';
const source=readFileSync(new URL('../templates/christmas.html',import.meta.url),'utf8');
test('older settings keep download-only listening and their artwork choice',()=>{
 const old=cloneDefaults();old.pulsemesh=true;old.showAlbumArtwork=false;old.copy.PULSE_INTRO='Our custom listening text';delete old.pulsemeshUrl;delete old.pulsemeshButtons;
 const migrated=parseSettings(settingsFile(old));assert.equal(migrated.pulsemeshUrl,'');assert.equal(migrated.pulsemeshButtons,'download');assert.equal(migrated.showAlbumArtwork,false);assert.equal(migrated.copy.PULSE_INTRO,old.copy.PULSE_INTRO);
 const html=render(source,migrated);assert.doesNotMatch(html,/class="[^"]*pulsemesh-listen/);assert.equal((html.match(/href="https:\/\/pulsemesh.io\/download"/g)||[]).length,3);
});
test('display link and editable label are escaped in both Home modes and the shared FAQ',()=>{
 for(const theme of ['christmas','halloween']){
  const s=cloneDefaults(theme);s.pulsemesh=true;s.pulsemeshButtons='both';s.pulsemeshUrl='https://example.org/listen?a=1&label="test"';s.copy.PULSE_LISTEN_BUTTON='Listen & enjoy <3';
  const html=render(source,s),links=[...html.matchAll(/<a[^>]*class="[^"]*pulsemesh-listen[^>]*>.*?<\/a>/g)].map(m=>m[0]);
  assert.equal(links.length,3);for(const link of links){assert.ok(link.includes('href="https://example.org/listen?a=1&amp;label=&quot;test&quot;"'));assert.ok(link.includes('Listen &amp; enjoy &lt;3'));assert.ok(link.includes('target="_blank" rel="noopener noreferrer"'));}
  assert.doesNotMatch(html,/<script|\son\w+\s*=|\[\[|Demo:|localhost/i);assert.equal((html.match(/\{PLAYLISTS\}/g)||[]).length,2);
 }
});
test('unsafe display links block export but never enter preview HTML',()=>{
 for(const url of ['', 'javascript:alert(1)','data:text/html,test','http://example.org/','https://user:secret@example.org/','www.example.org']){
  const s=cloneDefaults();s.pulsemesh=true;s.pulsemeshButtons='listen';s.pulsemeshUrl=url;
  assert.ok(validate(s).pulsemeshUrl);assert.ok(setupErrors(s,2).pulsemeshUrl);assert.throws(()=>render(source,s));assert.doesNotMatch(renderDraft(source,s).html,/class="[^"]*pulsemesh-listen/);
  s.pulsemesh=false;assert.equal(validate(s).pulsemeshUrl,undefined);assert.doesNotMatch(render(source,s),/class="[^"]*pulsemesh-listen/);assert.equal(parseSettings(settingsFile(s)).pulsemeshUrl,url);
 }
});
test('download-only needs no display link and disabled links survive theme changes and backups',()=>{
 const s=cloneDefaults();s.pulsemesh=true;s.pulsemeshUrl='   ';assert.deepEqual(validate(s),{});assert.doesNotMatch(render(source,s),/class="[^"]*pulsemesh-listen/);
 s.pulsemeshUrl='https://player.pulsemesh.io/';s.pulsemesh=false;s.showAlbumArtwork=false;
 const restored=parseSettings(settingsFile(changeTheme(s,'halloween')));assert.equal(restored.pulsemeshUrl,s.pulsemeshUrl);assert.equal(restored.showAlbumArtwork,false);restored.pulsemesh=true;restored.pulsemeshButtons='listen';assert.match(render(source,restored),/class="[^"]*pulsemesh-listen/);
});
test('each button choice exports only its chosen links in Home and FAQ',()=>{
 for(const choice of ['download','listen','both']){
  const s=cloneDefaults();s.pulsemesh=true;s.pulsemeshButtons=choice;s.pulsemeshUrl='https://example.org/listen';const html=render(source,s);
  assert.equal((html.match(/href="https:\/\/pulsemesh.io\/download"/g)||[]).length,choice==='listen'?0:3);
  assert.equal((html.match(/class="[^"]*pulsemesh-listen/g)||[]).length,choice==='download'?0:3);
 }
 const s=cloneDefaults();s.pulsemeshButtons='unknown';assert.throws(()=>parseSettings(settingsFile(s)),/PulseMesh buttons/);
});
test('wizard URL and artwork edits stay detached, skip together, and apply through the shared settings model',()=>{
 const s=cloneDefaults(),before=structuredClone(s),d=createSetupDraft(s);d.enter();d.value.pulsemesh=true;d.value.pulsemeshButtons='both';d.value.pulsemeshUrl='https://player.pulsemesh.io/';d.value.showAlbumArtwork=false;
 assert.deepEqual(s,before);d.skip();assert.deepEqual(d.value,before);
 d.value.pulsemesh=true;d.value.pulsemeshButtons='listen';d.value.pulsemeshUrl='https://player.pulsemesh.io/';d.value.showAlbumArtwork=false;const applied=d.finish();assert.equal(applied.pulsemeshUrl,d.value.pulsemeshUrl);assert.equal(applied.pulsemeshButtons,'listen');assert.equal(applied.showAlbumArtwork,false);assert.deepEqual(parseSettings(settingsFile(applied)),applied);assert.deepEqual(s,before);
});
