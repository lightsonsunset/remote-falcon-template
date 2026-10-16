import test from 'node:test';
import assert from 'node:assert/strict';
import {cloneDefaults,settingsFile,parseSettings,render} from '../src/template.js';
import {createSetupDraft,setupErrors} from '../src/setup-model.js';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../templates/christmas.html',import.meta.url),'utf8');
test('Setup edits remain detached until finish and cannot mutate the original',()=>{
 const s=cloneDefaults(),before=structuredClone(s),d=createSetupDraft(s);d.enter();d.value.name='My show';d.value.schedule[0].hours='8pm–10pm';
 assert.deepEqual(s,before);assert.equal(d.finish().name,'My show');assert.deepEqual(s,before);
});
test('Skipping restores the whole step including theme side effects',()=>{
 const d=createSetupDraft(cloneDefaults());d.enter();d.theme('halloween');d.value.logoMode='custom';d.value.logo='bad';d.skip();assert.deepEqual(d.value,cloneDefaults());
 d.value.name='Keep my name';d.enter();d.value.dates='Changed';d.value.schedule.push({day:'Extra',hours:'7pm'});d.skip();assert.equal(d.value.name,'Keep my name');assert.equal(d.value.schedule.length,3);
});
test('Theme changes preserve personalised settings and inactive feature values',()=>{
 const s=cloneDefaults();Object.assign(s,{name:'Family & Friends',welcome:'Our words',logo:'https://example.org/logo.png',logoMode:'custom',listening:'Speakers outside',donationUrl:'https://example.org/support'});s.colours.home='#123456';s.copy.SUCCESS_TITLE='Great pick';s.schedule[2]={day:'School holidays',hours:'8pm'};
 const d=createSetupDraft(s);d.theme('halloween');const v=d.finish();
 for(const k of ['name','welcome','logo','logoMode','listening','donationUrl'])assert.equal(v[k],s[k]);assert.equal(v.colours.home,s.colours.home);assert.deepEqual(v.copy,s.copy);assert.deepEqual(v.schedule[2],s.schedule[2]);
});
test('Shared validation blocks relevant fields but ignores unrelated incomplete extras',()=>{
 const s=cloneDefaults();s.donations=true;s.donationUrl='';s.logoMode='custom';s.logo='http://example.org/x';s.fm=true;s.frequency='FM';
 assert.ok(setupErrors(s,0).logo);assert.equal(setupErrors(s,0).frequency,undefined);assert.ok(setupErrors(s,2).frequency);assert.equal(setupErrors(s).donationUrl,undefined);
 const d=createSetupDraft(s);assert.throws(()=>d.finish());d.value.logo='https://example.org/x';d.value.frequency='88.7';assert.equal(d.finish().donationUrl,'');
});
test('Disabled listening and custom-logo values are retained without blocking setup',()=>{
 const s=cloneDefaults();s.frequency='Later';s.logo='Later';const d=createSetupDraft(s);assert.deepEqual(d.errors(),{});assert.equal(d.finish().frequency,'Later');assert.equal(d.finish().logo,'Later');
});
test('Wizard result round-trips through the existing settings format and canonical renderer',()=>{
 const d=createSetupDraft(cloneDefaults());Object.assign(d.value,{name:'The "A&B" Show <3',dates:'5–25 December',fm:true,frequency:'99.1',pulsemesh:true,listening:'Listen & enjoy'});d.value.schedule=[{day:'Every night',hours:'8pm–10pm'},{day:'Christmas Eve',hours:'8pm–late'}];
 const s=d.finish();assert.deepEqual(parseSettings(settingsFile(s)),s);const html=render(source,s);assert.ok(html.includes('The &quot;A&amp;B&quot; Show &lt;3'));assert.ok(html.includes('99.1'));assert.ok(html.includes('8pm–late'));assert.doesNotMatch(html,/<script|setup-wizard|setup-content|welcome-setup|Demo:/i);
});
