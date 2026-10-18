import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {cloneDefaults,checkedSettings,parseSettings,settingsFile,render,renderDraft,validate,supportCardDefaults,changeTheme} from '../src/template.js';
import {settingsForm} from '../src/editor-form.js';
const source=await readFile(new URL('../templates/christmas.html',import.meta.url),'utf8');
function configured(){const s=cloneDefaults();Object.assign(s,{donations:true,charity:'Community cause',donationUrl:'https://example.org/give',donationHome:true,donationInfo:true});s.donationRecipients=[{name:'Local podcast',description:'Stories from our community.',url:'https://example.org/listen',image:'',home:true,info:true,...supportCardDefaults,button:'Listen to {charity}',callout:'Discover <stories> & {charity}',hint:'Tap to listen'}];return s;}
test('support cards keep their Support buttons and Home/Info teasers independent',()=>{
 const s=configured();s.copy.DONATE_BUTTON='Give to {charity}';s.copy.DONATION_CALLOUT='Help {charity}';s.copy.DONATE_HINT='Tap to donate';
 const html=render(source,s),cards=[...html.matchAll(/<a class="section-card compact donation-card compact-live additional-donation"[\s\S]*?<\/a>/g)].map(m=>m[0]);
 assert.equal(cards.length,4);
 for(const card of cards){assert.match(card,/Discover &lt;stories&gt; &amp; Local podcast/);assert.match(card,/Tap to listen/);assert.doesNotMatch(card,/Tap to donate|Help Community cause/);}
 assert.match(html,/Give to Community cause/);assert.match(html,/Listen to Local podcast/);
 assert.deepEqual(parseSettings(settingsFile(s)),s);
 s.donationRecipients[0].hint='';assert.doesNotMatch(render(source,s),/Tap to listen/);
});
test('old cards capture shared wording once and preserve it after primary-card edits',()=>{
 const s=configured();delete s.donationRecipients[0].callout;delete s.donationRecipients[0].hint;s.donationRecipients[0].button='';
 Object.assign(s.copy,{DONATION_CALLOUT:'See {charity}',DONATE_HINT:'Our saved helper',DONATE_BUTTON:'Open {charity}'});
 const migrated=parseSettings(settingsFile(s));assert.deepEqual(migrated.donationRecipients[0],{...s.donationRecipients[0],button:'Open {charity}',callout:'See {charity}',hint:'Our saved helper'});
 migrated.copy.DONATE_HINT='Changed primary only';assert.equal(checkedSettings(migrated).donationRecipients[0].hint,'Our saved helper');
 assert.match(render(source,migrated),/Our saved helper/);
});
test('teaser validation is scoped to enabled placements and incomplete drafts stay safe',()=>{
 const s=configured();s.donationRecipients[0].callout='';assert.ok(validate(s)['donationRecipients.0.callout']);assert.throws(()=>render(source,s));assert.doesNotThrow(()=>renderDraft(source,s));
 s.donationRecipients[0].home=false;s.donationRecipients[0].info=false;assert.equal(validate(s)['donationRecipients.0.callout'],undefined);assert.doesNotThrow(()=>render(source,s));
 s.donationRecipients[0].button='';assert.ok(validate(s)['donationRecipients.0.button']);
 const partial=configured();delete partial.donationRecipients[0].hint;assert.throws(()=>parseSettings(settingsFile(partial)),/support card hint/);
});
test('editor clearly separates Support wording from each Home/Info teaser',()=>{
 const html=settingsForm(configured());assert.match(html,/>Support cards</);assert.match(html,/>\+ Add another support card</);assert.doesNotMatch(html,/Donation wording|shared donation wording/);
 assert.equal(html.split('<summary>Home &amp; Info teaser</summary>').length-1,2);
 assert.equal(html.split('data-copy="DONATE_BUTTON"').length-1,1);
 for(const part of ['button','callout','hint'])assert.equal(html.split('data-part="'+part+'"').length-1,1);
});

test('Support menu visibility defaults on for older designs and preserves card settings',()=>{
 const old=configured();delete old.showSupportTab;
 const s=parseSettings(settingsFile(old));assert.equal(s.showSupportTab,true);
 s.showSupportTab=false;s.copy.SUPPORT_TITLE='Our supporters';s.copy.NAV_SUPPORT='Thanks';
 const roundTrip=parseSettings(settingsFile(s));assert.deepEqual(roundTrip,s);
 const next=changeTheme(roundTrip,'halloween');assert.equal(next.showSupportTab,false);
 assert.deepEqual(next.donationRecipients,s.donationRecipients);assert.equal(next.donationHome,true);assert.equal(next.donationInfo,true);
 assert.equal(next.copy.SUPPORT_TITLE,'Our supporters');assert.equal(next.copy.NAV_SUPPORT,'Thanks');
 assert.throws(()=>checkedSettings({...s,showSupportTab:'false'}),/showSupportTab/);
});

test('hiding Support changes only its menu entry and decoration positions',()=>{
 for(const theme of ['christmas','halloween']){
  const s=changeTheme(configured(),theme);s.decorations=true;s.showSupportTab=false;
  const html=render(source,s);
  assert.match(html,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(html,/\.los-menu__item\[data-tab-target="support"\] \{ display:none; \}/);
  assert.match(html,/id="support-panel"/);assert.match(html,/Our community|Local podcast/);
  // All original recipient links and teasers remain available, independent of menu visibility.
  assert.equal((html.match(/href="https:\/\/example.org\/give"/g)||[]).length,5);
  assert.equal((html.match(/href="https:\/\/example.org\/listen"/g)||[]).length,5);
  assert.match(html,/#info-panel :target\) \.los-menu \{ --nav-decoration-index:2; \}/);
  assert.match(html,/#support-panel :target\) \.los-menu::after \{ content:none; \}/);
  assert.doesNotMatch(html,/<script\b|localhost|data-demo-/);
  const form=settingsForm(s);assert.equal(form.split('data-key="showSupportTab"').length-1,1);
  assert.match(form,/Show or hide Support in the navigation menu/);assert.match(form,/existing direct links to it still work/);
  s.showSupportTab=true;const shown=render(source,s);
  assert.doesNotMatch(shown,/\.los-menu__item\[data-tab-target="support"\] \{ display:none; \}/);
  assert.match(shown,/#info-panel :target\) \.los-menu \{ --nav-decoration-index:3; \}/);
 }
});
