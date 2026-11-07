import {readFileSync} from 'node:fs';
import {exportRequiredGroups} from '../src/changelog-export-metadata.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {parseReleasedChanges,releaseHeading,needsNewHTML} from '../src/changelog.js';
test('release history omits pending work and preserves template groups and historical date headings',()=>{
 const input='# Changelog\n\n## Unreleased\n### Shared customiser\n- Pending change\n\n## 1.8.0 — Shared updates — 18 October 2026\n### Shared customiser\n- Compatible settings\n### Compact console\n- Layout fix\n\n## 17 October 2026 — Earlier updates\n- Original history\n';
 const result=parseReleasedChanges(input);
 assert.equal(result.length,2);
 assert.deepEqual(result[0].groups.map(g=>g.title),['Shared customiser','Compact console']);
 assert.equal(result[1].groups[0].items[0],'Original history');
 assert(!JSON.stringify(result).includes('Pending change'));
});
test('changelog content remains text, including unfamiliar markup',()=>{
 const result=parseReleasedChanges('## 1.8.1 — Fix\r\n- **Strong text** and <img src=x onerror=alert(1)>\r\n');
 assert.equal(result[0].groups[0].items[0],'**Strong text** and <img src=x onerror=alert(1)>');
 assert.deepEqual(parseReleasedChanges('not a changelog'),[]);
});

test('release cards separate version and date without losing historical titles',()=>{
 assert.deepEqual(releaseHeading('1.12.0 - New themes - 22 October 2026'),{version:'1.12.0',date:'22 October 2026',title:'New themes'});
 assert.deepEqual(releaseHeading('17 October 2026 - Earlier updates'),{version:'',date:'17 October 2026',title:'Earlier updates'});
 assert.deepEqual(releaseHeading('1.2.3 - Fix - More detail'),{version:'1.2.3',date:'',title:'Fix - More detail'});
 assert.deepEqual(releaseHeading('Original release'),{version:'',date:'',title:'Original release'});
});

test('release metadata supports existing typographic heading separators',()=>{assert.deepEqual(releaseHeading('1.12.0 \u2014 Real release \u2014 22 October 2026'),{version:'1.12.0',date:'22 October 2026',title:'Real release'});});

test('export badges use explicit version/group metadata, not viewer keywords',()=>{
 assert.equal(needsNewHTML({title:'1.12.0 - Title'},'Shared customiser'),true);
 assert.equal(needsNewHTML({title:'1.13.0 - Title'},'Shared customiser'),false);
 assert.equal(needsNewHTML({title:'1.13.0 - Title'},'Both templates'),true);
 for(const version of ['1.9.1','1.9.0','1.5.1','99.0.0'])assert.equal(needsNewHTML({title:version+' - New viewer HTML'},'Shared customiser'),false);
 assert.equal(needsNewHTML({title:'1.6.1 - Mobile schedule alignment'}),true);
 assert.equal(needsNewHTML({title:'Unreleased'},'Both templates'),false);
 assert.equal(needsNewHTML({title:'1.12.0 - Title'},'Unknown group'),false);
});

test('versionless historical badge keys match exact real headings and packaging includes module',async()=>{
 const releases=parseReleasedChanges(readFileSync(new URL('../CHANGELOG.md',import.meta.url),'utf8'));
 for(const key of Object.keys(exportRequiredGroups).filter(k=>k.startsWith('heading:'))){const release=releases.find(r=>r.title===key.slice(8));assert.ok(release,key);assert.equal(needsNewHTML(release),true);}
 const {releaseFiles}=await import('../scripts/release-files.mjs');
 assert.ok((await releaseFiles(true)).includes('src/changelog-export-metadata.js'));
 assert.ok((await releaseFiles(false)).includes('src/changelog-export-metadata.js'));
});
