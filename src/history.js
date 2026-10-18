// Editor-only transactions. Never serialize history into a design or viewer export.
const clone=value=>structuredClone(value);
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function createHistory(initial,{limit=100}={}){
 let current=clone(initial),past=[],future=[],group=null;
 return {
  get value(){return clone(current);},
  get status(){return {canUndo:past.length>0,canRedo:future.length>0,undoLabel:past.at(-1)?.label||'',redoLabel:future.at(-1)?.label||''};},
  endGroup(){group=null;},
  record(next,{label='Edit settings',group:nextGroup=null}={}){
   if(equal(current,next))return false;
   if(!nextGroup||group!==nextGroup||!past.length){past.push({value:clone(current),label});if(past.length>limit)past.shift();}
   current=clone(next);future=[];group=nextGroup;
   return true;
  },
  undo(){group=null;if(!past.length)return null;const entry=past.pop();future.push({value:clone(current),label:entry.label});current=entry.value;return clone(current);},
  redo(){group=null;if(!future.length)return null;const entry=future.pop();past.push({value:clone(current),label:entry.label});current=entry.value;return clone(current);}
 };
}
export function createHistoryBank(){
 const histories=new Map();
 return {seed(key,initial){const current=histories.get(key);if(!current||(!current.status.canUndo&&!current.status.canRedo))histories.set(key,createHistory(initial));},get(key,initial){if(!histories.has(key))histories.set(key,createHistory(initial));return histories.get(key);},endGroups(){for(const h of histories.values())h.endGroup();}};
}
