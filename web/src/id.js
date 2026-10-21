// randomUUID is HTTPS-only in browsers; getRandomValues also works on local HTTP previews.
export function newId(source=globalThis.crypto){
  if(typeof source?.randomUUID==='function')return source.randomUUID();
  if(typeof source?.getRandomValues!=='function')throw Error('A browser cryptographic random source is required to save records.');
  const b=source.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;
  const hex=Array.from(b,n=>n.toString(16).padStart(2,'0')).join('');return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
