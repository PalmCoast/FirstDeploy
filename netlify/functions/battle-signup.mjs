// POST /api/battle-signup: Bots vs Dots vs Muse signup (fields per signup-form spec).
// Stores one record per email (re-submitting updates it, so people can switch sides before kickoff).
// Production writes to the site store "battle-signups"; previews/drafts write to a deploy-scoped
// store so test entries never mix with real ones. Netlify Forms is off on this site (ignore_html_forms).
import { getStore, getDeployStore } from "@netlify/blobs";
import { createHash } from "node:crypto";

const SIDES = ["Bots", "Dots", "Muse"];
const TEAM = ["I have a team", "Solo - looking for a team", "Solo - building alone"];
const AGE = ["18+", "Under 18 - guardian consent"];
const s = (v, max) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", "x-robots-tag": "noindex" },
  });

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });
  let f;
  try {
    f = new URLSearchParams(await req.text());
  } catch {
    return json(400, { error: "Bad request" });
  }
  if (f.get("company")) return json(200, { ok: true, side: s(f.get("side"), 8) }); // honeypot: pretend success

  const rec = {
    name: s(f.get("name"), 120),
    email: s(f.get("email"), 200).toLowerCase(),
    x_handle: s(f.get("x_handle"), 40),
    side: s(f.get("side"), 8),
    team_status: s(f.get("team_status"), 40),
    team_name: s(f.get("team_name"), 80),
    teammates: s(f.get("teammates"), 300),
    idea: s(f.get("idea"), 500),
    age: s(f.get("age"), 40),
    rules: f.get("rules") === "yes",
    updates: f.get("updates") === "yes",
  };
  if (!rec.name || !rec.x_handle || !rec.idea) return json(400, { error: "Please fill in every required field." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rec.email)) return json(400, { error: "That email doesn't look right." });
  if (!SIDES.includes(rec.side)) return json(400, { error: "Please pick a side." });
  if (!TEAM.includes(rec.team_status)) return json(400, { error: "Please tell us if you have a team." });
  if (!AGE.includes(rec.age)) return json(400, { error: "Please confirm your age." });
  if (!rec.rules) return json(400, { error: "Please agree to the official rules." });
  if (rec.team_status === "I have a team" && !rec.team_name) return json(400, { error: "Please add your team name." });

  const prod = context?.deploy?.context === "production";
  const store = prod
    ? getStore({ name: "battle-signups", consistency: "strong" })
    : getDeployStore({ name: "battle-signups-preview", consistency: "strong" });
  const key = "r1/" + createHash("sha256").update(rec.email).digest("hex").slice(0, 32);
  const prev = await store.get(key, { type: "json" }).catch(() => null);
  const now = new Date().toISOString();
  await store.setJSON(key, { ...rec, created_at: prev?.created_at || now, updated_at: now });
  return json(200, { ok: true, side: rec.side, updated: Boolean(prev) });
};

export const config = { path: "/api/battle-signup", method: "POST" };
