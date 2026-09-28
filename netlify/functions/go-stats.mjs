import { getStore } from "@netlify/blobs";
import { timingSafeEqual } from "node:crypto";
import { LINKS } from "../lib/links.mjs";

function ok(token) {
  const want = process.env.GO_STATS_TOKEN || "";
  if (!want || !token) return false;
  const a = Buffer.from(String(token));
  const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async (req) => {
  const url = new URL(req.url);
  const headers = { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" };
  if (!ok(url.searchParams.get("token"))) {
    return new Response("Not found", { status: 404, headers });
  }
  const days = Math.max(0, Number(url.searchParams.get("days") || 0)); // 0 = all time
  const since = days ? new Date(Date.now() - days * 86400000).toISOString() : "";
  const recentN = Math.min(200, Math.max(0, Number(url.searchParams.get("recent") || 20)));

  const store = getStore({ name: "go-clicks", consistency: "strong" });
  const keys = [];
  for await (const page of store.list({ prefix: "ev/", paginate: true })) {
    for (const b of page.blobs) keys.push(b.key);
  }

  const links = {};
  for (const n of Object.keys(LINKS)) links[n] = { human: 0, bot: 0, test: 0, total: 0, by_from: {}, by_day: {} };
  const parsed = [];
  for (const key of keys) {
    // ev/<name>/<day>/<ts>_<kind>_<from>_<rand>
    const [, name, day, rest] = key.split("/");
    const [ts, kind, from] = rest.split("_");
    if (since && ts < since) continue;
    parsed.push({ key, ts });
    const l = (links[name] ||= { human: 0, bot: 0, test: 0, total: 0, by_from: {}, by_day: {} });
    l[kind] = (l[kind] || 0) + 1;
    l.total++;
    if (kind === "human") {
      l.by_from[from] = (l.by_from[from] || 0) + 1;
      l.by_day[day] = (l.by_day[day] || 0) + 1;
    }
  }
  parsed.sort((a, b) => (a.ts < b.ts ? 1 : -1));
  const recent = [];
  for (const p of parsed.slice(0, recentN)) {
    const ev = await store.get(p.key, { type: "json" });
    if (ev) recent.push(ev);
  }

  const out = { generated_at: new Date().toISOString(), window_days: days || "all", links, recent };
  if (url.searchParams.get("format") === "text") {
    const lines = [`First Deploy /go clicks (${days ? "last " + days + " days" : "all time"}) — ${out.generated_at}`, ""];
    lines.push("link            human   bot  test  total  top sources (human)");
    for (const [n, l] of Object.entries(links)) {
      const top = Object.entries(l.by_from).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => `${k}:${v}`).join(" ");
      lines.push(`${n.padEnd(14)} ${String(l.human).padStart(6)} ${String(l.bot).padStart(5)} ${String(l.test).padStart(5)} ${String(l.total).padStart(6)}  ${top}`);
    }
    lines.push("", "recent:");
    for (const e of recent) lines.push(`${e.ts}  ${e.name.padEnd(13)} ${(e.test ? "test" : e.bot ? "bot" : "human").padEnd(5)} from=${e.from} ref=${e.referer || "-"} ua=${(e.ua || "").slice(0, 80)}`);
    return new Response(lines.join("\n") + "\n", { headers: { ...headers, "content-type": "text/plain; charset=utf-8" } });
  }
  return Response.json(out, { headers });
};

export const config = { path: "/go-stats" };
