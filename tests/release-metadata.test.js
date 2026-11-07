import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {registry} from '../src/template-registry.js';
import {releaseMetadata,parseReleaseMetadata,assertOpeningReleaseMetadata,normalizeReleaseMetadataForBaseline} from './helpers/release-metadata.js';

test('actual source and all seasonal renderer edition metadata match package and first released changelog',()=>{
 for(const t of registry){
  const source=readFileSync(new URL('../'+t.source,import.meta.url),'utf8');assertOpeningReleaseMetadata(source);
  for(const theme of Object.keys(t.themes))assertOpeningReleaseMetadata(t.render(source,t.cloneDefaults(theme)));
 }
});
test('metadata normalization changes only the two opening edition values and preserves all other bytes',()=>{
 const expected={version:'1.13.0',date:'9 November 2026'};
 for(const name of ['LIGHTS ON SUNSET','COMPACT CONSOLE'])for(const newline of ['\n','\r\n']){
  const prefix='<!doctype html>'+newline+'<!-- '+name+' TEMPLATE / customiser edition ';
  const tail=newline+'  Retain comment text. -->'+newline+'<p>1.13.0 / 9 November 2026</p>'+newline+'<!-- customiser edition 1.13.0 / 9 November 2026 -->'+newline;
  assert.equal(normalizeReleaseMetadataForBaseline(prefix+'1.13.0 / 9 November 2026'+tail,expected),prefix+'1.12.0 / 22 October 2026'+tail);
 }
});
test('normalization rejects missing, misplaced, malformed and mismatched opening metadata',()=>{
 const valid='<!doctype html>\n<!-- LIGHTS ON SUNSET TEMPLATE / customiser edition '+releaseMetadata.version+' / '+releaseMetadata.date+'\n-->';
 for(const bad of [valid.replace('customiser edition','edition'),valid.replace(releaseMetadata.version,'0.0.0'),valid.replace(releaseMetadata.date,'1 January 1900'),valid.replace('LIGHTS ON SUNSET','UNKNOWN'),'<p>prefix</p>'+valid,valid.replace(' / '+releaseMetadata.date,''),'<html></html>'])assert.throws(()=>normalizeReleaseMetadataForBaseline(bad));
});
test('release metadata skips Unreleased but cannot skip an invalid first published heading',()=>{
 const result=parseReleaseMetadata({version:'1.13.0'},'# Changelog\n## Unreleased\n- Pending\n## 1.13.0 - Layout fixes and welcome controls - 9 November 2026\n## 1.12.0 - Old - 22 October 2026');
 assert.deepEqual(result,{version:'1.13.0',date:'9 November 2026'});
 assert.throws(()=>parseReleaseMetadata({version:'1.13.0'},'## 1.12.0 - Old - 22 October 2026\n## 1.13.0 - New - 9 November 2026'));
 assert.throws(()=>parseReleaseMetadata({version:'1.13.0'},'## Unreleased'));
 assert.throws(()=>parseReleaseMetadata({version:'1.13.0'},'## Invalid\n## 1.13.0 - New - 9 November 2026'));
});
