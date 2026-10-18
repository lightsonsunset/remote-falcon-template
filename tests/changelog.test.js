import test from 'node:test';
import assert from 'node:assert/strict';
import {parseReleasedChanges} from '../src/changelog.js';
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
