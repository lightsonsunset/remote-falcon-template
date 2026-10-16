import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {cloneDefaults,settingsFile,parseSettings,changeTheme,render} from '../src/template.js';
import {detectedCategories,applyCategories,catalogueMatches} from '../src/category-settings.js';
import {holidayDays,messageExamples} from '../src/preview.js';
import {copyFor} from '../src/copy.js';
const source=await readFile(new URL('../templates/christmas.html',import.meta.url),'utf8');
const catalogue={songs:[{category:'Third'},{category:'First'},{category:'Second'}]};
test('category detection preserves known order and visibility without touching NEW selections',()=>{
 const s=cloneDefaults();s.categoryNames=['Second','First','Old'];s.hiddenCategories=['First','Old'];s.newNames='Keep this';
 const before=structuredClone(s),result=detectedCategories(catalogue,s);assert.equal(result.error,'');assert.deepEqual(result.names,['Second','First','Third']);assert.deepEqual(s,before);
 applyCategories(s,result.names);assert.deepEqual(s.hiddenCategories,['First']);assert.equal(s.newNames,'Keep this');assert.ok(catalogueMatches(catalogue,s));s.categoryNames.pop();assert.equal(catalogueMatches(catalogue,s),false);
 assert.ok(detectedCategories({songs:[{category:''}]},s).error);
});
test('hidden first and middle categories keep positional selectors and stale targets',()=>{
 const s=cloneDefaults();s.categories=true;s.categoryNames=['First','Second','Third'];s.hiddenCategories=['First','Second'];
 const h=render(source,s);assert.match(h,/nth-child\(3 of \.category-section\)/);assert.doesNotMatch(h,/nth-child\([12] of \.category-section\)/);assert.match(h,/class="inactive-category-target" id="songs-category-1"/);assert.doesNotMatch(h,/class="category-filter-link" href="#songs-category-[12]"/);assert.match(h,/class="category-filter-link" href="#songs-category-3"/);
 s.hiddenCategories.push('Third');assert.doesNotMatch(render(source,s),/class="content-container has-categories/);
 s.newFilter=true;assert.match(render(source,s),/class="content-container has-new-songs"/);s.categoryNames=['First'];s.hiddenCategories=[];assert.match(render(source,s),/class="category-filter-link" href="#songs-category-1"/);
});
test('additive migration preserves Christmas choice and legacy copy without presenting unsupported messages',()=>{
 const file=JSON.parse(settingsFile(cloneDefaults()));for(const key of ['halloweenCountdown','homeMusicLink','queueCount','votesRemaining','hiddenCategories'])delete file.settings[key];file.settings.countdown=false;file.settings.copy.LOCATION_TITLE='Old saved title';
 const s=parseSettings(JSON.stringify(file));assert.equal(s.countdown,false);assert.equal(s.homeMusicLink,true);for(const key of ['halloweenCountdown','queueCount','votesRemaining'])assert.equal(s[key],false);assert.deepEqual(s.hiddenCategories,[]);assert.equal(s.copy.LOCATION_TITLE,'Old saved title');assert.deepEqual(parseSettings(settingsFile(s)),s);assert.doesNotMatch(render(source,s),/Old saved title|id="locationNotice"/);assert.equal(messageExamples.length,9);
});
test('seasonal countdowns are independent, native RF hooks and retain custom titles',()=>{
 let s=cloneDefaults();s.halloweenCountdown=true;s.countdown=false;s.copy.COUNTDOWN_TITLE='Our big night';s=changeTheme(s,'halloween');let h=render(source,s);assert.match(h,/id="to-halloween-days"/);assert.match(h,/Our big night/);assert.doesNotMatch(h,/to-christmas-days/);s=changeTheme(s,'christmas');assert.doesNotMatch(render(source,s),/id="to-.*-days"/);assert.equal(s.halloweenCountdown,true);
 assert.equal(holidayDays('halloween',new Date(2026,9,30)),1);assert.equal(holidayDays('halloween',new Date(2026,9,31,12)),0);assert.equal(holidayDays('halloween',new Date(2026,10,1)),0);assert.ok(holidayDays('halloween',new Date(2026,10,1,0,0,1))>360);assert.equal(holidayDays('christmas',new Date(2026,11,24)),1);
});
test('optional counters and location code use dedicated parser wrappers; Home switch leaves copy intact',()=>{
 const s=cloneDefaults();s.homeMusicLink=false;s.queueCount=true;s.votesRemaining=true;s.copy.HOME_JUKEBOX_HELP='Keep my helper';const h=render(source,s);
 assert.equal((h.match(/primary-cta" hidden/g)||[]).length,2);assert.match(h,/Keep my helper/);assert.match(h,/<span class="rf-queue-size">\{QUEUE_SIZE\}<\/span>/);assert.match(h,/<div class="votes-remaining">\{VOTES_REMAINING\}<\/div>/);assert.equal((h.match(/\{location-code-dynamic-container\}/g)||[]).length,2);assert.equal((h.match(/>\{LOCATION_CODE\}<\/div>/g)||[]).length,2);assert.match(h,/\{RETRY_LOCATION_INLINE\}/);assert.equal((h.match(/id="(?:requestSuccessful|requestFailed|requestPlaying|queueFull|invalidLocation|invalidLocationCode|alreadyVoted|alreadyRequested|sequenceUnavailable|dailyVoteLimitReached)"/g)||[]).length,10);assert.doesNotMatch(h,/<script|\son[a-z]+=|locationNotice|TIME_REMAINING|Demo:/);
 const defaults=render(source,cloneDefaults());assert.doesNotMatch(defaults,/\{QUEUE_SIZE\}|\{VOTES_REMAINING\}/);assert.equal(copyFor(s).PULSE_INTRO,'At the show? Open PulseMesh and select our display to listen.');s.copy.PULSE_INTRO='My listening advice';assert.equal(copyFor(changeTheme(s,'halloween')).PULSE_INTRO,'My listening advice');
});



test('artwork defaults remain visible while older settings and backups preserve other choices',()=>{
 const legacy=cloneDefaults();delete legacy.showAlbumArtwork;legacy.name='Saved name';legacy.hiddenCategories=['Christmas'];
 const migrated=parseSettings(settingsFile(legacy));assert.equal(migrated.showAlbumArtwork,true);assert.equal(migrated.name,'Saved name');assert.deepEqual(migrated.hiddenCategories,['Christmas']);
 migrated.showAlbumArtwork=false;const next=changeTheme(parseSettings(settingsFile(migrated)),'halloween');assert.equal(next.showAlbumArtwork,false);
 const hidden=render(source,next);assert.match(hidden,/Compact song cards/);assert.match(hidden,/grid-template-columns:minmax\(0,1fr\)/);assert.match(hidden,/grid-column:1/);assert.doesNotMatch(hidden,/<script\b|localhost|Demo:/);
 next.showAlbumArtwork=true;assert.doesNotMatch(render(source,next),/Compact song cards/);
});
