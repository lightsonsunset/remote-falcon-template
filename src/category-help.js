// Shared editor-only help. Opening it never commits pending catalogue choices.
const rfCategories='https://docs.remotefalcon.com/docs/docs/control-panel/show/sequences#categories';
export function categoryHelpLinks(){
 return '<div class="category-help-links"><button type="button" class="inline-link" data-category-help>How category filters work</button><a href="'+rfCategories+'" target="_blank" rel="noopener noreferrer">RF category guide ↗</a></div>';
}
export function missingCategoryNotice(catalogue){
 const count=catalogue?.songs.filter(song=>!song.category).length||0;
 return count?count+' '+(count===1?'song has':'songs have')+' no category. We recommend assigning every song a category in RF. These songs still appear under All (and New this year when marked NEW); category artwork uses a music note.':'';
}
export function createCategoryHelp(){
 const dialog=document.createElement('dialog');dialog.id='category-help-dialog';dialog.setAttribute('aria-labelledby','category-help-title');
 dialog.innerHTML=`<div class="dialog-heading"><h2 id="category-help-title" tabindex="-1">How category filters work</h2><button type="button" data-close-category-help aria-label="Close category help">×</button></div>
 <p>Category buttons let visitors browse groups of songs. Set up the categories in RF, then match them here.</p>
 <ol class="category-help-steps">
 <li><strong>Assign songs in RF.</strong> We recommend giving every song a category in RF’s Sequences list.</li>
 <li><strong>Match the order.</strong> Customiser row 1 selects RF’s first category section, row 2 its second, and so on. Renaming a button doesn’t move songs. CSV imports find names, but not RF’s saved category order.</li>
 <li><strong>Keep rows; hide buttons.</strong> Keep a row for every non-empty category on your RF viewer page. Untick Show button to hide a filter; its songs stay under All. Recheck the order if a category is added, hidden or emptied.</li>
 </ol>
 <p><strong>Songs without a category</strong> still appear under All and, when marked NEW, New this year. Category artwork uses a music note. They don’t need an extra category row.</p>
 <p>These controls don’t change categories saved in RF. <a href="${rfCategories}" target="_blank" rel="noopener noreferrer">Read RF’s category guide ↗</a></p>
 <div class="small-actions"><button type="button" class="primary" data-close-category-help>Got it</button></div>`;
 document.body.append(dialog);let opener;
 document.querySelectorAll('[data-category-help-links]').forEach(el=>el.innerHTML=categoryHelpLinks());
 document.addEventListener('click',event=>{const button=event.target.closest('[data-category-help]');if(!button)return;opener=button;dialog.showModal();dialog.scrollTop=0;dialog.querySelector('h2').focus({preventScroll:true});});
 dialog.querySelectorAll('[data-close-category-help]').forEach(button=>button.addEventListener('click',()=>dialog.close()));
 dialog.addEventListener('close',()=>{if(opener?.isConnected)opener.focus({preventScroll:true});});
}
