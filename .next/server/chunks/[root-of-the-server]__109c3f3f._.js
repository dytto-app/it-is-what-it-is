module.exports=[93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},69569,e=>{"use strict";var t=e.i(47909),a=e.i(74017),r=e.i(96250),n=e.i(59756),o=e.i(61916),s=e.i(74677),i=e.i(69741),l=e.i(16795),d=e.i(87718),u=e.i(95169),p=e.i(47587),c=e.i(66012),h=e.i(70101),m=e.i(26937),g=e.i(10372),x=e.i(93695);e.i(52474);var v=e.i(220),R=e.i(89171),b=e.i(44070);async function f(){let{data:e}=await b.supabaseAdmin.from("blog_posts").select("slug, title, excerpt, published_at").contains("tags",["back-log"]).eq("status","published").order("published_at",{ascending:!1}).limit(20),t=(e??[]).map(e=>`- [${e.title}](https://back-log.com/blog/${e.slug}) — ${e.excerpt??""}`).join("\n"),a=`# Back-log

## What is Back-log?

Back-log is a mobile app that tracks how much money you earn during bathroom breaks at work.
It's a social game with Animal Crossing-style vibes — you earn money, visit friends' bathrooms,
and unlock achievements like "Toilet Emperor."

The core insight: salaried and hourly employees are paid during bathroom breaks.
Back-log makes this quantifiable, gamified, and weirdly fun.

## Key Features

- **Break Earnings Tracker** — Real-time earnings calculator based on your salary
- **Social Bathrooms** — Visit friends' bathrooms, rate them, leave reviews
- **Achievements** — Toilet Emperor, Deep Thinker, Marathon Runner, and more
- **Lifetime Earnings** — See your all-time break earnings aggregated
- **Leaderboards** — Compete with coworkers (optionally)

## Tagline

"We built an app that pays you to poop."

## Download

Available on the App Store: https://apps.apple.com (link TBD)

## Website

https://back-log.com

## Blog

https://back-log.com/blog

${t.length>0?`## Recent Articles

${t}`:""}

## About

Back-log was built by developers who spent too much time on their phones during work breaks
and decided to make it productive. Or at least, financially quantifiable.
`;return new R.NextResponse(a,{headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"public, s-maxage=3600, stale-while-revalidate=86400"}})}e.s(["GET",()=>f,"revalidate",0,3600],30214);var w=e.i(30214);let y=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/llms.txt/route",pathname:"/llms.txt",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/llms.txt/route.ts",nextConfigOutput:"",userland:w}),{workAsyncStorage:k,workUnitAsyncStorage:E,serverHooks:C}=y;function A(){return(0,r.patchFetch)({workAsyncStorage:k,workUnitAsyncStorage:E})}async function T(e,t,r){y.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let R="/llms.txt/route";R=R.replace(/\/index$/,"")||"/";let b=await y.prepare(e,t,{srcPage:R,multiZoneDraftMode:!1});if(!b)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:f,params:w,nextConfig:k,parsedUrl:E,isDraftMode:C,prerenderManifest:A,routerServerContext:T,isOnDemandRevalidate:N,revalidateOnlyGenerated:q,resolvedPathname:P,clientReferenceManifest:_,serverActionsManifest:O}=b,S=(0,i.normalizeAppPath)(R),j=!!(A.dynamicRoutes[S]||A.routes[P]),H=async()=>((null==T?void 0:T.render404)?await T.render404(e,t,E,!1):t.end("This page could not be found"),null);if(j&&!C){let e=!!A.routes[P],t=A.dynamicRoutes[S];if(t&&!1===t.fallback&&!e){if(k.experimental.adapterPath)return await H();throw new x.NoFallbackError}}let D=null;!j||y.isDev||C||(D="/index"===(D=P)?"/":D);let I=!0===y.isDev||!j,U=j&&!I;O&&_&&(0,s.setManifestsSingleton)({page:R,clientReferenceManifest:_,serverActionsManifest:O});let B=e.method||"GET",$=(0,o.getTracer)(),M=$.getActiveScopeSpan(),F={params:w,prerenderManifest:A,renderOpts:{experimental:{authInterrupts:!!k.experimental.authInterrupts},cacheComponents:!!k.cacheComponents,supportsDynamicResponse:I,incrementalCache:(0,n.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:k.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>y.onRequestError(e,t,r,n,T)},sharedContext:{buildId:f}},K=new l.NodeNextRequest(e),L=new l.NodeNextResponse(t),W=d.NextRequestAdapter.fromNodeNextRequest(K,(0,d.signalFromNodeResponse)(t));try{let s=async e=>y.handle(W,F).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=$.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${B} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t)}else e.updateName(`${B} ${R}`)}),i=!!(0,n.getRequestMeta)(e,"minimalMode"),l=async n=>{var o,l;let d=async({previousCacheEntry:a})=>{try{if(!i&&N&&q&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let o=await s(n);e.fetchMetrics=F.renderOpts.fetchMetrics;let l=F.renderOpts.pendingWaitUntil;l&&r.waitUntil&&(r.waitUntil(l),l=void 0);let d=F.renderOpts.collectedTags;if(!j)return await (0,c.sendResponse)(K,L,o,F.renderOpts.pendingWaitUntil),null;{let e=await o.blob(),t=(0,h.toNodeOutgoingHttpHeaders)(o.headers);d&&(t[g.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==F.renderOpts.collectedRevalidate&&!(F.renderOpts.collectedRevalidate>=g.INFINITE_CACHE)&&F.renderOpts.collectedRevalidate,r=void 0===F.renderOpts.collectedExpire||F.renderOpts.collectedExpire>=g.INFINITE_CACHE?void 0:F.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:o.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await y.onRequestError(e,t,{routerKind:"App Router",routePath:R,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:U,isOnDemandRevalidate:N})},!1,T),t}},u=await y.handleResponse({req:e,nextConfig:k,cacheKey:D,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:N,revalidateOnlyGenerated:q,responseGenerator:d,waitUntil:r.waitUntil,isMinimalMode:i});if(!j)return null;if((null==u||null==(o=u.value)?void 0:o.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==u||null==(l=u.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});i||t.setHeader("x-nextjs-cache",N?"REVALIDATED":u.isMiss?"MISS":u.isStale?"STALE":"HIT"),C&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let x=(0,h.fromNodeOutgoingHttpHeaders)(u.value.headers);return i&&j||x.delete(g.NEXT_CACHE_TAGS_HEADER),!u.cacheControl||t.getHeader("Cache-Control")||x.get("Cache-Control")||x.set("Cache-Control",(0,m.getCacheControlHeader)(u.cacheControl)),await (0,c.sendResponse)(K,L,new Response(u.value.body,{headers:x,status:u.value.status||200})),null};M?await l(M):await $.withPropagatedContext(e.headers,()=>$.trace(u.BaseServerSpan.handleRequest,{spanName:`${B} ${R}`,kind:o.SpanKind.SERVER,attributes:{"http.method":B,"http.target":e.url}},l))}catch(t){if(t instanceof x.NoFallbackError||await y.onRequestError(e,t,{routerKind:"App Router",routePath:S,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:U,isOnDemandRevalidate:N})},!1,T),j)throw t;return await (0,c.sendResponse)(K,L,new Response(null,{status:500})),null}}e.s(["handler",()=>T,"patchFetch",()=>A,"routeModule",()=>y,"serverHooks",()=>C,"workAsyncStorage",()=>k,"workUnitAsyncStorage",()=>E],69569)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__109c3f3f._.js.map