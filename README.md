# First Deploy

Marketing site for https://firstdeploy.ai

**Clean publish tree:** [`firstdeploy/`](firstdeploy/). One offer page. Setup $1,500 (live this week or they don’t pay), then $250/month. Consult on `/consult`. Sister sites only on `/hive`.

```bash
node firstdeploy/scripts/check-clean.mjs
netlify deploy --prod --dir firstdeploy --site 59a673be-0880-43e0-a443-756e22cbf4ec
```

Netlify site `first-deploy-ai` (id `59a673be-0880-43e0-a443-756e22cbf4ec`). See `firstdeploy/README.md` for the page list and guards.
