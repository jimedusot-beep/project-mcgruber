import { heading, escape, $, $$ } from "./ui.js";
import { download } from "./storage.js";
import { gadgetReferences, gadgetCategories, filterGadgets, gadgetWorksheet } from "./gadget-references.js";

const link=(url,label)=>'<a target="_blank" rel="noopener noreferrer" href="'+escape(url)+'">'+escape(label)+' ↗</a>';

export function gadgetLibraryHTML() {
 return heading("13 ideas. One connected invention workshop.", "Gadget Research Library",
   "Study useful hardware, understand the real parts required, then prototype with existing McGruber tools. These are reference designs, not owned inventory or verified completed builds.",
   '<a href="#/assistant" class="button">Workshop Intelligence →</a>')+
   '<p class="notice"><strong>Research-only catalog:</strong> none of these 13 devices is automatically added to your inventory. Salvage references are potential investigation leads, never electrically confirmed matches. No radio transmission, lock access, or wireless scanning occurs here.</p>'+
   '<div class="panel"><div class="form-grid">'+
   '<label>Search gadgets or ingredients<input type="search" id="gadget-search" placeholder="ESP32, tracker, optics, mechanical…"></label>'+
   '<label>Area<select id="gadget-area"><option value="all">All areas</option>'+gadgetCategories.map(g=>'<option value="'+escape(g)+'">'+escape(g)+'</option>').join("")+'</select></label>'+
   '<label>Learning priority<select id="gadget-priority"><option value="all">All priorities</option><option value="Start">Start with these</option><option value="Later">Advanced / later</option></select></label></div>'+
   '<p id="gadget-count" role="status" class="small muted"></p></div>'+
   '<div id="gadget-results" class="component-grid gadget-grid"></div>'+
   '<div class="panel"><h2>How this connects to McGruber</h2>'+
   '<p>First study the reference. Next inspect existing parts in Component Bank, prototype the appropriate virtual inputs in Device Brain, create real construction notes in Salvage Workbench, and record only actual results in the Notebook. A listed ingredient is not proof of ownership.</p>'+
   '<div class="row wrap"><a class="button" href="#/components">Component Bank</a><a class="button" href="#/device-brain">Device Brain</a><a class="button" href="#/notebook">Notebook</a></div></div>';
}

export function mountGadgetLibrary(ctx) {
 const search=$("#gadget-search"),area=$("#gadget-area"),priority=$("#gadget-priority"),results=$("#gadget-results");
 function render(){
   const rows=filterGadgets({query:search.value,group:area.value,priority:priority.value});
   $("#gadget-count").textContent=rows.length+" of 13 references · "+rows.filter(g=>g.priority==="Start").length+" current starting candidates in this view";
   const imported=new Set(ctx.workspace.inventory.map(p=>p.sourceReferenceId).filter(Boolean));
   results.innerHTML=rows.length?rows.map(g=>'<article class="panel gadget-card">'+
     '<div class="eyebrow">'+escape(g.id)+' · '+escape(g.group)+'</div>'+
     '<h3>'+escape(g.title)+'</h3>'+
     '<div class="row wrap"><span class="pill">'+escape(g.level)+'</span><span class="pill">'+escape(g.priority)+'</span><span class="pill">'+escape(g.track)+'</span></div>'+
     '<p>'+escape(g.purpose)+'</p>'+
     '<p class="small"><strong>First achievable experiment:</strong> '+escape(g.capability)+'</p>'+
     '<details><summary>DIY starting ingredients ('+g.ingredients.length+')</summary><ul>'+g.ingredients.map(i=>'<li>'+escape(i)+'</li>').join("")+'</ul></details>'+
     '<details><summary>Constraints, permissions and uncertainties</summary><p>'+escape(g.limits)+'</p></details>'+
     '<details><summary>Inventory leads and existing projects</summary>'+
       (g.leads.length?'<p class="small">Potential catalog leads (NOT verified compatible): '+g.leads.map(l=>escape(l)+(imported.has(l)?" · privately recorded":" · reference only")).join("; ")+'</p>':
           '<p class="small muted">No identifiable matching parts in current Rev 4 reference.</p>')+
       '<p class="small">Related existing inventions: '+g.related.map(s=>'<a href="#/project/'+s+'">'+s+'</a>').join(", ")+'</p>'+
     '</details>'+
     '<div class="small gadget-sources"><strong>Sources:</strong> '+g.sources.map(([name,url])=>link(url,name)).join(" · ")+'</div>'+
     '<div class="row wrap gadget-actions"><a class="button" href="#/'+escape(g.tool)+'">Open '+escape(g.tool==="device-brain"?"Device Brain":g.tool==="viewer"?"3D Lab":g.tool==="assistant"?"Workshop Intelligence":g.tool==="notebook"?"Notebook":g.tool==="salvage"?"Salvage Workbench":"Circuit Lab")+'</a>'+
     '<button type="button" data-gadget-export="'+escape(g.id)+'">Export research checklist</button></div>'+
     '</article>').join(""):'<div class="panel"><h3>No matches found</h3><p>Try a different category or search term.</p></div>';
   $$("[data-gadget-export]").forEach(b=>b.onclick=()=>{
     const item=gadgetReferences.find(x=>x.id===b.dataset.gadgetExport);
     if(item) download(gadgetWorksheet(item),"mcgruber-"+item.id.toLowerCase()+"-research.md","text/markdown");
   });
 }
 search.oninput=render;area.onchange=render;priority.onchange=render;render();
}
