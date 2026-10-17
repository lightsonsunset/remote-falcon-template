// Shared editor/wizard controls; never included in exported HTML.
import {nameFonts} from './name-style.js';
import {nameContrastAdvice} from './release-ux.js';
const previewFonts=new WeakMap();
export function nameStyleForm(s,setup=false){
 const attr=setup?'data-setup-key':'data-key',colour=/^#[a-f0-9]{6}$/i.test(s.nameColour)?s.nameColour:'#ffffff';
 return '<details class="copy-group name-style" data-copy-group="name-style"><summary>Show-name style</summary><div class="copy-fields"><p class="hint" data-name-hidden '+(s.showNameOnHome?'hidden':'')+'>Enable Show name on Home to change its style. Your choices are kept.</p><fieldset data-name-style '+(s.showNameOnHome?'':'disabled')+'><legend class="visually-hidden">Home show-name appearance</legend><label class="field"><span class="field-label">Font style</span><select '+attr+'="nameFont">'+nameFonts.map(f=>'<option value="'+f.id+'" '+(s.nameFont===f.id?'selected':'')+'>'+f.label+'</option>').join('')+'</select></label><div class="name-font-sample"><span class="hint">Show-name preview</span><div data-name-preview></div></div><label class="toggle"><input type="checkbox" '+attr+'="customNameColour" '+(s.customNameColour?'checked':'')+'>Custom show-name colour</label><div data-name-colour '+(s.customNameColour?'':'hidden')+'><label class="colour-field"><input type="color" '+attr+'="nameColour" value="'+colour+'" aria-label="Show-name colour"><span>Show-name colour</span></label><button type="button" class="inline-link" data-reset-name-colour>Use template colour</button></div><p class="hint">Only the name on Home changes, including names paired with artwork. Lettering inside an uploaded image cannot be changed. Template colour follows your normal text or combined-logo accent.</p></fieldset></div></details>';
}
export function updateNameStyleForm(root,s){
 root.querySelectorAll('[data-name-style]').forEach(el=>{
  let advice=el.querySelector('[data-name-contrast]');
  if(!advice){advice=el.ownerDocument.createElement('p');advice.className='hint';advice.dataset.nameContrast='';advice.setAttribute('role','status');el.append(advice);}
  advice.textContent=nameContrastAdvice(s);advice.hidden=!advice.textContent;
 });
 root.querySelectorAll('[data-name-style]').forEach(el=>el.disabled=!s.showNameOnHome);
 root.querySelectorAll('[data-name-hidden]').forEach(el=>el.hidden=s.showNameOnHome);
 root.querySelectorAll('[data-name-colour]').forEach(el=>el.hidden=!s.customNameColour);
 const samples=root.querySelectorAll('[data-name-preview]');if(!samples.length)return;
 const font=nameFonts.find(f=>f.id===s.nameFont)||nameFonts[0],doc=root.ownerDocument;
 // Register only selected fonts; the browser loads them when the sample is visible.
 if(font.file&&doc.defaultView.FontFace){
  let registered=previewFonts.get(doc);if(!registered){registered=new Set();previewFonts.set(doc,registered);}
  if(!registered.has(font.id)){
   doc.fonts.add(new doc.defaultView.FontFace(font.family,'url("'+new URL('../assets/fonts/'+font.file,import.meta.url).href+'")',{weight:String(font.weight),style:'normal',display:'swap'}));
   registered.add(font.id);
  }
 }
 const combined=s.logoMode==='seasonal'&&s.combineLogoName;
 const colour=s.customNameColour?s.nameColour:combined?s.colours.gold:s.colours.text;
 samples.forEach(el=>{
  el.textContent=s.name.trim()||'Your show name';
  el.style.fontFamily=font.file?'"'+font.family+'", '+font.fallback:'-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
  el.style.fontWeight=String(font.weight||(combined?800:700));
  el.style.letterSpacing=font.file?'normal':combined?'.015em':'-.035em';
  el.style.color=/^#[a-f0-9]{6}$/i.test(colour)?colour:'#f6f4f8';
  el.style.backgroundColor=s.theme==='halloween'?'#130f1b':'#111118';
  el.style.backgroundImage='linear-gradient(135deg, '+s.colours.home+'70, '+s.colours.home+'24)';
 });
}
