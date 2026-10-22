// Shared editor/setup controls. Guidance values and rendering keep their existing keys.
export const guidancePositions=[
 {id:'above-header',label:'Above the header'},
 {id:'below-header',label:'Below the header'},
 {id:'status',label:'Below On air'}
];
export function visitorGuidanceForm({toggle,select,feature,field},features={}){
 return toggle('showMainGuidance','Show visitor guidance on the main screen')+
  feature('showMainGuidance',select('guidancePosition','Position',guidancePositions))+
  '<p class="hint">Main-screen guidance appears only while on air. The header includes your logo, show name and welcome text.'+
  (features.guidanceInfo?' The same message also appears on Info.':'')+'</p>'+
  field('neighbourTitle','Heading','','text',true)+
  field('neighbourText','Visitor message','Leave both fields blank to remove the guidance.','textarea',true);
}
