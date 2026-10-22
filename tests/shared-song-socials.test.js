import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {registry} from '../src/template-registry.js';
import {copyDetails} from '../src/design-store.js';
import {createHistoryBank} from '../src/history.js';
import {songBadgeCSS} from '../src/song-badges.js';
import {escapeCSS} from '../src/template.js';
const sources=Object.fromEntries(await Promise.all(registry.map(async t=>[t.id,await readFile(new URL('../'+t.source,import.meta.url),'utf8')])));
const keys=['movingHeadAnimation','movingHeadNames','uncategorisedIcon','socialMain','socialInfo','socialTitle','socialText','socials'];
function populated(t,theme='christmas'){return {...t.cloneDefaults(theme),movingHeadAnimation:true,movingHeadNames:'A \"quoted\" song\nAnother song',uncategorisedIcon:'ghost',socialMain:true,socialInfo:true,socialTitle:'Our lights',socialText:'Share your photos',socials:[{icon:'facebook',title:'Facebook',url:'https://example.org/facebook'},{icon:'instagram',title:'Instagram',url:'https://example.org/instagram'}]};}
for(const t of registry){
 test(t.name+' older settings gain disabled features without changing personal content',()=>{
  const old=t.cloneDefaults('halloween');old.name='My lights';old.newNames='My NEW song';old.categoryIcons={[old.categoryNames[0]]:'tree'};for(const k of keys)delete old[k];
  const restored=t.checkedSettings(old);assert.equal(restored.name,old.name);assert.equal(restored.newNames,old.newNames);assert.deepEqual(restored.categoryIcons,old.categoryIcons);assert.equal(restored.uncategorisedIcon,'music');assert.equal(restored.movingHeadNames,'');assert.equal(restored.movingHeadAnimation,false);assert.equal(restored.socialMain,false);assert.equal(restored.socialInfo,false);assert.deepEqual(restored.socials,[]);
  assert.doesNotMatch(t.render(sources[t.id],restored),/class="social-card"|MOVING HEADS ASSIGNMENTS/);
 });
 test(t.name+' new settings round-trip, copy and undo independently',()=>{
  const s=populated(t),old=t.cloneDefaults();const backup=t.separateSeasons?t.settingsFile({christmas:s,halloween:t.cloneDefaults('halloween')}):t.settingsFile(s),restored=t.parseSettings(backup);assert.deepEqual(t.separateSeasons?restored.christmas:restored,s);
  for(const other of registry){const copied=copyDetails(s,other.cloneDefaults(),['music','info'],other);for(const key of keys)assert.deepEqual(copied[key],s[key]);}
  const h=createHistoryBank().get(t.id,{settings:old,catalogue:null});h.record({settings:s,catalogue:null},{label:'Song and social options'});assert.deepEqual(h.undo().settings,old);assert.deepEqual(h.redo().settings,s);
 });
 test(t.name+' social placement, escaping and incomplete links stay safe',()=>{
  const s=populated(t);s.socialTitle='<img src=x onerror=alert(1)>';s.socials[0].title='A & B';let html=t.render(sources[t.id],s);assert.equal((html.match(/class="section-card social-card"/g)||[]).length,2);assert.match(html,/A &amp; B/);assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));assert.doesNotMatch(html,/<script\b| onerror="|Demo:|localhost/);
  s.socialMain=false;assert.equal((t.render(sources[t.id],s).match(/class="section-card social-card"/g)||[]).length,1);
  s.socials[0].url='javascript:alert(1)';assert.ok(t.validate(s)['socials.0.url']);assert.throws(()=>t.render(sources[t.id],s));assert.doesNotMatch(t.renderDraft(sources[t.id],s).html,/href="javascript:/);
  s.socialInfo=false;assert.deepEqual(t.validate(s),{});assert.ok(t.checkedSettings(s).socials.length);s.socialInfo=true;s.socials=[];assert.ok(t.validate(s).socials);assert.doesNotMatch(t.renderDraft(sources[t.id],s).html,/class="section-card social-card"/);
 });
 test(t.name+' new fields reject malformed backups and oversized selections',()=>{
  for(const change of [{movingHeadAnimation:'yes'},{uncategorisedIcon:'<script>'},{socials:Array(9).fill({icon:'link',title:'Site',url:'https://example.org'})},{socials:[{icon:'fake',title:'X',url:'https://example.org'}]},{socialMain:'yes'},{movingHeadNames:[] }])assert.throws(()=>t.checkedSettings({...t.cloneDefaults(),...change}));
  assert.ok(t.validate({...t.cloneDefaults(),movingHeadNames:Array.from({length:201},(_,i)=>'Song '+i).join('\n')}).movingHeadNames);
 });
}
test('badge assignments escape exact RF names and preserve existing NEW assignments',()=>{
 const s=populated(registry[0]);s.newNames=s.movingHeadNames.split('\n')[0];s.movingHeadNames+='\n</style><script>bad</script>';const css=songBadgeCSS(s,escapeCSS);assert.doesNotMatch(css,/<script>|<\/style>/);assert.ok(css.includes('content:"Moving spotlights" / var(--los-new-moving-label,"Moving spotlights")'));assert.match(css,/--los-new-corner-art:url\("data:image\/svg\+xml,/);assert.doesNotMatch(css,/NEW · Moving|content:none/);assert.match(css,/\\22/);assert.equal(songBadgeCSS({...s,movingHeadNames:''},escapeCSS),'');
});

test('moving-head effect is opt-in, self-contained and keeps both badge layers',()=>{
 const s=populated(registry[0]);s.movingHeadAnimation=false;const plain=songBadgeCSS(s,escapeCSS);
 assert.doesNotMatch(plain,/los-moving-fixture|los-moving-wash|@keyframes/);
 s.movingHeadAnimation=true;const animated=songBadgeCSS(s,escapeCSS),decoded=[...animated.matchAll(/data:image\/svg\+xml,([^"]+)/g)].map(m=>decodeURIComponent(m[1])).join('\n');
 assert.match(animated,/var\(--los-new-sash-image,none\),var\(--los-moving-wash\)/);
 assert.match(decoded,/@keyframes tilt/);assert.match(decoded,/@keyframes sweep/);
 assert.match(decoded,/@media\(prefers-reduced-motion:reduce\)/);
 assert.doesNotMatch(decoded,/<script|<animate|<foreignObject|onload=|https?:\/\/(?!www\.w3\.org\/2000\/svg)/);
 assert(!animated.includes('::before'));assert(!animated.includes('min-height'));
 assert.equal(songBadgeCSS({...s,movingHeadNames:''},escapeCSS),'');
});
