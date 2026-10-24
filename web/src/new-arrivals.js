// Separate owner-confirmed deliveries from the October 23, 2026 Rev 4 PDF.
// Catalog entries come from photographed package text, not physical function tests.
import {escape} from "./ui.js";

const legalId=/^ARR-\d{3}$/;
const safe=(s)=>escape(s??"");

export function validateNewArrivals(arrivals) {
 if(!arrivals || !Array.isArray(arrivals.items) || arrivals.items.length>250 ||
    new Set(arrivals.items.map(x=>x.id)).size!==arrivals.items.length) throw Error("Invalid owner arrivals catalog.");
 for(const item of arrivals.items) {
   if(!legalId.test(item.id) || !item.name || !item.manufacturer || !item.acquiredDate ||
      !Array.isArray(item.colorGrit) || !Array.isArray(item.included) ||
      !Array.isArray(item.safety) || !Array.isArray(item.uses) ||
      !Array.isArray(item.compatibility) || typeof item.photosPublished!=="boolean")
     throw Error("Invalid owner arrival entry.");
 }
 return arrivals;
}
export function arrivalToPersonalPart(item,id,updated=new Date().toISOString()){
 if(!item||!legalId.test(item.id))throw Error("Select a recognized arrival.");
 return {
   id,name:item.name,
   category:item.category,
   kind:"mechanical",
   status:"Owned",
   quantity:item.quantity,
   manufacturer:item.manufacturer,
   partNumber:"SUNBURST kit No. "+item.kitNo,
   verification:"Not electrically tested",
   note:"Owner-confirmed new arrival "+item.acquiredDate+"; "+item.packageCount+". "+
     "Evidence: "+item.evidence+". "+
     "Potential workshop uses: "+item.uses.join("; ")+". "+
     "Safety: "+item.safety.join(" ")+
     " Contents and speed/mandrel fit are not individually verified.",
   sourceArrivalId:item.id,
   projects:[],
   requirementIds:[],
   test:{result:"Not tested"},
   updated
 };
}
export function ownerArrivalsHTML(collection,query="",personal=[]){
 if(!collection?.items)return '<div class="notice">New-arrivals list is not available in this build.</div>';
 const terms=String(query).toLowerCase().trim();
 const owned=new Set(personal.map(x=>x.sourceArrivalId).filter(Boolean));
 const rows=collection.items.filter(x=>!terms||JSON.stringify(x).toLowerCase().includes(terms));
 return '<section class="panel"><span class="eyebrow">OWNER-CONFIRMED · NEW ARRIVALS · OCT 24, 2026</span>'+
  '<h2>'+collection.items.length+' newly photographed workshop kit</h2>'+
  '<p>These are <strong>in addition to</strong> the 23 Rev 4 PDF reference entries and the 12 earlier reports. '+safe(collection.disclaimer)+'</p>'+
  '<p class="small muted">Original image uploads are not published on the public website. To keep private photos with your local inventory, attach them within your own McGruber workspace.</p></section>'+
  (rows.length?'<div class="component-grid">'+rows.map(x=>
   '<article class="panel component arrival-entry"><span class="eyebrow">'+safe(x.id)+' · '+safe(x.acquiredDate)+' · OWNER PHOTOGRAPH</span>'+
   '<h3>'+safe(x.name)+'</h3>'+
   '<div class="row wrap"><span class="pill">'+safe(x.quantity)+'</span><span class="pill">Kit '+safe(x.kitNo)+'</span></div>'+
   '<p>'+safe(x.packageCount)+'</p><dl><dt>Owner evidence</dt><dd>'+safe(x.evidence)+'</dd>'+
   '<dt>Visual condition</dt><dd>'+safe(x.condition)+'</dd><dt>Product markings</dt><dd>'+safe(x.marking)+'</dd></dl>'+
   '<details open><summary>Printed color / grit key ('+x.colorGrit.length+')</summary>'+
    '<ul>'+x.colorGrit.map(c=>'<li><strong>'+safe(c.color)+'</strong> — '+safe(c.label)+' ('+safe(c.abrasive)+')</li>').join("")+'</ul></details>'+
   '<details><summary>Accessories visible in kit ('+x.included.length+')</summary><ul>'+
    x.included.map(y=>'<li>'+safe(y)+'</li>').join("")+'</ul></details>'+
   '<details><summary>What we can make easier ('+x.uses.length+')</summary><ul>'+
    x.uses.map(y=>'<li>'+safe(y)+'</li>').join("")+'</ul></details>'+
   '<details><summary>Safety and limits before first use</summary><ul>'+
    [...x.compatibility,...x.safety].map(y=>'<li>'+safe(y)+'</li>').join("")+'</ul></details>'+
   '<p class="small muted">Rotary tool, mandrel and RPM compatibility are not verified. This is a workshop tool/consumable, not a circuit component or working sensor.</p>'+
   '<button data-import-arrival="'+safe(x.id)+'" type="button"'+(owned.has(x.id)?" disabled":"")+'>'+
    (owned.has(x.id)?"Already saved to My inventory":"Add this kit to My inventory")+'</button>'+
   '</article>').join("")+'</div>':
   '<div class="empty panel"><p>No arrivals match your search.</p></div>');
}
