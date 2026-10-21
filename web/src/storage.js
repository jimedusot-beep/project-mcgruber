import {newId} from './id.js';
import {freshWorkspace,validateWorkspace} from './core.js';
let opening;
export function database(){
  if(!opening)opening=new Promise((resolve,reject)=>{
    const request=indexedDB.open('mcgruber-lab',1);
    request.onupgradeneeded=()=>{for(const n of ['workspace','history','media'])request.result.createObjectStore(n,{keyPath:'id'});};
    request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>db.close();resolve(db);};
    request.onerror=()=>{opening=null;reject(Error('Local storage unavailable: '+request.error?.message));};
    request.onblocked=()=>reject(Error('Close other McGruber tabs to upgrade browser storage.'));
  });return opening;
}
export async function read(store,key){const db=await database();return new Promise((resolve,reject)=>{const r=db.transaction(store).objectStore(store).get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function all(store){const db=await database();return new Promise((resolve,reject)=>{const r=db.transaction(store).objectStore(store).getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function put(store,value){const db=await database();return new Promise((resolve,reject)=>{const t=db.transaction(store,'readwrite');t.objectStore(store).put(value);t.oncomplete=()=>resolve(value);t.onerror=t.onabort=()=>reject(Error('Save failed. Check browser storage space; export a backup.'));});}
export async function load(){const w=await read('workspace','current');return w?validateWorkspace(w):freshWorkspace();}
let queue=Promise.resolve();
export function save(workspace){
  const snapshot=structuredClone(validateWorkspace(workspace));snapshot.updated=new Date().toISOString();
  const operation=queue.catch(()=>{}).then(async()=>{
    const history=await all('history'),db=await database();
    await new Promise((resolve,reject)=>{const tx=db.transaction(['workspace','history'],'readwrite');tx.objectStore('workspace').put(snapshot);tx.objectStore('history').put({...snapshot,id:newId()});for(const r of history.sort((a,b)=>b.updated.localeCompare(a.updated)).slice(9))tx.objectStore('history').delete(r.id);tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(Error('Autosave failed. Export a backup before closing this tab.'));});
    return snapshot.updated;
  });queue=operation;return operation;
}
export async function addMedia(file){
  if(!/^(image\/(jpeg|png|webp|gif)|video\/(mp4|quicktime|webm))$/.test(file.type)||file.size>12*1024*1024)throw Error('Use a JPG, PNG, WebP, GIF, MP4, MOV or WebM under 12 MB.');
  const record={id:newId(),name:file.name,type:file.type,blob:file,created:new Date().toISOString()};await put('media',record);return record.id;
}
export async function backup(workspace){
  const ids=new Set([...workspace.records.flatMap(r=>r.attachments),...(workspace.draftRecord?.attachments||[])]);
  const assets=(await all('media')).filter(a=>ids.has(a.id));
  if(assets.reduce((sum,a)=>sum+a.blob.size,0)>60*1024*1024)throw Error('Media exceeds the 60 MB backup limit. Export or remove large attachments first.');
  const media=await Promise.all(assets.map(async a=>({id:a.id,name:a.name,type:a.type,data:await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(a.blob);})})));
  return JSON.stringify({application:'mcgruber-lab',version:1,workspace:validateWorkspace(workspace),media});
}
export async function restore(text){
  if(text.length>100*1024*1024)throw Error('Backup exceeds 100 MB.');
  const data=JSON.parse(text);if(data.application!=='mcgruber-lab'||data.version!==1||!Array.isArray(data.media))throw Error('Not a supported McGruber backup.');
  const workspace=validateWorkspace(data.workspace),ids=new Set();
  const media=data.media.map(a=>{
    if(typeof a.id!=='string'||typeof a.name!=='string'||typeof a.type!=='string'||!a.data?.startsWith('data:'+a.type+';base64,')||!/^(image\/(jpeg|png|webp|gif)|video\/(mp4|quicktime|webm))$/.test(a.type))throw Error('Invalid backup media.');
    const raw=atob(a.data.split(',')[1]);if(raw.length>12*1024*1024||ids.has(a.id))throw Error('Invalid media size or duplicate ID.');ids.add(a.id);return {id:a.id,name:a.name,type:a.type,blob:new Blob([Uint8Array.from(raw,c=>c.charCodeAt(0))],{type:a.type})};
  });
  if([...workspace.records.flatMap(r=>r.attachments),...(workspace.draftRecord?.attachments||[])].some(a=>!ids.has(a)))throw Error('Backup is missing an experiment attachment.');
  const db=await database();await new Promise((resolve,reject)=>{const tx=db.transaction(['workspace','media','history'],'readwrite');tx.objectStore('workspace').put({...workspace,updated:new Date().toISOString()});for(const a of media)tx.objectStore('media').put(a);tx.objectStore('history').put({...workspace,id:newId(),updated:new Date().toISOString()});tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(Error('Restore failed; existing workspace retained.'));});
  return workspace;
}
export function download(data,name,type='application/json'){const blob=data instanceof Blob?data:new Blob([data],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
