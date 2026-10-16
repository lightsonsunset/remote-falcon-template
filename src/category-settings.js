import {categoryNamesOf} from './catalogue.js';

// CSV order is not RF's saved section order. Keep known order, append new names.
export function detectedCategories(catalogue,settings){
  const names=catalogue?categoryNamesOf(catalogue):[];
  const error=!catalogue?'Import your RF song CSV first.':!names.length?'No categories were found. Assign categories in RF, then import a fresh export.':catalogue.songs.some(s=>!s.category)?'Some songs have no category. Assign those in RF before setting up filters.':names.length>12||names.some(n=>n.length>100)?'Use up to 12 categories, each no longer than 100 characters.':'';
  return {names:[...settings.categoryNames.filter(n=>names.includes(n)),...names.filter(n=>!settings.categoryNames.includes(n))],error};
}
export function applyCategories(settings,names){
  settings.categoryNames=[...names];
  settings.hiddenCategories=settings.hiddenCategories.filter(n=>names.includes(n));
  settings.categories=true;
}
export function catalogueMatches(catalogue,settings){
  if(!catalogue)return true;
  const names=categoryNamesOf(catalogue);
  return !catalogue.songs.some(s=>!s.category)&&names.length===settings.categoryNames.length&&names.every(n=>settings.categoryNames.includes(n));
}
