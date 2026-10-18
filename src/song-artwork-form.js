// Shared editor/setup controls; category configuration stays in the Music editor.
import {artworkChoices,songArtworkMode,nowPlayingArtwork,categoryIcon} from './song-artwork.js';
import {iconButton} from './icon-picker.js';
import {escapeHTML as e} from './template.js';
export function categoryArtworkRows(s){return s.categoryNames.map((name,i)=>`<div class="category-artwork-row"><span>${e(name)||'Category '+(i+1)}</span>${iconButton(categoryIcon(s,name),`data-icon-category="${i}"`,e((name||'Category '+(i+1))+' category'))}</div>`).join('');}
export function songArtworkForm(s,{setup=false}={}){
 const key=setup?'data-setup-key':'data-key';
 return `<label class="field"><span class="field-label">Song-list artwork</span><select ${key}="songArtwork">${artworkChoices.map(([id,label])=>`<option value="${id}" ${songArtworkMode(s)===id?'selected':''}>${label}</option>`).join('')}</select></label>
 <div data-category-artwork ${songArtworkMode(s)==='category'?'':'hidden'}>${setup?'<p class="hint">Choose each category’s icon in Music → Song appearance after setup.</p>':`<p class="hint">Each song uses its category’s icon. Songs without a category, and categories without a chosen icon, use a music note.</p><div class="category-artwork-list">${categoryArtworkRows(s)}</div><p class="hint">Match the names and order to your RF categories. Icons also work with filter buttons hidden.</p><button type="button" class="inline-link" data-go-section="18">Edit categories &amp; order</button>`}</div>
 <label class="toggle"><input type="checkbox" ${key}="showNowPlayingArtwork" ${nowPlayingArtwork(s)?'checked':''}>Show album artwork in Now Playing</label>
 <p class="hint">Album artwork uses the covers saved in Remote Falcon. Missing covers leave no empty image space.</p>
 <label class="toggle"><input type="checkbox" ${key}="showSongArtists" ${s.showSongArtists?'checked':''}>Show artists in the song list</label>
 <label class="toggle"><input type="checkbox" ${key}="showQueueArtists" ${s.showQueueArtists?'checked':''}>Show artists in Now Playing, Up Next &amp; queue</label>
 <p class="hint">Songs without artist information show just their title.</p>`;
}
export function updateSongArtworkForm(root,s){
 root.querySelectorAll('[data-category-artwork]').forEach(el=>el.hidden=songArtworkMode(s)!=='category');
 root.querySelectorAll('[data-category-settings]').forEach(el=>el.hidden=!s.categories&&songArtworkMode(s)!=='category');
 // Renaming categories updates the picker labels without rebuilding the field being typed in.
 root.querySelectorAll('.category-artwork-list').forEach(el=>{const signature=JSON.stringify([s.categoryNames,s.categoryIcons]);if(el.dataset.artworkState!==signature){el.innerHTML=categoryArtworkRows(s);el.dataset.artworkState=signature;}});
}
