// Vercel serverless function: serves a shop script from Firebase through Vercel's CDN
// (edge-cached and compressed), so first-time visitors do not download it from a far-away database.
module.exports = async (req, res) => {
  const id = String((req.query && req.query.id) || "").replace(/[^A-Za-z0-9_-]/g, "");
  if (!id) { res.status(400).end(); return; }
  try {
    const r = await fetch("https://wizard-web-fadd8-default-rtdb.firebaseio.com/panel/scripts/" + encodeURIComponent(id) + ".json");
    if (!r.ok) throw new Error("upstream " + r.status);
    const t = await r.text();
    if (!t || t === "null") { res.status(404).end(); return; }
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600");
    res.status(200).send(t);
  } catch (e) {
    res.status(502).end();
  }
};
