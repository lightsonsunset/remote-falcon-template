// Editor-only download names and advisory Home-heading contrast checks.
import {themes} from './themes.js';
import {contrast} from './template.js';

export function viewerFilename(settings,template){
 const name=String(settings.name||'').normalize('NFKC').replace(/[<>:"/\\|?*\u0000-\u001f\u007f]/g,' ').trim().replace(/[\s.]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0,90).replace(/-$/,'')||'My-Show';
 return name+(template&&template.id!=='festive'?'-'+template.id:'')+'-'+themes[settings.theme].name.replace(/ /g,'-')+'.html';
}

export function nameContrastAdvice(s){
 if(!s.showNameOnHome)return '';
 const name=s.customNameColour?s.nameColour:s.logoMode==='seasonal'&&s.combineLogoName?s.colours.gold:s.colours.text;
 if(![name,s.colours.home].every(c=>/^#[a-f0-9]{6}$/i.test(c)))return '';
 const rgb=c=>c.slice(1).match(/../g).map(v=>parseInt(v,16));
 const base=rgb(s.theme==='halloween'?'#130f1b':'#111118'),wash=rgb(s.colours.home);
 // Sample the full composited range of the viewer's Home gradients. This is
 // conservative advice, not a pixel-perfect accessibility certification.
 const min=s.theme==='halloween'?0:.14,max=s.theme==='halloween'?1-.62*.81*.82:1-.73*.84*.73;
 let lowest=21;
 for(let i=0;i<=100;i++){
  const a=min+(max-min)*i/100;
  const bg='#'+base.map((v,j)=>Math.round(v*(1-a)+wash[j]*a).toString(16).padStart(2,'0')).join('');
  lowest=Math.min(lowest,contrast(name,bg));
 }
 return lowest<3?'This show-name colour may be hard to read against parts of the Home background. Try a lighter or darker colour and check the preview.':'';
}
