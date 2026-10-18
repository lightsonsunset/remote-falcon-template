// Shared artwork settings and CSS for RF-generated rows. No preview dependency.
import {iconLibrary,iconGlyphs} from './icons.js';
// Null inherits the released checkbox. Older settings and API callers keep both
// artwork areas as before; explicit new choices are independent of that value.
export const artworkDefaults={songArtwork:null,showNowPlayingArtwork:null,categoryIcons:{}};
export const artworkChoices=[['album','Album artwork'],['category','Category icons'],['none','No artwork']];
export const songArtworkMode=s=>s.songArtwork??(s.showAlbumArtwork?'album':'none');
export const nowPlayingArtwork=s=>s.showNowPlayingArtwork??s.showAlbumArtwork;
export const categoryIcon=(s,name)=>Object.hasOwn(s.categoryIcons||{},name)?s.categoryIcons[name]:'music';
export function checkedArtwork(input){
 const songArtwork=input.songArtwork??null,showNowPlayingArtwork=input.showNowPlayingArtwork??null;
 if(songArtwork!==null&&!artworkChoices.some(([id])=>id===songArtwork))throw Error('Choose supported song-list artwork.');
 if(showNowPlayingArtwork!==null&&typeof showNowPlayingArtwork!=='boolean')throw Error('Invalid Now Playing artwork choice.');
 const icons=input.categoryIcons===undefined?{}:input.categoryIcons;
 if(!icons||typeof icons!=='object'||Array.isArray(icons)||Object.keys(icons).length>12)throw Error('Use up to 12 category icons.');
 const entries=Object.entries(icons);
 for(const [name,id] of entries)if(name.length>100||/[\u0000-\u001f]/.test(name)||typeof id!=='string'||!Object.hasOwn(iconLibrary,id))throw Error('Choose a supported category icon.');
 return {songArtwork,showNowPlayingArtwork,categoryIcons:Object.fromEntries(entries.filter(([name])=>input.categoryNames?.includes(name)))};
}
export function renameCategoryArtwork(s,oldName,newName){
 if(oldName===newName||!Object.hasOwn(s.categoryIcons,oldName))return;
 const icon=s.categoryIcons[oldName];delete s.categoryIcons[oldName];s.categoryIcons={...s.categoryIcons,[newName]:icon};
}
function glyphCSS(id){const css=iconLibrary[id][1],brand=css.startsWith('fa-brands'),solid=css.startsWith('fa-solid');return `--los-category-glyph:"\\${iconGlyphs[id]}";--los-category-font:"Font Awesome 6 ${brand?'Brands':'Free'}";--los-category-weight:${solid?900:400};`;}
export function artworkCSS(s){
 const mode=songArtworkMode(s),rules=[`
/* ARTIST VISIBILITY: independent song-list and playback/queue choices.
   Empty RF artist elements take no space; missing elements need no placeholder. */
.content__body :is(.jukebox-list-artist,.cell-vote-playlist-artist,.jukebox-queue-artist):empty,
body:has(#show-options.hide-song-artists) .los-song-list :is(.jukebox-list-artist,.cell-vote-playlist-artist),
body:has(#show-options.hide-queue-artists) :is(.playing-now,.next-playlist,.jukebox-queue) :is(.jukebox-list-artist,.cell-vote-playlist-artist,.jukebox-queue-artist) { display:none; }
/* Do not reserve an artwork grid row for an absent or hidden artist. */
.content__body :is(.jukebox-list,.cell-vote-playlist,.playing-now):not(:has(> :is(.jukebox-list-artist,.cell-vote-playlist-artist):not(:empty))) > img,
body:has(#show-options.hide-song-artists) .los-song-list :is(.jukebox-list,.cell-vote-playlist) > img,
body:has(#show-options.hide-queue-artists) .playing-now > img { grid-row:1; }
`];
 if(!nowPlayingArtwork(s))rules.push(`
/* Now Playing artwork is independent of the song list. */
.content__body .playing-now img { display:none; }
.content__body .playing-now { min-height:0;grid-template-columns:minmax(0,1fr);column-gap:0; }
.content__body .playing-now > :not(img) { grid-column:1; }
`);
 if(mode!=='album')rules.push(`
/* Compact song cards. Artwork remains stored in Remote Falcon. */
.content__body { --los-new-vote-card-height:6.8rem; }
.content__body .los-song-list .jukebox-list img,
.content__body .los-song-list .cell-vote-playlist img { display:none; }
.content__body .los-song-list .jukebox-list,
.content__body .los-song-list .cell-vote-playlist { grid-template-columns:minmax(0,1fr);column-gap:0;min-height:64px; }
.content__body .los-song-list .jukebox-list { padding-right:calc(.78em + var(--los-new-text-gutter,0px)); }
.content__body .los-song-list :is(.jukebox-list,.cell-vote-playlist) > :not(img) { grid-column:1; }
.content__body .cell-vote-row > .cell-vote-playlist { min-height:var(--los-new-vote-height,64px); }
`);
 if(mode==='category')rules.push(`
/* Decorative category icons; NEW sashes continue to use ::after. */
.content__body { --los-new-vote-card-height:8.5rem; }
.los-song-list { ${glyphCSS('music')} }
.content__body .los-song-list :is(.jukebox-list,.cell-vote-playlist) { padding-left:72px;min-height:72px; }
.content__body .cell-vote-row > .cell-vote-playlist { min-height:var(--los-new-vote-height,72px); }
.content__body .los-song-list :is(.jukebox-list,.cell-vote-playlist)::before {
 content:var(--los-category-glyph) / "";font-family:var(--los-category-font);font-weight:var(--los-category-weight);font-style:normal;font-size:28px;line-height:1;
 position:absolute;left:14px;top:50%;transform:translateY(-50%);width:44px;height:44px;display:grid;place-items:center;
 border-radius:9px;background:color-mix(in srgb,var(--gold) 12%,transparent);color:var(--gold);pointer-events:none;
}
/* CATEGORY ART MAPPING START */
${s.categoryNames.map((name,i)=>`.los-song-list > .category-section:nth-child(${i+1} of .category-section) { ${glyphCSS(categoryIcon(s,name))} }`).join('\n')}
/* CATEGORY ART MAPPING END */
`);
 return rules.join('\n');
}
