import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {registry} from '../src/template-registry.js';
import * as compact from '../src/compact-console.js';
import * as original from '../src/template.js';

test('queue capacity defaults off in older backups and round-trips without sharing designs',()=>{
 const old=original.cloneDefaults();delete old.showQueueLimit;old.name='Existing design';
 const restored=original.parseSettings(original.settingsFile(old),true);assert.equal(restored.showQueueLimit,false);assert.equal(restored.name,old.name);
 const designs={christmas:compact.cloneDefaults(),halloween:compact.cloneDefaults('halloween')};delete designs.halloween.showQueueLimit;designs.christmas.showQueueLimit=true;
 const saved=compact.parseSettings(compact.settingsFile(designs),true);assert.equal(saved.christmas.showQueueLimit,true);assert.equal(saved.halloween.showQueueLimit,false);
 assert.throws(()=>original.checkedSettings({...old,showQueueLimit:'true'}));
});

test('both templates render an optional, escaped native queue limit only inside Jukebox',async()=>{
 for(const t of registry){const source=await readFile(new URL('../'+t.source,import.meta.url),'utf8');for(const season of ['christmas','halloween']){
  const s=t.cloneDefaults(season);assert(!t.render(source,s).includes('queue-instructions queue-limit'));
  s.showQueueLimit=true;const html=t.render(source,s);assert.equal(html.split('class="queue-instructions queue-limit"').length-1,1);
  assert(html.includes('Request queue limit: <span class="rf-queue-depth">{QUEUE_DEPTH}</span> songs.'));assert(!html.includes('(0 = unlimited)'));
  const at=html.indexOf('class="queue-instructions queue-limit"');assert(html.lastIndexOf('{jukebox-dynamic-container}',at)>html.lastIndexOf('{playlist-voting-dynamic-container}',at));
  s.copy.QUEUE_LIMIT_TEXT='<img src=x> Maximum {queueLimit}';assert(t.render(source,s).includes('&lt;img src=x&gt; Maximum <span class="rf-queue-depth">{QUEUE_DEPTH}</span>'));
  assert(!/<script\b/.test(html));
 }}
});
