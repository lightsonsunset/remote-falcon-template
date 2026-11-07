// Test-only normalization: preserve behavioral snapshots across release metadata updates.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
export function parseReleaseMetadata(pkg,changelog){
 assert.match(pkg.version,/^\d+\.\d+\.\d+$/,'Invalid package release version');
 const heading=changelog.split(/\r?\n/).find(line=>line.startsWith('## ')&&!/^## Unreleased\b/.test(line));
 const match=heading?.match(/^## (\d+\.\d+\.\d+) [-\u2013\u2014] .+ [-\u2013\u2014] (\d{1,2} [A-Z][a-z]+ \d{4})$/);
 assert(match,'Missing or malformed first released changelog heading');
 assert.equal(match[1],pkg.version,'Package version and first released changelog heading differ');
 return Object.freeze({version:pkg.version,date:match[2]});
}
export const releaseMetadata=parseReleaseMetadata(JSON.parse(readFileSync(new URL('../../package.json',import.meta.url),'utf8')),readFileSync(new URL('../../CHANGELOG.md',import.meta.url),'utf8'));
const opening=/^(<!doctype html>\r?\n<!-- (?:LIGHTS ON SUNSET|COMPACT CONSOLE) TEMPLATE \/ customiser edition )(\d+\.\d+\.\d+)( \/ )(\d{1,2} [A-Z][a-z]+ \d{4})(?=\r?\n)/;
export function assertOpeningReleaseMetadata(html,expected=releaseMetadata){
 const match=html.match(opening);
 assert(match,'Missing or malformed opening template edition line');
 assert.equal(match[2],expected.version,'Opening edition version differs from release metadata');
 assert.equal(match[4],expected.date,'Opening edition date differs from release metadata');
 return match;
}
export function normalizeReleaseMetadataForBaseline(html,expected=releaseMetadata){
 const match=assertOpeningReleaseMetadata(html,expected);
 // Replace only these two fields in the verified opening comment. No newline conversion.
 return match[1]+'1.12.0'+match[3]+'22 October 2026'+html.slice(match[0].length);
}
