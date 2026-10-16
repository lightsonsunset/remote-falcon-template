// Fixed, self-hosted heading fonts. No user-supplied CSS or font URLs.
import {assetBase} from './assets.js';
export const nameFonts=[
 {id:'current',label:'Default'},
 {id:'rounded',label:'Rounded',family:'LOS Nunito',fallback:'Arial, sans-serif',weight:800,file:'nunito.ttf'},
 {id:'elegant',label:'Elegant',family:'LOS Playfair Display',fallback:'Georgia, serif',weight:700,file:'playfair-display.ttf'},
 {id:'festive',label:'Festive',family:'LOS Berkshire Swash',fallback:'Georgia, serif',weight:400,file:'berkshire-swash.ttf'},
 {id:'spooky',label:'Spooky',family:'LOS Creepster',fallback:'Georgia, serif',weight:400,file:'creepster.ttf'}
];
export const nameStyleDefaults={nameFont:'current',customNameColour:false,nameColour:'#ffffff'};
export const fontPackageFiles=nameFonts.filter(f=>f.file).flatMap(f=>['fonts/'+f.file,'fonts/'+f.id+'-OFL.txt']);
export function nameStyleCSS(s){
 if(!s.showNameOnHome)return '';
 const font=nameFonts.find(f=>f.id===s.nameFont),rules=[];
 if(!font)throw Error('Unsupported show-name font.');
 if(font.file)rules.push('font-family:"'+font.family+'", '+font.fallback+';font-weight:'+font.weight+';font-synthesis:none;letter-spacing:normal;');
 if(s.customNameColour){if(!/^#[a-f0-9]{6}$/i.test(s.nameColour))throw Error('Invalid show-name colour.');rules.push('color:'+s.nameColour+';');}
 if(!rules.length)return '';
 const face=font.file?'@font-face { font-family:"'+font.family+'";src:url("'+assetBase+'fonts/'+font.file+'") format("truetype");font-style:normal;font-weight:'+font.weight+';font-display:swap; }\n':'';
 return face+'.content__body .share-brand h1, .content__body .share-brand.brand-combined h1 { '+rules.join(' ')+' }';
}
