/* SmartOMR Google Sheets 2.1. Cache only app shell; NEVER cache API or school data. */
const CACHE='smartomr-sheets-shell-2.2.0';
const STATIC=['./','./index.html','./manifest.webmanifest','./js/omr-auto.js','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(Promise.all([
 caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('smartomr-')&&k!==CACHE).map(k=>caches.delete(k)))),
 self.clients.claim()
])));
self.addEventListener('fetch',e=>{
 const request=e.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
 e.respondWith(fetch(request).then(res=>{
  if(res.ok&&res.type==='basic'&&(url.pathname==='/'||url.pathname.endsWith('/index.html')||STATIC.some(x=>url.pathname.endsWith(x.slice(1))))){
   const copy=res.clone();caches.open(CACHE).then(c=>c.put(request,copy)).catch(()=>{});
  }
  return res;
 }).catch(()=>caches.match(request).then(c=>c||(request.mode==='navigate'?caches.match('./index.html'):Response.error()))));
});
