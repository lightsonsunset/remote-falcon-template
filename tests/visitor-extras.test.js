import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {cloneDefaults,parseSettings,settingsFile,validate,render,renderDraft,changeTheme} from '../src/template.js';
import {extraDefaults} from '../src/visitor-extras.js';
import {holidayTime} from '../src/preview.js';
const source=await readFile(new URL('../templates/christmas.html',import.meta.url),'utf8');
const full=()=>{const s=cloneDefaults();Object.assign(s,{playlistMusic:true,playlistInfo:true,showPreview:true,showPreviewUrl:'https://www.youtube.com/',youtube:true,youtubeUrl:'https://www.youtube.com/',quickFacts:true,resourcesEnabled:true,countdownFormat:'full'});s.playlists.forEach((p,i)=>p.url='https://example.org/playlist/'+i);s.facts[0].value='20,000';s.facts[1].value='80+';return s;};
test('older settings gain disabled content and independent countdown options without changing work',()=>{
 const old=JSON.parse(settingsFile(cloneDefaults()));for(const key of Object.keys(extraDefaults))delete old.settings[key];old.settings.countdown=false;old.settings.halloweenCountdown=true;old.settings.copy.COUNTDOWN_TITLE='My holiday';
 const s=parseSettings(JSON.stringify(old));assert.equal(s.countdown,false);assert.equal(s.halloweenCountdown,true);assert.equal(s.musicAbout,true);assert.equal(s.countdownFormat,'days');assert.equal(s.halloweenCountdownFormat,'days');assert.equal(s.copy.COUNTDOWN_TITLE,'My holiday');assert.equal(s.playlistInfo,false);assert.equal(s.youtube,false);
});
test('playlist links are shared, placements independent, and facts remain entered values',()=>{
 const s=full();let h=render(source,s);assert.equal(h.split('href="https://example.org/playlist/0"').length-1,2);assert.match(h,/20,000/);s.playlistMusic=false;h=render(source,s);assert.equal(h.split('href="https://example.org/playlist/0"').length-1,1);assert.match(h,/class="faq-item playlist-faq"/);s.playlistInfo=false;assert.doesNotMatch(render(source,s),/href="https:\/\/example.org\/playlist/);
});
test('FAQ answer links escape safely and a playlist-only FAQ still renders',()=>{
 const s=full();s.faq=[{kind:'text',question:'Find & visit?',answer:'See <map>',linkLabel:'Map & friends',linkUrl:'https://example.org/?a=1&b=2'}];let h=render(source,s);assert.match(h,/Map &amp; friends/);assert.match(h,/href="https:\/\/example.org\/\?a=1&amp;b=2"/);s.faq=[];h=render(source,s);assert.match(h,/<h2>FAQ<\/h2>/);assert.equal(h.split('id="info-listening"').length-1,1);
});
test('new content round trips and theme switches preserve custom values',()=>{
 const s=full();s.resources.reverse();s.playlists[0].title='Our favourites';s.copy.COUNTDOWN_TITLE='Counting down together';s.halloweenCountdownFormat='full';assert.deepEqual(parseSettings(settingsFile(s)),s);const next=changeTheme(s,'halloween');assert.deepEqual(next.resources,s.resources);assert.equal(next.playlists[0].title,'Our favourites');assert.equal(next.copy.COUNTDOWN_TITLE,s.copy.COUNTDOWN_TITLE);
});
test('unsafe links fail export but keep safe local drafts, and disabled data stays saved',()=>{
 const s=full();s.playlists[0].url='javascript:alert(1)';s.resources[0].image='data:image/svg+xml,bad';s.showPreviewUrl='http://example.org';s.youtubeUrl='javascript:bad';s.faq.push({kind:'text',question:'Link',answer:'Test',linkLabel:'Open',linkUrl:'javascript:bad'});assert.ok(Object.keys(validate(s)).length>=5);assert.throws(()=>render(source,s));assert.doesNotMatch(renderDraft(source,s).html,/javascript:|data:image\/svg|href="http:/);s.playlistMusic=s.playlistInfo=s.resourcesEnabled=s.showPreview=s.youtube=false;s.faq.pop();assert.doesNotThrow(()=>render(source,s));assert.equal(parseSettings(settingsFile(s)).playlists[0].url,'javascript:alert(1)');
});
test('empty enabled lists and incomplete links have actionable validation',()=>{
 const s=full();s.playlists=[];s.facts=[];s.resources=[];assert.deepEqual(Object.keys(validate(s)).sort(),['facts','playlists','resources']);s.faq[2].linkUrl='https://example.org';assert.ok(validate(s)['faq.2.linkLabel']);
});
test('structured list imports reject malformed values, oversize lists and arbitrary icon classes',()=>{
 for(const mutate of [s=>s.resources[0].icon='fa-x" onclick="bad',s=>s.facts=Array(7).fill({value:'1',label:'x'}),s=>s.playlists[0].url=123,s=>s.countdownFormat='fake']){const s=full();mutate(s);assert.throws(()=>parseSettings(settingsFile(s)));}
});
test('countdowns retain native hooks and regular styling, ignoring obsolete style preferences',()=>{
 for(const theme of ['christmas','halloween']){const s=cloneDefaults(theme);s.halloweenCountdown=true;s.countdownFormat=s.halloweenCountdownFormat='full';let h=render(source,s);for(const unit of ['days','hours','minutes','seconds'])assert.equal(h.split(`id="to-${theme}-${unit}"`).length-1,1);assert.doesNotMatch(h,/@font-face|countdown-ornament|countdown-styled|countdown-sparkles/);assert.doesNotMatch(h,/<script|onload=|localhost|Demo:/);s.countdownSeasonal=s.halloweenCountdownSeasonal=true;const restored=parseSettings(settingsFile(s));assert.equal('countdownSeasonal' in restored,false);assert.equal('halloweenCountdownSeasonal' in restored,false);assert.equal(render(source,restored),h);s.countdownFormat=s.halloweenCountdownFormat='days';h=render(source,s);assert.doesNotMatch(h,/id="to-(?:christmas|halloween)-(?:hours|minutes|seconds)"/);}
});
test('native calendar countdown boundaries and rollover are mirrored by the demo',()=>{
 for(const [theme,month,day] of [['christmas',11,25],['halloween',9,31]]){
  assert.deepEqual(holidayTime(theme,new Date(2026,month,day-1,23,58,57)),{days:0,hours:'00',minutes:'01',seconds:'03'});
  assert.deepEqual(holidayTime(theme,new Date(2026,month,day,12)),{days:0,hours:'00',minutes:'00',seconds:'00'});
  assert.ok(holidayTime(theme,new Date(2026,month,day+1,0,0,1)).days>360);
 }
});
