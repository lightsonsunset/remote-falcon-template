// RF owns song markup. Keep ::before for category artwork and ::after for the
// in-flow Moving spotlights pill. For dual labels, draw the same NEW corner treatment
// as an embedded background; its accessible text is included on the pill.
// No extra DOM nodes, external assets or viewer JavaScript are required.
function sashImage(colour,ink,compact=false){
 const drawing=compact
  ? '<g transform="translate(23 13) rotate(12)"><rect x="-17" y="-8" width="34" height="16" rx="3" fill="'+colour+'"/><text text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-size="8.64" font-weight="800" fill="'+ink+'">NEW</text></g>'
  : '<g transform="translate(82.8 29.2) rotate(45)"><rect x="-54" y="-13.2" width="108" height="26.4" fill="'+colour+'"/><path d="M-54 -12.7H54" stroke="#fff9dc" stroke-opacity=".65"/><path d="M-54 12.7H54" stroke="#644106" stroke-opacity=".2"/><text text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-size="12.8" font-weight="850" letter-spacing="1.28" fill="'+ink+'">NEW</text></g>';
 return 'url("data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+(compact?'44 28':'108 80')+'">'+drawing+'</svg>')+'")';
}
export function songBadgeCSS(s,escapeCSS,ink='#17131e'){
 const names=[...new Set((s.movingHeadNames||'').split(/\r?\n/).filter(n=>n.trim()))];
 if(!names.length)return '';
 const selected=names.map(n=>'[data-key="'+escapeCSS(n)+'"]').join(', ');
 const card='.content__body .los-song-list :is(.jukebox-list,.cell-vote-playlist):is('+selected+')';
 // Only validated colours can enter SVG markup, including direct helper callers.
 const colour=/^#[a-f\d]{6}$/i.test(s.colours?.gold)?s.colours.gold:'#edc581';
 ink=/^#[a-f\d]{6}$/i.test(ink)?ink:'#17131e';
 return `/* MOVING HEADS ASSIGNMENTS: exact RF sequence names for Moving spotlights badges. */
.content__body { --los-new-corner-art:${sashImage(colour,ink)}; }
body:has(#show-options.compact-console) .content__body { --los-new-corner-art:${sashImage(colour,ink,true)}; }
.content__body .los-song-list .cell-vote-row:has(> .cell-vote-playlist:is(${selected})) > .cell-vote-playlist { flex:1; }
/* Reserve the existing NEW gutter only on tagged Jukebox cards; artwork and long
   titles must not run under the separate sash. Untagged cards keep their spacing. */
.content__body .los-song-list .jukebox-list:is(${selected}) { padding-right:calc(.78em + var(--los-new-text-gutter,0px)); }
/* NEW's existing assignment controls the separate sash, including demo styling. */
${card} { background-image:var(--los-new-sash-image,none);background-position:right top;background-size:6.75rem 5rem;background-repeat:no-repeat; }
${card}::after { content:"Moving spotlights";content:"Moving spotlights" / var(--los-new-moving-label,"Moving spotlights");position:static;grid-column:1 / -1;grid-row:auto;justify-self:start;margin-top:10px;width:fit-content;height:auto;max-width:100%;box-sizing:border-box;transform:none;border:0;box-shadow:none;border-radius:999px;padding:4px 8px;background:var(--gold);color:var(--accent-ink);font-family:inherit;font-size:.68rem;line-height:1.4;font-weight:800;letter-spacing:normal;text-transform:none;text-align:center;white-space:normal;pointer-events:none; }
body:has(#show-options.compact-console) ${card} { background-size:2.75rem 1.75rem; }
/* Compact grouped Voting already has a NEW marker on its row. Keep that one. */
body:has(#show-options.compact-console) .content__body .los-song-list .cell-vote-row > .cell-vote-playlist:is(${selected}) { background-image:none; }
body:has(#show-options.compact-console) .content__body .los-song-list .cell-vote-row > .cell-vote-playlist:is(${selected})::after { content:"Moving spotlights"; }
/* MOVING HEADS ASSIGNMENTS END */`;
}
