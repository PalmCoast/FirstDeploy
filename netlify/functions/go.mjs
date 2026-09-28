import { getStore } from "@netlify/blobs";
import { LINKS, ALIASES } from "../lib/links.mjs";

const BOT_RE =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|quora link|whatsapp|telegram|discord|skype|curl|wget|python|httpx|aiohttp|go-http|java\/|okhttp|axios|node-fetch|undici|headless|phantom|puppeteer|playwright|lighthouse|pagespeed|monitor|uptime|scan|check|validator|feed|fetch|archiver|semrush|ahrefs|mj12|dotbot|petalbot|bytespider|gptbot|claude|perplexity|chatgpt|oai-search|google-extended|bingpreview/i;
const TEST_RE = /fd-clicktest/i;

const clean = (s, max = 40) =>
  String(s || "").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, max);

function fromPage(url, referer) {
  const q = clean(url.searchParams.get("from"));
  if (q) return q;
  try {
    const r = new URL(referer);
    if (/(^|\.)firstdeploy\.ai$/i.test(r.hostname) || /netlify\.app$/i.test(r.hostname)) {
      const p = clean(r.pathname.replace(/\.html$/, "").replace(/^\/+|\/+$/g, "").replace(/\//g, "-"));
      return p || "home";
    }
    return clean("ext-" + r.hostname);
  } catch {
    return "direct";
  }
}

export default async (req, context) => {
  const url = new URL(req.url);
  const asked = clean(context.params?.name || url.pathname.split("/").pop(), 60);
  const name = ALIASES[asked] || asked;
  const target = LINKS[name];
  if (!target) {
    return new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });
  }

  const referer = req.headers.get("referer") || "";
  const ua = req.headers.get("user-agent") || "";
  const from = fromPage(url, referer);
  const test = TEST_RE.test(ua);
  const bot = !test && (!ua || BOT_RE.test(ua));
  const kind = test ? "test" : bot ? "bot" : "human";

  const dest = new URL(target);
  const ref = `fd_${from}_${name}`.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 200);
  dest.searchParams.set("client_reference_id", ref);
  dest.searchParams.set("utm_source", "firstdeploy.ai");
  dest.searchParams.set("utm_medium", "site");
  dest.searchParams.set("utm_campaign", name);
  dest.searchParams.set("utm_content", from);

  const prefetch = /prefetch|prerender/i.test(
    (req.headers.get("sec-purpose") || "") + (req.headers.get("purpose") || "") + (req.headers.get("x-moz") || "")
  );

  if (req.method === "GET" && !prefetch) {
    const now = new Date();
    const ts = now.toISOString();
    const rand = Math.random().toString(36).slice(2, 8);
    const key = `ev/${name}/${ts.slice(0, 10)}/${ts}_${kind}_${from}_${rand}`;
    const event = {
      name,
      from,
      referer: referer.slice(0, 500),
      ts,
      ua: ua.slice(0, 400),
      bot,
      test,
      country: context.geo?.country?.code || null,
      target
    };
    try {
      const store = getStore({ name: "go-clicks", consistency: "strong" });
      const write = store.setJSON(key, event);
      if (context.waitUntil) context.waitUntil(write.catch((e) => console.error("go: blob write failed", e)));
      else await write;
    } catch (e) {
      console.error("go: blob write failed", e);
    }
  }

  return new Response(null, {
    status: 302,
    headers: {
      location: dest.toString(),
      "cache-control": "no-store, max-age=0",
      "x-robots-tag": "noindex, nofollow"
    }
  });
};

export const config = { path: "/go/:name", method: ["GET", "HEAD"] };
