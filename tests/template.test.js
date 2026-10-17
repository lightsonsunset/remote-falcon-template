import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {cloneDefaults,render,renderDraft,validate,parseSettings,settingsFile,escapeCSS,isHTTPS,changeTheme} from '../src/template.js';
import {persist,restore} from '../src/storage.js';
import {copyFields,copyFor} from '../src/copy.js';
import {editorCopy,editorGroups} from '../src/editor-layout.js';
const source=await readFile(new URL('../templates/christmas.html',import.meta.url),'utf8');
const count=(s,x)=>s.split(x).length-1;
const tokens=s=>Object.fromEntries([...s.matchAll(/\{(?:after-hours-message|jukebox-dynamic-container|playlist-voting-dynamic-container|NOW_PLAYING|NEXT_PLAYLIST|JUKEBOX_QUEUE|PLAYLISTS|RETRY_LOCATION_INLINE)\}/g)].reduce((map,[x])=>map.set(x,(map.get(x)||0)+1),new Map()));
test('default export is a complete script-free document preserving all RF hooks',()=>{
 const html=render(source,cloneDefaults());assert.match(html,/^<!doctype html>/i);
 assert.deepEqual(tokens(html),{'{after-hours-message}':2,'{jukebox-dynamic-container}':3,'{playlist-voting-dynamic-container}':3,'{NOW_PLAYING}':2,'{NEXT_PLAYLIST}':1,'{JUKEBOX_QUEUE}':1,'{PLAYLISTS}':2,'{RETRY_LOCATION_INLINE}':1});
 assert.doesNotMatch(html,/<script|\son[a-z]+=|javascript:|\[\[|Winter Starlight|data-device|demo queue/i);
 assert.match(html,/Dynamic Menu by Matt Orelup/);assert.match(html,/GNU GPL version 3/);
 assert.match(html,/id="show-notice" hidden/);assert.match(html,/class="content-container " id="show-options"/);
});
test('all repeats and enabled features update together',()=>{
 const s=cloneDefaults();Object.assign(s,{name:'Example & Friends',dates:'December dates',fm:true,pulsemesh:true,donations:true,charity:'Our charity',donationText:'Our cause',donationUrl:'https://example.org/give?a=1&b=2',frequency:'101.2',notice:true,noticeTitle:'Hello',noticeText:'Visit soon',categories:true,newFilter:true,newNames:'A new song\nAnother song'});
 s.schedule=[{day:'Holiday exception',hours:'8pm until late'}];s.listening='Bring headphones';s.colours.card='#123456';s.colours.home='#010203';
 const h=render(source,s);assert.equal(count(h,'href="https://example.org/give?a=1&amp;b=2"'),5);assert.equal(count(h,'December dates'),3);assert.equal(count(h,'<span>Holiday exception</span>'),3);assert.equal(count(h,'Bring headphones'),3);assert.equal(count(h,'Example &amp; Friends'),3);assert.equal(count(h,'[data-key="A new song"]'),2);assert.match(h,/has-categories has-new-songs/);assert.match(h,/--panel: #123456/);assert.match(h,/--section-wash: 1, 2, 3/);assert.doesNotMatch(h,/id="show-notice" hidden/);assert.equal(count(h,'101.2 FM'),7);
});
test('text, attribute and CSS escaping cannot introduce executable markup',()=>{
 const s=cloneDefaults();s.name='" onload="bad <script>x</script> &';s.welcome='[[SHOW_NAME]]';s.newNames='A "quoted" \\ song\n</style><script>bad()</script>\n雪 & sleigh';s.logoMode='custom';s.logo='https://example.org/a?x="&y=<b>';
 const h=render(source,s);assert.doesNotMatch(h,/<script>|onload="bad/);assert.match(h,/&lt;script&gt;/);assert.equal(count(h,'</style>'),1);assert.match(h,/\[\[SHOW_NAME\]\]/);assert.match(h,/\\3c /);assert.match(h,/雪 & sleigh/);assert.equal(count(h,'<img class="show-logo"'),1);
});
test('invalid enabled URLs and incomplete values block rendering; disabled options do not',()=>{
 const s=cloneDefaults();s.donationUrl='javascript:alert(1)';assert.doesNotThrow(()=>render(source,s));s.donations=true;assert.ok(validate(s).donationUrl);assert.throws(()=>render(source,s));s.logoMode='custom';s.logo='http://example.org/logo.png';assert.ok(validate(s).logo);
 for(const u of ['javascript:alert(1)','data:text/html,test','https://user:pass@example.org','//example.org'])assert.equal(isHTTPS(u),false);
});
test('settings files round-trip and reject incompatible versions without mutation',()=>{
 const s=cloneDefaults(),before=structuredClone(s);assert.deepEqual(parseSettings(settingsFile(s)),s);for(const text of ['broken','null','{}','{"version":2,"template":"christmas"}','{"version":1,"template":"halloween"}'])assert.throws(()=>parseSettings(text));assert.deepEqual(s,before);
});
test('storage restores incomplete drafts and fails gracefully if unavailable',()=>{
 const map=new Map(),store={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};const s=cloneDefaults();s.name='';assert.equal(persist(store,s),true);assert.deepEqual(restore(store).settings,s);
 const failed={getItem(){throw Error('denied');},setItem(){throw Error('quota');}};assert.equal(persist(failed,s),false);assert.ok(restore(failed).error);assert.ok(restore(null).error);
});
test('combined category / NEW selector addresses the same options container',()=>{assert.match(source,/body:has\(#show-options\.has-categories\.has-new-songs\)/);assert.doesNotMatch(source,/has-categories\)\.has-new-songs/);});
test('CSS escaping handles line breaks, quotes and backslashes',()=>{assert.equal(escapeCSS('a"b\\c\n<'),'a\\22 b\\5c c\\a \\3c ');});

test('incomplete drafts stay renderable, while unsafe URLs and export stay blocked',()=>{
 const s=cloneDefaults();Object.assign(s,{donations:true,donationUrl:'www.google.com',donationImage:'javascript:bad()',logo:'https://',notice:true,name:''});s.schedule.push({day:'',hours:''});
 const draft=renderDraft(source,s);assert.match(draft.html,/has-donations/);assert.doesNotMatch(draft.html,/javascript:bad|src="https:\/\/"|href="www.google/);assert.throws(()=>render(source,s));assert.ok(validate(s).donationUrl);
 const simple=cloneDefaults();simple.donations=true;assert.ok(validate(simple).donationUrl);simple.donations=false;assert.deepEqual(validate(simple),{});assert.doesNotThrow(()=>render(source,simple));
 assert.equal(s.name,'');assert.equal(s.donationUrl,'www.google.com');
});
test('old settings migrate without losing personal work; draft backups can be loaded safely',()=>{
 const old=cloneDefaults();delete old.theme;delete old.donationImage;delete old.categoryNames;delete old.colours.text;delete old.colours.secondary;old.name='A saved show';old.colours.gold='#6e654e';old.donations=true;
 const s=parseSettings(JSON.stringify({version:1,template:'christmas',settings:old}),true);assert.equal(s.name,old.name);assert.equal(s.colours.gold,old.colours.gold);assert.equal(s.theme,'christmas');assert.equal(s.donationImage,'');assert.ok(validate(s).donationUrl);assert.deepEqual(parseSettings(settingsFile(s),true),s);
});
test('theme switches replace starter values but preserve personal text and custom colours',()=>{
 const s=cloneDefaults();s.logo='https://example.org/our-logo.png';s.donationUrl='https://example.org/give';s.colours.home='#123456';s.schedule[0].hours='8–10pm';
 const halloween=changeTheme(s,'halloween');assert.equal(halloween.name,'Your Halloween Show');assert.equal(halloween.colours.home,'#123456');assert.equal(halloween.logo,s.logo);assert.equal(halloween.schedule[0].hours,'8–10pm');assert.equal(halloween.schedule[2].day,'Halloween night');
 const custom={...s,name:'My unique show',categoryNames:['Family','Classics','Dance']};assert.equal(changeTheme(custom,'halloween').name,custom.name);assert.deepEqual(changeTheme(custom,'halloween').categoryNames,custom.categoryNames);
 assert.equal(changeTheme(halloween,'christmas').name,s.name);
});
test('Halloween export has seasonal messages, no Christmas countdown or demo, and the same RF hooks',()=>{
 const christmas=render(source,cloneDefaults()),halloween=render(source,cloneDefaults('halloween'));
 assert.deepEqual(tokens(halloween),tokens(christmas));assert.doesNotMatch(halloween,/\bChristmas\b|Santa|sleigh|tinsel|nice list|to-christmas-days|Moonlit Mischief|<script/i);assert.match(halloween,/A frightfully good choice!/);assert.match(halloween,/fa-ghost/);
});
test('arbitrary ordered categories and donation images stay escaped in both modes',()=>{
 const s=cloneDefaults();Object.assign(s,{categories:true,newFilter:true,categoryNames:['Kids & Family','Spooky "classics"','Dance <all>'],donations:true,donationUrl:'https://example.org/give',donationImage:'https://example.org/image.png?a="&b=2'});
 const h=render(source,s);assert.equal(count(h,'class="category-filter-link"'),6);assert.equal(count(h,'href="#songs-category-3"'),3);assert.match(h,/nth-child\(3 of \.category-section\)/);assert.match(h,/Dance &lt;all&gt;/);assert.equal(count(h,'src="https://example.org/image.png?a=&quot;&amp;b=2"'),5);assert.match(h,/object-fit:contain/);
 s.donations=false;s.donationImage='javascript:bad()';assert.doesNotMatch(render(source,s),/javascript:bad/);
});
test('seasonal assets and visitor guidance export without demo data or scripts',()=>{
 const s=cloneDefaults('halloween');Object.assign(s,{logoMode:'seasonal',decorations:true,neighbourTitle:'Visitors & friends',neighbourText:'Keep clear.\n<script>no</script>'});
 const h=render(source,s);assert.equal(count(h,'Visitors &amp; friends'),2);assert.equal(count(h,'&lt;script&gt;no&lt;/script&gt;'),2);assert.match(h,/assets\/halloween-header.webp/);assert.match(h,/assets\/spider.webp/);assert.doesNotMatch(h,/localhost|127.0.0.1|<script/);
 const previous=JSON.parse(settingsFile(s));delete previous.settings.logoMode;delete previous.settings.decorations;delete previous.settings.neighbourText;delete previous.settings.neighbourTitle;previous.settings.logo='https://example.org/logo.png';const migrated=parseSettings(JSON.stringify(previous));assert.equal(migrated.logoMode,'custom');assert.ok(migrated.neighbourText);assert.equal(migrated.decorations,false);
});
test('all editable visitor-copy fields render and survive seasonal changes',()=>{
 const s=cloneDefaults();s.queueCount=true;s.pulsemesh=true;s.pulsemeshButtons='both';s.pulsemeshUrl='https://player.pulsemesh.io/';copyFields.forEach(([key],i)=>s.copy[key]='Custom_'+i+'_');const html=render(source,s),full=render(source,{...s,countdownFormat:'full'});copyFields.forEach(([key],i)=>assert.ok((html+full).includes('Custom_'+i+'_'),key+' was not rendered'));assert.deepEqual(tokens(html),tokens(render(source,cloneDefaults())));
 const h=changeTheme(s,'halloween');assert.deepEqual(h.copy,s.copy);assert.deepEqual(parseSettings(settingsFile(h)).copy,s.copy);
 delete h.copy.SUCCESS_TITLE;assert.equal(copyFor(h).SUCCESS_TITLE,'A frightfully good choice!');
});
test('visitor text is escaped in HTML, attributes and CSS; incomplete headings keep preview usable',()=>{
 const s=cloneDefaults();s.copy.LISTEN_TITLE='';assert.ok(validate(s)['copy.LISTEN_TITLE']);assert.throws(()=>render(source,s));assert.match(renderDraft(source,s).html,/To Hear the Music/);delete s.copy.LISTEN_TITLE;
 s.copy.EMPTY_NOW='";}</style><script>x</script>';s.copy.SUCCESS_TITLE='<b>Thanks & enjoy</b>';s.copy.DONATE_BUTTON='Help {charity}';s.charity='A "quoted" & kind cause';const h=render(source,s);assert.doesNotMatch(h,/<script>|<b>Thanks/);assert.match(h,/&lt;b&gt;Thanks &amp; enjoy/);assert.match(h,/Help A &quot;quoted&quot; &amp; kind cause/);assert.equal(count(h,'</style>'),1);
});
test('Home cards and editable FAQs preserve linked details and escape user text',()=>{
 const s=cloneDefaults();Object.assign(s,{homeCard:true,homeCardTitle:'Photos & fun',homeCardText:'Line one\n<script>bad()</script>',homeCardLink:'https://example.org/photos',homeCardLinkLabel:'Photo details',fm:true,frequency:'101.2'});
 s.faq[0].question='Our hours?';s.faq[0].answer='Weather permitting';s.faq.push({kind:'text',question:'Can we take photos?',answer:'Yes & please keep driveways clear.'});
 const h=render(source,s);assert.match(h,/Photos &amp; fun/);assert.match(h,/&lt;script&gt;bad\(\)&lt;\/script&gt;/);assert.match(h,/Our hours\?/);assert.match(h,/Weather permitting/);assert.equal(count(h,'101.2 FM'),7);assert.equal(count(h,'id="info-listening"'),1);assert.match(h,/Can we take photos\?/);
 s.faq=[];assert.doesNotMatch(render(source,s),/<h2>FAQ<\/h2>/);assert.equal(count(render(source,s),'id="info-listening"'),1);
 s.homeCardLink='javascript:bad()';assert.throws(()=>render(source,s));assert.doesNotMatch(renderDraft(source,s).html,/javascript:bad/);
});

test('page organisation gives each editable text field one owner',()=>{
 const assigned=Object.values(editorCopy).flatMap(groups=>groups.flatMap(g=>g[1].map(f=>f[0])));
 assert.equal(new Set(assigned).size,assigned.length);assert.deepEqual([...assigned].sort(),copyFields.map(f=>f[0]).sort());
 const sections=Object.values(editorGroups).flatMap(g=>g.sections);assert.equal(new Set(sections).size,sections.length);
});
test('live Home schedule shares dates, hours and headings and migrates off',()=>{
 const s=cloneDefaults();s.homeLiveSchedule=true;s.dates='5–25 December';s.schedule=[{day:'Holiday & friends',hours:'8pm till late'}];s.copy.DATES_TITLE='Our dates';s.copy.HOURS_TITLE='Our hours';
 const html=render(source,s);assert.equal(count(html,'class="section-card compact live-schedule"'),2);assert.equal(count(html,'5–25 December'),5);assert.equal(count(html,'Holiday &amp; friends'),5);assert.equal(count(html,'<h2>Our dates</h2>'),4);
 s.homeLiveSchedule=false;assert.doesNotMatch(render(source,s),/class="section-card compact live-schedule"/);
 const old=JSON.parse(settingsFile(s));delete old.settings.homeLiveSchedule;old.settings.decorations=true;const restored=parseSettings(JSON.stringify(old));assert.equal(restored.homeLiveSchedule,false);assert.equal(restored.decorations,true);
 const decorated=render(source,restored);assert.doesNotMatch(decorated,/\.content__body::before/);assert.match(decorated,/\.los-menu::after/);assert.match(decorated,/@media\(prefers-reduced-motion:reduce\)/);assert.doesNotMatch(decorated,/<script|preview-is-dragging|installPreviewDrag/);
});
