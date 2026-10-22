// Shared identity controls for the editor and its detached setup draft.
import {escapeHTML as e} from './shared-settings.js';
import {themes} from './themes.js';
import {logoChoices,logoFile} from './assets.js';
import {iconButton} from './icon-picker.js';
import {defaultIcon} from './icons.js';
import {headerArtworkValue} from './header-artwork.js';
export function headerChoices(s,features={}){
 return [['none','No logo'],[features.headerIconMode||'icon','Simple show icon'],...(features.includedArtwork===false?[]:[['seasonal','Included '+themes[s.theme].name+' picture']]),['custom','My own logo']];
}
// Compact's original "icon" value means styled text only. Keep old backups intact.
export const headerMode=(s,features={})=>features.headerIconMode==='symbol'&&s.logoMode==='icon'?'none':s.logoMode;
export const headerLabel=(s,features={})=>headerChoices(s,features).find(([id])=>id===headerMode(s,features))?.[1]||'My own logo';
export function headerIdentity(s,{features={},setup=false}={}){
 const attr=setup?'data-setup-key':'data-key',prefix=setup?'setup-':'',iconAttr=setup?'data-setup-icon="brand"':'data-icon-role="brand"';
 const select=(key,label,choices)=>`<label class="field"><span class="field-label">${label}</span><select id="${prefix}identity-${key}" ${attr}="${key}">${choices.map(([id,label])=>`<option value="${id}" ${(key==='logoMode'?headerMode(s,features):key==='headerArtwork'?headerArtworkValue(s):s[key])===id?'selected':''}>${e(label)}</option>`).join('')}</select></label>`;
 const upper=select('headerArtwork','Header artwork',[['theme',features.headerIconMode!=='symbol'&&['christmas','halloween'].includes(s.theme)?'Theme default (no top artwork)':'Theme default'],...logoChoices[s.theme].map(c=>[c.id,c.label]),['none','No header artwork']]);
 const mode=select('logoMode','Logo',headerChoices(s,features)).replace('id="'+prefix+'identity-logoMode"','id="'+(setup?'setup-logoMode':'identity-logoMode')+'"');
 return upper+'<p class="hint">Artwork at the top, above your logo and show name. Choose No header artwork to hide it. Lower decorations are separate under Theme &amp; style.</p>'+mode+'<p class="hint" data-no-logo>Hides the logo or icon. Header artwork, show name and welcome text stay separate.</p>'+`<div class="header-icon-control" data-header-icon>${iconButton(s.icons?.brand||defaultIcon('brand',s),iconAttr,'show')}</div>`+
 (features.includedArtwork===false?'':`<div ${setup?'id="setup-included-logo"':''} data-seasonal-logo>${select('logoStyle','Included logo design',logoChoices[s.theme].map(c=>[c.id,c.label]))}${features.combineLogoName===false?'':`<label class="toggle"><input type="checkbox" ${attr}="combineLogoName" ${s.combineLogoName?'checked':''}>Combine artwork with editable show name</label>`}<img ${setup?'id="setup-artwork"':''} class="${setup?'setup-artwork':'artwork-choice'}" src="assets/${logoFile(s)}" alt="Included ${themes[s.theme].name} illustration"><p class="hint">Using this as your logo? You can hide the separate top image with No header artwork above.</p></div>`)+
 `<div ${setup?'id="setup-logo-fields"':''} data-logo-field><label class="field"><span class="field-label">Logo image link</span><input id="${setup?'setup-logo':'identity-logo'}" type="url" ${attr}="logo" value="${e(s.logo)}" maxlength="4000" placeholder="https://example.org/logo.png" aria-describedby="${setup?'setup-error-logo':'error-logo'}"><span class="hint">Use a public HTTPS link directly to your image.</span><span class="error" id="${setup?'setup-error-logo':'error-logo'}" ${setup?'data-setup-error':'data-error'}="logo"></span><span class="url-completion hint" role="status"></span></label><p class="hint">Recommended: 600 × 400 px, or a square 600 × 600 px logo. Images fit without cropping. <a href="https://docs.remotefalcon.com/docs/docs/control-panel/account/image-hosting" target="_blank" rel="noopener">Host an image in RF ↗</a></p></div>`;
}
export function updateHeaderIdentity(root,s,features={}){
 root.querySelectorAll('[data-no-logo]').forEach(el=>el.hidden=headerMode(s,features)!=='none');
 root.querySelectorAll('[data-header-icon]').forEach(el=>el.hidden=s.logoMode!==(features.headerIconMode||'icon'));
 root.querySelectorAll('[data-logo-field]').forEach(el=>el.hidden=s.logoMode!=='custom');
 root.querySelectorAll('[data-seasonal-logo]').forEach(el=>el.hidden=s.logoMode!=='seasonal');
 root.querySelectorAll('.artwork-choice,.setup-artwork').forEach(el=>el.src='assets/'+logoFile(s));
}
