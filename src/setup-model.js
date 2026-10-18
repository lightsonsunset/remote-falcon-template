// Editor-only setup draft. Validation and theme behaviour are shared with the editor.
import {changeTheme,validate,checkedSettings} from './template.js';
export const setupSteps=['Your show','Dates & hours','Music & listening','Review & finish'];
export const setupKeys=[['theme','name','welcome','logoMode','logo','logoStyle','combineLogoName','showNameOnHome','nameFont','customNameColour','nameColour','icons'],['dates','schedule'],['fm','frequency','pulsemesh','pulsemeshButtons','pulsemeshUrl','listening','showAlbumArtwork','songArtwork','showNowPlayingArtwork','showSongArtists','showQueueArtists']];
export function setupErrors(settings,step,validator=validate){
 const keys=setupKeys[step]||setupKeys.flat();
 return Object.fromEntries(Object.entries(validator(settings)).filter(([key])=>keys.some(k=>key===k||key.startsWith(k+'.'))));
}
export function createSetupDraft(settings,adapter={changeTheme,validate,checkedSettings}){
 let draft=structuredClone(settings),entry=structuredClone(draft);
 return {
  get value(){return draft;},
  enter(){entry=structuredClone(draft);},
  skip(){draft=structuredClone(entry);},
  theme(value){draft=adapter.changeTheme?adapter.changeTheme(draft,value):draft;},
  errors:step=>setupErrors(draft,step,adapter.validate),
  finish(){if(Object.keys(setupErrors(draft,undefined,adapter.validate)).length)throw Error('Complete the highlighted setup fields first.');return adapter.checkedSettings(draft);}
 };
}
