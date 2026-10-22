const DB = "https://goatweb-8cbaa-default-rtdb.firebaseio.com/panel/scripts/";
const NS = { "Cache-Control": "no-store" };

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const id = (url.searchParams.get("id") || "").replace(/[^A-Za-z0-9_-]/g, "");
  const v = url.searchParams.get("v") || "";
  if (!id || !v) return new Response("bad request", { status: 400, headers: NS });

  const cache = caches.default;
  const key = new Request(url.origin + "/api/script?id=" + id + "&v=" + encodeURIComponent(v));
  const hit = await cache.match(key);
  if (hit) return hit;

  try {
    const a = await fetch(DB + id + "/at.json");
    if (!a.ok) throw new Error("at " + a.status);
    const at = await a.json();
    if (String(at) !== v) return new Response("version changed", { status: 409, headers: NS });

    const r = await fetch(DB + id + ".json");
    if (!r.ok) throw new Error("script " + r.status);
    const j = await r.json();
    if (!j || !j.html) return new Response("not found", { status: 404, headers: NS });

    const res = new Response(JSON.stringify(j), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
    context.waitUntil(cache.put(key, res.clone()));
    return res;
  } catch (e) {
    return new Response("error", { status: 502, headers: NS });
  }
}
