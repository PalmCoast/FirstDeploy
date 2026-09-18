#!/usr/bin/env node
/**
 * Fail if collage / banned public-copy strings appear in firstdeploy HTML.
 * Sister-brand names are allowed only on hive.html, except IndexMe
 * (approved optional footer money destination).
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name === "node_modules" || name.name === ".git") continue;
      out.push(...htmlFiles(full));
    } else if (name.name.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

const collage = [
  /hiveads/i,
  /jobproof-strip/i,
  /flick-strip/i,
  /hive-notes/i,
  /open comments/i,
  /hive-toy/i,
  /fold-companion/i,
  /you do not get/i,
  /14 deployed/i,
  /14 live apps/i,
  /\$70k\b/i,
  /\$70,000/,
  /flick-note/i
];

const oldOffer = [
  /\$2,500/,
  /\$2500\b/,
  /2,500\.00/,
  /\$1,500\/month/,
  /\$1,500 per month/
];

const sisterOffHive = [
  /useflick/i,
  /jobproof/i,
  /claudefarm/i,
  /send-tonight/i,
  /ratetrap/i,
  /getclaimcash/i,
  /stateside-jobs/i,
  /clawlock/i,
  /bot-lock/i,
  /hire-daniel-graham/i
];

const footerMoney = [
  "https://firstdeploy.ai/#check",
  "https://calendly.com/coltsinsider/30min",
  "https://firstdeploy.ai/consult",
  "https://buy.stripe.com/aFacN50wkbXddL77ea2ZO0P",
  "https://indexme.lol/"
];

const allowedStripe = new Set([
  "https://buy.stripe.com/aFacN50wkbXddL77ea2ZO0P"
]);

const files = htmlFiles(root);
const failures = [];

for (const file of files) {
  const rel = relative(root, file);
  const html = readFileSync(file, "utf8");
  const base = rel.split("/").pop();

  for (const re of collage) {
    if (re.test(html)) failures.push(`${rel}: collage marker ${re}`);
  }
  for (const re of oldOffer) {
    if (re.test(html)) failures.push(`${rel}: stale price ${re}`);
  }
  if (base !== "hive.html") {
    for (const re of sisterOffHive) {
      if (re.test(html)) failures.push(`${rel}: sister brand off /hive ${re}`);
    }
  }

  const footers = html.match(/<footer\b[\s\S]*?<\/footer>/gi) || [];
  for (const footer of footers) {
    if (/href\s*=\s*["'][^"']*netlify\.app/i.test(footer)) {
      failures.push(`${rel}: netlify.app href in footer`);
    }
  }
}

const home = readFileSync(join(root, "index.html"), "utf8");
if (!/\$1,500/.test(home)) failures.push("index.html: missing setup $1,500");
if (!/\$250/.test(home)) failures.push("index.html: missing monthly $250");
if (/<script\b[^>]*buy\.stripe\.com/i.test(home)) {
  failures.push("index.html: stripe pay script");
}
const homeStripe = [...home.matchAll(/https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+/g)].map((m) => m[0]);
for (const url of new Set(homeStripe)) {
  if (!allowedStripe.has(url)) failures.push(`index.html: unexpected stripe url ${url}`);
}

const homeFooter = (home.match(/<footer\b[\s\S]*?<\/footer>/i) || [""])[0];
for (const url of footerMoney) {
  if (!homeFooter.includes(`href="${url}"`) && !homeFooter.includes(`href='${url}'`)) {
    failures.push(`index.html: missing footer money link ${url}`);
  }
}
const moneyHrefs = [...homeFooter.matchAll(/href\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);
const moneyOnly = moneyHrefs.filter((href) =>
  footerMoney.includes(href) || /buy\.stripe\.com|calendly\.com|indexme\.lol|infrastructure\.agenthiveinc\.com/i.test(href)
);
if (moneyOnly.length > 5) {
  failures.push(`index.html: more than 5 money links in footer (${moneyOnly.length})`);
}

if (failures.length) {
  console.error("check-clean failed:");
  for (const line of failures) console.error("  -", line);
  process.exit(1);
}

console.log(`check-clean ok (${files.length} HTML files)`);
