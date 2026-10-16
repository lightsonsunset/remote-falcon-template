import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {cloneDefaults,parseSettings,settingsFile,render,renderDraft,validate} from '../src/template.js';
import {christmasDays} from '../src/preview.js';
const source=await readFile(new URL('../templates/christmas.html',import.meta.url),'utf8');
test('additive settings migration preserves work and existing countdown/FM behaviour',()=>{
 const saved=JSON.parse(settingsFile(cloneDefaults()));for(const k of ['countdown','musicFM','donationRecipients'])delete saved.settings[k];saved.settings.copy.EMPTY_NEXT='My saved message';
 const s=parseSettings(JSON.stringify(saved));assert.equal(s.countdown,true);assert.equal(s.musicFM,true);assert.deepEqual(s.donationRecipients,[]);assert.equal(s.copy.EMPTY_NEXT,'My saved message');
});
test('countdown is optional, single, and absent from Halloween',()=>{
 const s=cloneDefaults();assert.equal(render(source,s).split('id="to-christmas-days"').length-1,1);s.countdown=false;assert.doesNotMatch(render(source,s),/id="to-christmas-days"/);s.countdown=true;s.theme='halloween';assert.doesNotMatch(render(source,s),/id="to-christmas-days"/);
 assert.equal(christmasDays(new Date(2026,11,24,0)),1);assert.equal(christmasDays(new Date(2026,11,25,12)),0);assert.ok(christmasDays(new Date(2026,11,27))>360);
});
test('queue limit wording uses an isolated RF token and escapes surrounding text',()=>{
 const s=cloneDefaults();s.copy.QUEUE_HELP='Our <queue> holds {queueLimit} songs & friends.';s.copy.JUKEBOX_HELP='Limit {queuelength} or {QUEUE_DEPTH}.';
 const h=render(source,s);assert.equal(h.split('<span class="rf-queue-depth">{QUEUE_DEPTH}</span>').length-1,3);assert.match(h,/Our &lt;queue&gt;/);assert.doesNotMatch(h,/\{queueLimit\}|\{queuelength\}|<script|Demo queue limit/);
});
test('recipients round trip, have independent placements, and cannot inject URLs or HTML',()=>{
 const s=cloneDefaults();s.donations=true;s.donationUrl='https://example.org/donate';s.donationRecipients=[{name:'Other <cause> & "give"',description:'Our supporter',button:'Visit {charity}',callout:'Discover {charity}.',hint:'Tap to visit',url:'https://example.org/other?a=1&b=2',image:'https://example.org/image.png',home:true,info:true}];
 const h=render(source,s);assert.equal(h.split('href="https://example.org/other?a=1&amp;b=2"').length-1,5);assert.match(h,/Visit Other &lt;cause&gt; &amp; &quot;give&quot;/);assert.deepEqual(parseSettings(settingsFile(s)),s);
 s.donationRecipients[0].home=false;assert.equal(render(source,s).split('href="https://example.org/other?a=1&amp;b=2"').length-1,2);
 s.donationRecipients[0].url='javascript:bad()';s.donationRecipients[0].image='javascript:bad()';assert.ok(validate(s)['donationRecipients.0.url']);assert.throws(()=>render(source,s));assert.doesNotMatch(renderDraft(source,s).html,/javascript:bad/);s.donations=false;assert.doesNotThrow(()=>render(source,s));assert.doesNotMatch(render(source,s),/Our supporter/);
});
test('FM reminder setting targets both modes without removing shared listening frequency',()=>{
 const s=cloneDefaults();s.fm=true;s.musicFM=false;const h=render(source,s);assert.equal(h.split('class="music-listen-reminder share-fm" hidden').length-1,2);assert.match(h,/radio-frequency">88.7 FM/);assert.match(h,/has-fm/);
});
