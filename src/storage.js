import {parseSettings, settingsFile} from './template.js';
export const SETTINGS_KEY='rf-template-builder:show:v1';
export const PREFS_KEY='rf-template-builder:editor:v1';
export function readPreferences(storage){
  try{const value=JSON.parse(storage?.getItem(PREFS_KEY)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{return {};}
}
export function writePreferences(storage,changes){
  try{if(!storage)return false;storage.setItem(PREFS_KEY,JSON.stringify({...readPreferences(storage),...changes}));return true;}catch{return false;}
}
export function restore(storage) {
  try {const raw=storage.getItem(SETTINGS_KEY);return {settings:raw?parseSettings(raw,true):null,error:''};}
  catch {return {settings:null,error:'Saved settings could not be read. You can still edit and download a settings backup.'};}
}
export function persist(storage,settings) {
  try {storage.setItem(SETTINGS_KEY,settingsFile(settings));return true;}catch{return false;}
}
