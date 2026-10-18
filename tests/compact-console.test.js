import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import * as compact from '../src/compact-console.js';import {createSetupDraft} from '../src/setup-model.js';
const source=await readFile(new URL('../templates/compact-console.html',import.meta.url),'utf8');
test('both Compact styles export native RF hooks, separate views and no editor or demo behaviour',()=>{for(const season of ['christmas','halloween']){const s=compact.cloneDefaults(season),html=compact.render(source,s);assert(!/<script\b|Demo:|Winter Starlight|history-undo|\[\[/.test(html));for(const hook of ['{NOW_PLAYING}','{PLAYLISTS}','{NEXT_PLAYLIST}','{JUKEBOX_QUEUE}','{RETRY_LOCATION_INLINE}','requestSuccessful','invalidLocationCode','dailyVoteLimitReached'])assert(html.includes(hook));assert(!html.includes('id="home-panel"'));assert(html.includes('id="music-panel"'));assert(html.includes('id="info-schedule"'));assert.equal((html.match(/class="cc-hanger"/g)||[]).length,season==='halloween'?1:0);assert.equal(s.countdown,false);assert.equal(s.halloweenCountdown,false);assert(html.includes('Dynamic Menu by Matt Orelup'));}});
test('Compact backups, incomplete drafts and wizard retain tiles and hidden seasonal options',()=>{const a=compact.cloneDefaults(),b=compact.cloneDefaults('halloween');a.schedule[0]={day:'Example',hours:'',tile:'5–25',caption:'DEC'};a.decorationMotion=false;const saved=compact.parseSettings(compact.settingsFile({christmas:a,halloween:b}),true);assert.deepEqual(saved.christmas,a);assert.throws(()=>compact.render(source,a));assert(compact.renderDraft(source,a).html.includes('5–25'));const draft=createSetupDraft(b,compact);draft.value.name='Wizard fixture';const finished=draft.finish();assert.deepEqual(finished.schedule,b.schedule);assert.equal(finished.decorationMotion,true);});
test('tile and text escaping, unsafe links, counters and colour validation retain shared protections',()=>{const s=compact.cloneDefaults();s.schedule[0].tile='<img onerror=x>';s.queueCount=true;s.votesRemaining=true;s.advancedColours=true;const html=compact.render(source,s);assert(html.includes('&lt;img onerror=x&gt;'));assert(html.includes('<div class="votes-remaining">{VOTES_REMAINING}</div>'));s.logoMode='custom';s.logo='javascript:alert(1)';assert.throws(()=>compact.render(source,s));assert(!compact.renderDraft(source,s).html.includes('javascript:'));s.colours.card='bad';assert.throws(()=>compact.render(source,s));assert(compact.renderDraft(source,s).html.includes('--panel:'));});

test('taglines preserve older designs, escape text, hide when empty and survive backup/copy/setup',async()=>{
 const {copyDetails}=await import('../src/design-store.js'),{templateById}=await import('../src/template-registry.js');
 const t=templateById('compact-console'),original=templateById('festive');
 for(const season of ['christmas','halloween']){
  const old=compact.cloneDefaults(season);delete old.headerTagline;
  assert.equal(compact.checkedSettings(old).headerTagline,'Lights · Music · Together');
  const s=compact.cloneDefaults(season);s.headerTagline='Lights & <stars> "together"';
  assert(compact.render(source,s).includes('<p class="cc-eyebrow">Lights &amp; &lt;stars&gt; &quot;together&quot;</p>'));
  assert.equal(compact.renderDraft(source,s).settings.headerTagline,s.headerTagline);
  assert.equal(createSetupDraft(s,t).finish().headerTagline,s.headerTagline);
  const designs={christmas:compact.cloneDefaults(),halloween:compact.cloneDefaults('halloween')};designs[season]=s;
  assert.equal(compact.parseSettings(compact.settingsFile(designs))[season].headerTagline,s.headerTagline);
  assert.equal(copyDetails(s,compact.cloneDefaults(),['identity'],t).headerTagline,s.headerTagline);
  assert.equal(copyDetails(original.cloneDefaults(),s,['identity'],t).headerTagline,s.headerTagline);
  s.headerTagline='  ';assert(!compact.render(source,s).includes('<p class="cc-eyebrow">'));
  s.headerTagline=null;assert.throws(()=>compact.checkedSettings(s));
  s.headerTagline='x'.repeat(161);assert.throws(()=>compact.checkedSettings(s));
 }
});
