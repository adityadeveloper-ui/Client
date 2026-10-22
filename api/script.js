// Vercel function: serves one script from Firebase and lets Vercel's CDN cache it per version.
const DB = "https://wizard-web-fadd8-default-rtdb.firebaseio.com/panel/scripts/";

module.exports = async (req, res) => {
  const id = String((req.query && req.query.id) || "").replace(/[^A-Za-z0-9_-]/g, "");
  const v = String((req.query && req.query.v) || "");
  if (!id || !v) return res.status(400).send("bad request");
  try {
    // tiny check: only the current version may be cached
    const a = await fetch(DB + id + "/at.json");
    if (!a.ok) throw new Error("at " + a.status);
    const at = await a.json();
    if (String(at) !== v) {
      res.setHeader("Cache-Control", "no-store");
      return res.status(409).send("version changed");
    }
    const r = await fetch(DB + id + ".json");
    if (!r.ok) throw new Error("script " + r.status);
    const j = await r.json();
    if (!j || !j.html) {
      res.setHeader("Cache-Control", "no-store");
      return res.status(404).send("not found");
    }
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=31536000, s-maxage=31536000, immutable");
    return res.status(200).send(JSON.stringify(j));
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(502).send("error");
  }
};
