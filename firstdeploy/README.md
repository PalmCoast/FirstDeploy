# First Deploy (clean publish tree)

Static one-offer site for [firstdeploy.ai](https://firstdeploy.ai).

Netlify site `first-deploy-ai` (id `59a673be-0880-43e0-a443-756e22cbf4ec`).

## Offer

After-hours voice + live apps + one operator.

- Setup **$1,500** — live this week or they don’t pay
- Then **$250/month**
- Consult lives on `/consult`
- Sister sites listed once on `/hive`

## Deploy

```bash
node firstdeploy/scripts/check-clean.mjs
netlify deploy --prod --dir firstdeploy --site 59a673be-0880-43e0-a443-756e22cbf4ec
```

`netlify.toml` in this folder publishes `.` (this directory) and runs `check-clean.mjs` as the build command when Netlify builds from this base.

## Guardrails

- `assets/site.js` strips HiveAds / JobProof / Flick inject nodes if they sneak back
- CSP in `netlify.toml` blocks those third-party inject scripts
- `scripts/check-clean.mjs` fails the build if collage strings or stale prices appear in HTML
