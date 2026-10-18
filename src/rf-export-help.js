// Shared editor-only guidance; opening help never changes a design or catalogue.
export function rfExportHelpLink(){
 return '<button type="button" class="inline-link rf-export-help-link" data-rf-export-help>How to export from RF</button>';
}
export function createRFExportHelp(){
 const dialog=document.createElement('dialog');dialog.id='rf-export-help-dialog';dialog.setAttribute('aria-labelledby','rf-export-help-title');
 dialog.innerHTML=`<div class="dialog-heading"><h2 id="rf-export-help-title" tabindex="-1">How to export from RF</h2><button type="button" data-close-rf-export-help aria-label="Close RF export help">×</button></div>
 <ol class="rf-export-steps">
 <li>Sign in to <a href="https://remotefalcon.com/control-panel/sequences/list" target="_blank" rel="noopener noreferrer">RF’s Sequences page ↗</a>.</li>
 <li>Choose <strong>Export</strong> at the top to download your song list as a CSV file.</li>
 <li>Come back here, choose <strong>Import RF song CSV</strong> and select that file. Review your choices, then select <strong>Import &amp; apply choices</strong>.</li>
 </ol>
 <p class="hint">Your song CSV stays in this browser. <a href="https://docs.remotefalcon.com/docs/docs/control-panel/show/sequences" target="_blank" rel="noopener noreferrer">RF’s sequence guide ↗</a></p>
 <div class="small-actions"><button type="button" class="primary" data-close-rf-export-help>Got it</button></div>`;
 document.body.append(dialog);let opener;
 document.addEventListener('click',event=>{const button=event.target.closest('[data-rf-export-help]');if(!button)return;opener=button;dialog.showModal();dialog.scrollTop=0;dialog.querySelector('h2').focus({preventScroll:true});});
 dialog.querySelectorAll('[data-close-rf-export-help]').forEach(button=>button.addEventListener('click',()=>dialog.close()));
 dialog.addEventListener('close',()=>{if(opener?.isConnected)opener.focus({preventScroll:true});});
}
