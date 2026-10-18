// Shared editor season choices; each template owns what switching a season does.
export function seasonOptions(theme,attribute='data-season'){
 return '<div class="season-options" role="group" aria-label="Season">'+[['christmas','Christmas','✦','Cosy lights & holiday warmth'],['halloween','Halloween','☾','Spooky details & glowing lights']].map(([id,name,icon,description])=>`<button type="button" ${attribute}="${id}" aria-pressed="${theme===id}" class="season-card ${theme===id?'selected':''}"><span aria-hidden="true">${icon}</span><strong>${name}</strong><small>${description}</small></button>`).join('')+'</div>';
}
