/* SmartOMR - PWA app shell only. OCR is downloaded from the external CDN and is NOT cached. */
const CACHE = 'smartomr-shell-1.0.0';
const ASSETS = ['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./HUONG_DAN_CAI_DAT.html','./Danh_sach_HS_mau.csv'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(Promise.all([
  caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('smartomr-shell-') && k !== CACHE).map(k => caches.delete(k)))),
  self.clients.claim()
])));
self.addEventListener('fetch', e => {
  const request=e.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  e.respondWith(fetch(request).then(response=>{
    if(response.ok && response.type==='basic') { const copy=response.clone();caches.open(CACHE).then(c=>c.put(request,copy)).catch(()=>{}); }
    return response;
  }).catch(()=>caches.match(request).then(c=>c || (request.mode==='navigate' ? caches.match('./index.html') : Response.error()))));
});
