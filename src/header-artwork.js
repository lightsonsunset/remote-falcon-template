// Shared, script-free header artwork. Logo identity is a separate choice.
import {assetBase,logoChoices} from './assets.js';
export const headerArtworkValue=s=>s.headerTopDecorations===false?'none':s.headerArtwork||'theme';
export const headerArtworkFile=s=>logoChoices[s.theme].find(c=>c.id===headerArtworkValue(s))?.file;
export const headerArtworkLabel=s=>({theme:'Theme default',none:'No header artwork'})[headerArtworkValue(s)]||logoChoices[s.theme].find(c=>c.id===headerArtworkValue(s))?.label;
export function setHeaderArtwork(s,value){s.headerArtwork=value;s.headerTopDecorations=value!=='none';}
export function headerArtworkTokens(s){
 const file=headerArtworkFile(s);
 if(!file)return {html:'',css:''};
 return {html:`<div class="header-artwork-picture" aria-hidden="true"><img src="${assetBase+file}" alt="" draggable="false"></div>`,css:`
/* Chosen upper artwork stays separate from the logo and lower decorations. */
#show-options .share-brand>.header-artwork-picture{position:relative;z-index:1;display:block;width:100%;max-width:420px;margin:0 auto 20px;pointer-events:none}
#show-options .header-artwork-picture img{display:block;width:100%;height:auto;max-height:180px;object-fit:contain;margin:0 auto;border-radius:0}
#show-options .share-brand:has(>.header-artwork-picture){padding-top:24px;min-height:0}
`};
}
