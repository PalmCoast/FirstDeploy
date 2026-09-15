#!/usr/bin/env node
/**
 * Fail if collage / banned public-copy strings appear in firstdeploy HTML.
 * Sister-brand names are allowed only on hive.html.
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
  /indexme\.lol/i,
  /claudefarm/i,
  /send-tonight/i,
  /ratetrap/i,
  /getclaimcash/i,
  /stateside-jobs/i,
  /clawlock/i,
  /bot-lock/i,
  /hire-daniel-graham/i
];

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
}

const home = readFileSync(join(root, "index.html"), "utf8");
if (!/\$1,500/.test(home)) failures.push("index.html: missing setup $1,500");
if (!/\$250/.test(home)) failures.push("index.html: missing monthly $250");
if (/buy\.stripe\.com/.test(home)) failures.push("index.html: duplicate pay script");

if (failures.length) {
  console.error("check-clean failed:");
  for (const line of failures) console.error("  -", line);
  process.exit(1);
}

console.log(`check-clean ok (${files.length} HTML files)`);
