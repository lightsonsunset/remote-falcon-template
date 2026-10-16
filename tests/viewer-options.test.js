import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {cloneDefaults,parseSettings,settingsFile,render,changeTheme} from '../src/template.js';
const source=await readFile(new URL('../templates/christmas.html',import.meta.url),'utf8');
test('old settings preserve labels and a static dot; new options round trip across themes',()=>{
 const old=cloneDefaults();delete old.showMenuLabels;delete old.onAirPulse;old.name='Existing show';
 const s=parseSettings(settingsFile(old));assert.equal(s.showMenuLabels,true);assert.equal(s.onAirPulse,false);assert.equal(s.name,old.name);
 s.showMenuLabels=false;s.onAirPulse=true;const next=changeTheme(parseSettings(settingsFile(s)),'halloween');assert.equal(next.showMenuLabels,false);assert.equal(next.onAirPulse,true);
});
test('icons-only export keeps accessible custom names and pulse stays live-only with reduced motion',()=>{
 for(const theme of ['christmas','halloween']){
  const s=cloneDefaults(theme);assert(!render(source,s).includes('animation:los-live-glow'));
  s.showMenuLabels=false;s.onAirPulse=true;s.copy.NAV_HOME='Our home';const html=render(source,s);
  assert(html.includes('aria-label="Our home"'));assert(html.includes('.los-menu__label { display:none; }'));
  assert(html.includes('.show-status--live .show-status__label::before { animation:los-live-glow'));
  assert(html.includes('@media(prefers-reduced-motion:reduce) { .show-status--live .show-status__label::before { animation:none; } }'));
  assert(!/<script\b|\son\w+=|What’s new|changelog-dialog/.test(html));
 }
});
