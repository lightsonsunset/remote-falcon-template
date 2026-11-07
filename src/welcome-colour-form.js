import {contrast} from './shared-settings.js';
// Shared editor and setup controls. Colour input never rewrites saved choices.
export function welcomeColourForm(s,{setup=false,namespace=''}={}){
 const attr=setup?'data-setup-key':'data-key',prefix=namespace+(setup?'setup-':''),colour=(key,fallback)=>/^#[a-f0-9]{6}$/i.test(s[key])?s[key]:fallback;
 return `<div data-welcome-colours ${s.welcomeStyle==='card'?'':'hidden'}><label class="toggle"><input type="checkbox" ${attr}="customWelcomeColours" ${s.customWelcomeColours?'checked':''}>Use custom card colours</label><div data-welcome-colour-fields ${s.customWelcomeColours?'':'hidden'}><label class="colour-field"><input type="color" ${attr}="welcomeCardColour" value="${colour('welcomeCardColour','#263746')}" aria-label="Background colour" aria-describedby="${prefix}welcome-contrast"><span>Background colour</span></label><label class="colour-field"><input type="color" ${attr}="welcomeTextColour" value="${colour('welcomeTextColour','#ffffff')}" aria-label="Text colour" aria-describedby="${prefix}welcome-contrast"><span>Text colour</span></label><button type="button" class="inline-link" data-reset-welcome-colours>Use theme colours</button><p class="hint" id="${prefix}welcome-contrast" data-welcome-contrast role="status"></p></div></div>`;
}
export function updateWelcomeColours(root,s,{deferContrast=false}={}){
 // Updating warning layout or preview while the native picker is open can close it.
 if(deferContrast)return;
 for(const group of root.querySelectorAll('[data-welcome-colours]')){
  group.hidden=s.welcomeStyle!=='card';group.querySelector('[data-welcome-colour-fields]').hidden=!s.customWelcomeColours;
  const advice=group.querySelector('[data-welcome-contrast]');
  if(s.customWelcomeColours&&/^#[a-f0-9]{6}$/i.test(s.welcomeTextColour)&&/^#[a-f0-9]{6}$/i.test(s.welcomeCardColour)){
   const ratio=contrast(s.welcomeTextColour,s.welcomeCardColour);advice.textContent=ratio<4.5?'Low contrast. Choose a lighter or darker text colour (aim for 4.5:1).':'Good text contrast ('+ratio.toFixed(1)+':1).';
  }else advice.textContent='';
 }
}
export function resetWelcomeColours(event,root){
 if(!event.target.closest('[data-reset-welcome-colours]'))return false;
 const input=root.querySelector('[data-key="customWelcomeColours"],[data-setup-key="customWelcomeColours"]');if(!input)return false;
 input.checked=false;input.dispatchEvent(new input.ownerDocument.defaultView.Event('input',{bubbles:true}));input.focus();return true;
}
