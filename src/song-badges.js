// Script-free badges on RF song cards. The card's ::before remains available for artwork.
export function songBadgeCSS(s,escapeCSS){
 const names=[...new Set((s.movingHeadNames||'').split(/\r?\n/).filter(n=>n.trim()))];
 if(!names.length)return '';
 const selected=names.map(n=>'[data-key="'+escapeCSS(n)+'"]').join(', ');
 const card='.content__body .los-song-list :is(.jukebox-list,.cell-vote-playlist):is('+selected+')';
 const newNames=new Set(s.newNames.split(/\r?\n/));
 const both=names.filter(n=>newNames.has(n)).map(n=>'[data-key="'+escapeCSS(n)+'"]').join(', ');
 return `/* MOVING HEADS ASSIGNMENTS: exact RF sequence names; no change to requests or categories. */
${card} { --los-new-text-gutter:0px; }
.content__body .los-song-list .cell-vote-row:has(> .cell-vote-playlist:is(${selected})) > .cell-vote-playlist { flex:1; }
/* Compact Voting puts its NEW sash on the row; the combined pill owns both labels. */
.content__body .los-song-list .cell-vote-row:has(> .cell-vote-playlist:is(${selected}))::after { content:none; }
${card}::after { content:"Moving heads";position:static;grid-column:1 / -1;grid-row:auto;justify-self:start;margin-top:10px;width:fit-content;height:auto;max-width:100%;box-sizing:border-box;transform:none;border-radius:999px;padding:4px 8px;background:var(--gold);color:var(--accent-ink);font-family:inherit;font-size:.68rem;line-height:1.4;font-weight:800;letter-spacing:normal;text-transform:none;text-align:center;white-space:normal;pointer-events:none; }
${both?'.content__body .los-song-list :is(.jukebox-list,.cell-vote-playlist):is('+both+')::after { content:"NEW · Moving heads"; }':''}
/* MOVING HEADS ASSIGNMENTS END */`;
}
