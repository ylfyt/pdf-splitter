const t=location.pathname.split("/").slice(0,-1).join("/"),u=[t+"/_app/immutable/entry/app.DRRJC0Ob.js",t+"/_app/immutable/nodes/0.wWxXzi2a.js",t+"/_app/immutable/nodes/1.BnGRImV3.js",t+"/_app/immutable/nodes/2.Csxl3-cj.js",t+"/_app/immutable/assets/2.Bu2Ie2Re.css",t+"/_app/immutable/nodes/3.CcLHkFVV.js",t+"/_app/immutable/chunks/entry.CEV9rra0.js",t+"/_app/immutable/chunks/index.CkPSus7v.js",t+"/_app/immutable/chunks/index.fGjvP9ge.js",t+"/_app/immutable/chunks/scheduler.D-9INhcV.js",t+"/_app/immutable/chunks/theme.DkIrD5dx.js",t+"/_app/immutable/entry/start.BXtjw9Lv.js"],r=[t+"/.nojekyll",t+"/favicon.svg"],m="1709473352158",i=`cache-${m}`,o=[...u,...r.filter(e=>!e.includes(".nojekyll"))];self.addEventListener("install",e=>{const n=async()=>{await(await caches.open(i)).addAll(o)};e.waitUntil(n())});self.addEventListener("activate",e=>{const n=async()=>{for(const s of await caches.keys())s!==i&&await caches.delete(s)};e.waitUntil(n())});self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;const n=async()=>{const s=new URL(e.request.url),c=await caches.open(i);if(o.includes(s.pathname)){const a=await c.match(s.pathname);if(a)return a}try{const a=await fetch(e.request),l=s.protocol==="https:"||s.protocol==="http:",p=a.status===200;return l&&p&&c.put(e.request,a.clone()),a}catch{const a=await c.match(s.pathname);if(a)return a}return new Response("Req: Not found",{status:404})};e.respondWith(n())});self.addEventListener("message",e=>{e.data&&e.data.type==="SKIP_WAITING"&&self.skipWaiting()});