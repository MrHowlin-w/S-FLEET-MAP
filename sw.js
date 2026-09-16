// S³ Fleet Map — service worker (hors ligne basique)
const CACHE='s3-fleet-map-v1';
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  // page de l'appli : réseau d'abord (toujours la dernière version), cache si hors ligne
  if(url.origin===location.origin){
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));return r;}).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html'))));
    return;
  }
  // bibliothèques et polices : cache d'abord
  if(/cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(url.host)){
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok||r.type==='opaque'){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));}return r;})));
  }
});
