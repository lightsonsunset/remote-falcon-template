// Editor-only setup draft. Validation and theme behaviour are shared with the editor.
import {changeTheme,validate,checkedSettings} from './template.js';
export const setupSteps=['Your show','Dates & hours','Listening','Review & finish'];
export const setupKeys=[['theme','name','welcome','logoMode','logo','logoStyle','combineLogoName','showNameOnHome'],['dates','schedule'],['fm','frequency','pulsemesh','listening']];
export function setupErrors(settings,step){
 const keys=setupKeys[step]||setupKeys.flat();
 return Object.fromEntries(Object.entries(validate(settings)).filter(([key])=>keys.some(k=>key===k||key.startsWith(k+'.'))));
}
export function createSetupDraft(settings){
 let draft=structuredClone(settings),entry=structuredClone(draft);
 return {
  get value(){return draft;},
  enter(){entry=structuredClone(draft);},
  skip(){draft=structuredClone(entry);},
  theme(value){draft=changeTheme(draft,value);},
  errors:step=>setupErrors(draft,step),
  finish(){if(Object.keys(setupErrors(draft)).length)throw Error('Complete the highlighted setup fields first.');return checkedSettings(draft);}
 };
}
