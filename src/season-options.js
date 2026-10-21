// Shared theme choices; each template owns its saved-design policy.
import {themes} from './themes.js';
const description=(id,t)=>id==='christmas'?'Cosy lights & holiday warmth':id==='halloween'?'Spooky details & glowing lights':t.description;
export function seasonOptions(theme,attribute='data-season',compact=false){
 const choices='<div class="season-options'+(compact?' season-options-compact':'')+'" role="group" aria-label="Season">'+Object.entries(themes).map(([id,t])=>`<button type="button" ${attribute}="${id}" aria-pressed="${theme===id}" class="season-card ${theme===id?'selected':''}"><span aria-hidden="true">${t.symbol||(id==='christmas'?'✦':'☾')}</span><strong>${t.name}</strong>${compact?'':`<small>${description(id,t)}</small>`}</button>`).join('')+'</div>';
 return choices+(compact?`<p class="hint season-description"><strong>${themes[theme].name}:</strong> ${description(theme,themes[theme])}</p>`:'');
}
