// Representative CSS viewport sizes, not hardware or operating-system emulation.
export const viewports = {
  mobile: [
    {id:'compact-phone',label:'Compact phone',width:320,height:568},
    {id:'standard-phone',label:'Standard phone',width:390,height:844},
    {id:'large-phone',label:'Large phone',width:430,height:932}
  ],
  tablet: [
    {id:'compact-tablet',label:'Compact tablet',width:768,height:1024},
    {id:'large-tablet',label:'Large tablet',width:820,height:1180},
    {id:'landscape-tablet',label:'Tablet landscape',width:1024,height:768}
  ],
  desktop: [{id:'desktop',label:'Desktop',width:1280,height:800}]
};
export const defaultViewports={mobile:'standard-phone',tablet:'compact-tablet',desktop:'desktop'};
