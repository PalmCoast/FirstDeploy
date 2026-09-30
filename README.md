# First Deploy

Marketing site for https://firstdeploy.ai

**Publish tree:** the repo root (deployed with the Netlify CLI). The old `firstdeploy/` copy is stale and is 301-redirected to `/` in netlify.toml; `README.md` is blocked (404). One offer page. Setup $1,750 (50% deposit to start, live this week on a written plan), then $250/month from go-live. Consult on `/consult`. Sister sites only on `/hive`.

```bash
node firstdeploy/scripts/check-clean.mjs
netlify deploy --prod --dir . --site 59a673be-0880-43e0-a443-756e22cbf4ec
```

Netlify site `first-deploy-ai` (id `59a673be-0880-43e0-a443-756e22cbf4ec`). See `firstdeploy/README.md` for the page list and guards.
