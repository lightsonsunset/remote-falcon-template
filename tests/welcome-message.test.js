import {normalizeReleaseMetadataForBaseline} from './helpers/release-metadata.js';
// Independently captured from remote-falcon-other-overlap-audit with final responsive audit patch, before welcome feature.
const baseline={
  "festive/christmas/true": "7ca495164d0329cdebfbc08cc5b4bc6445d00deada73b0f0a4ffca0e3edbe137",
  "festive/christmas/legacy": "7ca495164d0329cdebfbc08cc5b4bc6445d00deada73b0f0a4ffca0e3edbe137",
  "festive/halloween/true": "6f2dfaaf49844d19febc1b65ac12b130bd8f15c554121d6ae6956efbb230f30f",
  "festive/halloween/legacy": "6f2dfaaf49844d19febc1b65ac12b130bd8f15c554121d6ae6956efbb230f30f",
  "festive/thanksgiving/true": "3cb6ee723171673f6575cde54eb2dd2a316d92cef2755d708e49ab8640c6690f",
  "festive/thanksgiving/legacy": "3cb6ee723171673f6575cde54eb2dd2a316d92cef2755d708e49ab8640c6690f",
  "festive/australia-day/true": "b07a03460adde2a0229c3fcea3c463083d402edb7ea4443adf33113f281793e8",
  "festive/australia-day/legacy": "b07a03460adde2a0229c3fcea3c463083d402edb7ea4443adf33113f281793e8",
  "festive/us-patriotic/true": "b16a40a86a9c1317f96bfee5a991ff0a60d4a02156490c4caca3773975f2d5b1",
  "festive/us-patriotic/legacy": "b16a40a86a9c1317f96bfee5a991ff0a60d4a02156490c4caca3773975f2d5b1",
  "festive/valentines-day/true": "97d1b083b6ad43b78307f14c5c8b595a4fbc71b6f30bcb4728a60703cff36bad",
  "festive/valentines-day/legacy": "97d1b083b6ad43b78307f14c5c8b595a4fbc71b6f30bcb4728a60703cff36bad",
  "compact-console/christmas/true": "d2b8ca16905a7f84912b940681117a3a979fb1c28a407387e5552f6b9f6dc004",
  "compact-console/christmas/legacy": "d2b8ca16905a7f84912b940681117a3a979fb1c28a407387e5552f6b9f6dc004",
  "compact-console/halloween/true": "e475554db0e0bd0cd5185bc982947bd5e026ce321a752caef136ba794b28b60b",
  "compact-console/halloween/legacy": "e475554db0e0bd0cd5185bc982947bd5e026ce321a752caef136ba794b28b60b",
  "compact-console/thanksgiving/true": "bd14e526047302ed765490c22c895c6ed7c5499940474bf5dbf44f45b52a36c0",
  "compact-console/thanksgiving/legacy": "bd14e526047302ed765490c22c895c6ed7c5499940474bf5dbf44f45b52a36c0",
  "compact-console/australia-day/true": "1bf9e9516888fa552c7af993e8ee491688a11c3ceb4409326ec09ad1535a2cdb",
  "compact-console/australia-day/legacy": "1bf9e9516888fa552c7af993e8ee491688a11c3ceb4409326ec09ad1535a2cdb",
  "compact-console/us-patriotic/true": "b01781ec2cf2d9828688b68c7a9fccf47f3e7d7314bf393bd4c8fecce78620a0",
  "compact-console/us-patriotic/legacy": "b01781ec2cf2d9828688b68c7a9fccf47f3e7d7314bf393bd4c8fecce78620a0",
  "compact-console/valentines-day/true": "d287ab9500ad68983d811cccebe7c8daa5b6d546ee33f027c080c2b1aefc27b3",
  "compact-console/valentines-day/legacy": "d287ab9500ad68983d811cccebe7c8daa5b6d546ee33f027c080c2b1aefc27b3"
};

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {registry,parseBackup} from '../src/template-registry.js';
import {escapeHTML} from '../src/shared-settings.js';
import {welcomeDefaults,welcomeStyles,welcomePositions,welcomeTokens,welcomeCSS} from '../src/welcome-message.js';
import {guidanceTokens} from '../src/visitor-guidance.js';
const sources=Object.fromEntries(registry.map(t=>[t.id,readFileSync(new URL('../'+t.source,import.meta.url),'utf8')]));
const count=(text,value)=>text.split(value).length-1;
const slots=['WELCOME_BLOCK','WELCOME_ABOVE','WELCOME_BELOW','WELCOME_STATUS'];
const slotFor={header:'WELCOME_BLOCK','above-header':'WELCOME_ABOVE','below-header':'WELCOME_BELOW',status:'WELCOME_STATUS'};
for(const t of registry){
 test(t.id+': default and legacy renders remain byte-for-byte unchanged in every theme',()=>{
  for(const theme of Object.keys(t.themes))for(const visible of [true,'legacy']){
   const s=t.cloneDefaults(theme);delete s.welcomeStyle;delete s.welcomePosition;
   if(visible==='legacy')delete s.showWelcome;else s.showWelcome=visible;
   const html=t.render(sources[t.id],s);
   assert.equal(createHash('sha256').update(normalizeReleaseMetadataForBaseline(html)).digest('hex'),baseline[[t.id,theme,visible].join('/')]);
   assert.equal(t.renderDraft(sources[t.id],s).html,html);
   assert.equal(t.checkedSettings(s).showWelcome,visible!==false);
  }
 });
 test(t.id+': independent visibility, styles, slots, guidance and native live modes in all themes',()=>{
  for(const theme of Object.keys(t.themes))for(const welcomeStyle of welcomeStyles)for(const welcomePosition of welcomePositions)for(const guidancePosition of ['above-header','below-header','status'])for(const showWelcome of [false,true])for(const showMainGuidance of [false,true]){
   const s={...t.cloneDefaults(theme),welcomeStyle,welcomePosition,guidancePosition,showWelcome,showMainGuidance,welcome:'Unique welcome & <safe>',neighbourTitle:'Unique guidance title',neighbourText:'Unique guidance body'};
   const w=welcomeTokens(s,escapeHTML),g=guidanceTokens(s,escapeHTML,{cardAtStatus:t.id==='compact-console'}),html=t.render(sources[t.id],s);
   const label=[t.id,theme,welcomeStyle,welcomePosition,guidancePosition,showWelcome,showMainGuidance].join('/');
   for(const slot of slots)assert.equal(Boolean(w[slot]),showWelcome&&slot===slotFor[welcomePosition],label);
   assert.equal(count(html,'Unique welcome &amp; &lt;safe&gt;'),showWelcome?(welcomePosition==='status'?2:1):0,label);
   for(const slot of ['ABOVE','BELOW','STATUS']){
    const joined=w['WELCOME_'+slot]+g['MAIN_GUIDANCE_'+slot];
    if(joined)assert(html.includes(joined),label+' uses Welcome then Guidance');
   }
   const expectedMain=showMainGuidance?2:0,expectedInfo=t.id==='compact-console'?1:0;
   assert.equal(count(html,'Unique guidance body'),expectedMain+expectedInfo,label);
   if(showWelcome&&welcomeStyle==='card')assert(w[slotFor[welcomePosition]].startsWith('<section class="section-card visitor-guidance cc-visitor-guidance welcome-message">'),label);
   if(showWelcome&&!(welcomeStyle==='plain'&&welcomePosition==='header'))assert.match(html,/\.content__body:has\(\.welcome-message\)>\*\{flex-shrink:0\}/);
   assert.doesNotMatch(html,/<script\b|\[\[/);
   assert.equal(t.renderDraft(sources[t.id],s).html,html,label+' preview/export parity');
  }
 });
 test(t.id+': backups migrate absent keys and preserve explicit options and hidden text',()=>{
  for(const theme of Object.keys(t.themes))for(const welcomeStyle of welcomeStyles)for(const welcomePosition of welcomePositions){
   const s={...t.cloneDefaults(theme),showWelcome:false,welcomeStyle,welcomePosition,welcome:'Retain hidden wording'};
   const envelope=JSON.stringify({format:'seasonal-designs',version:1,template:t.id,designs:{[theme]:s}});
   assert.deepEqual(parseBackup(envelope).designs[theme],s);
   const old=structuredClone(s);delete old.welcomeStyle;delete old.welcomePosition;delete old.showWelcome;
   const restored=parseBackup(JSON.stringify({format:'seasonal-designs',version:1,template:t.id,designs:{[theme]:old}})).designs[theme];
   assert.equal(restored.showWelcome,true);for(const [key,value] of Object.entries(welcomeDefaults))assert.equal(restored[key],value);
  }
  const designs=Object.fromEntries(['christmas','halloween'].map(theme=>[theme,{...t.cloneDefaults(theme),welcomeStyle:'card',welcomePosition:'below-header'}]));
  const backup=t.separateSeasons?t.settingsFile(designs):t.settingsFile(designs.christmas);
  assert.equal(parseBackup(backup).designs.christmas.welcomeStyle,'card');assert.equal(parseBackup(backup).designs.christmas.welcomePosition,'below-header');
  for(const [key,value] of [['welcomeStyle','unknown'],['welcomePosition','outside'],['welcomeStyle',null],['welcomePosition',false]])assert.throws(()=>t.checkedSettings({...t.cloneDefaults(),[key]:value}),/welcome/);
 });
 test(t.id+': template slots keep status inside each native live container and outside slots before guidance',()=>{
  const source=sources[t.id];
  for(const slot of ['ABOVE','BELOW','STATUS'])assert(source.includes('[[WELCOME_'+slot+']][[MAIN_GUIDANCE_'+slot+']]'));
  assert.equal(count(source,'[[WELCOME_STATUS]]'),2);
  for(const mode of ['jukebox-dynamic-container','playlist-voting-dynamic-container'])assert(new RegExp('\\{'+mode+'\\}>[\\s\\S]*?\\[\\[ON_AIR\\]\\][\\s\\S]*?\\[\\[WELCOME_STATUS\\]\\]').test(source));
  const after=source.slice(source.indexOf('{after-hours-message}'),source.indexOf('{jukebox-dynamic-container}'));
  assert(!after.includes('[[WELCOME_STATUS]]'));
 });
}
test('blank welcomes omit new cards/placements, preserve legacy blank paragraphs, and always escape',()=>{
 for(const welcomeStyle of welcomeStyles)for(const welcomePosition of welcomePositions){
  const s={showWelcome:true,welcomeStyle,welcomePosition,welcome:'   '};
  const w=welcomeTokens(s,escapeHTML);for(const slot of slots)assert.equal(w[slot],welcomeStyle==='plain'&&welcomePosition==='header'&&slot==='WELCOME_BLOCK'?'<p>   </p>':'');
  assert.equal(welcomeCSS(s),'');
  s.welcome='<img src=x onerror="alert(1)">\nA & B';const rendered=welcomeTokens(s,escapeHTML)[slotFor[welcomePosition]];
  assert(rendered.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));assert.doesNotMatch(rendered,/<img/);
  s.showWelcome=false;const hidden=welcomeTokens(s,escapeHTML);for(const slot of slots)assert.equal(hidden[slot],'');assert.equal(welcomeCSS(s),'');
 }
});
