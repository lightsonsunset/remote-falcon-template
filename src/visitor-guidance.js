// Native RF mode containers determine availability; no visitor JavaScript.
export const guidanceDefaults={showMainGuidance:true,guidancePosition:'status'};
export function guidanceTokens(s,e,{cardAtStatus=false}={}){
 const text=(s.neighbourTitle.trim()?`<p class="rf-titles">${e(s.neighbourTitle)}</p>`:'')+(s.neighbourText.trim()?`<p class="neighbour-message">${e(s.neighbourText)}</p>`:'');
 const card=text?`<section class="section-card visitor-guidance cc-visitor-guidance">${text}</section>`:'';
 const live=card?['jukebox-dynamic-container','playlist-voting-dynamic-container'].map(mode=>`<div {${mode}}>${card}</div>`).join(''):'';
 return {NEIGHBOUR:text,MAIN_GUIDANCE_ABOVE:s.showMainGuidance&&s.guidancePosition==='above-header'?live:'',MAIN_GUIDANCE_BELOW:s.showMainGuidance&&s.guidancePosition==='below-header'?live:'',MAIN_GUIDANCE_STATUS:s.showMainGuidance&&s.guidancePosition==='status'?(cardAtStatus?card:text):'',INFO_GUIDANCE:card};
}
