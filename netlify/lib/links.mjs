// First-party click-tracking map: /go/<name> -> exact Stripe Payment Link URL.
// Keep URLs byte-identical to what the site linked before; only tracking
// params (client_reference_id + utm_*) are appended at redirect time.
export const LINKS = {
  // consult.html ledger
  "consult-30": "https://buy.stripe.com/fZufZh92Qf9p5eB2XU2ZO1h", // AI Consult — 30 minutes, $75
  "consult-60": "https://buy.stripe.com/eVq9ATbaY6CT6iF7ea2ZO1g", // AI Consult — 1 hour, $150
  "consult-pack": "https://buy.stripe.com/7sY9ATenabXd7mJ7ea2ZO1i", // AI Consult — 10-hour pack deposit, $625
  // Main First Deploy link (restored 2026-10-02, approved by Daniel): $1,500 setup
  // (price_1UKgGsFJWYd4pYuxGVUF8AxQ) + $250/mo desk (price_1UKgGsFJWYd4pYuxJ25joiFC),
  // $1,750 first invoice. plink_1UKgGxFJWYd4pYuxOQm0QoYJ, redirects to
  // https://firstdeploy.ai/thanks after payment. The link must be re-activated in Stripe
  // BEFORE this ships (see checkout-fixes-2026-10-02/stripe-plan.md, fix 1).
  // (The one-time $1,750 link plink_1ULRclFJWYd4pYuxDIe2rgO0 /
  // https://buy.stripe.com/00w8wP3Iw7GX9uR5622ZO1x is no longer linked from the site.)
  "start": "https://buy.stripe.com/14A00jfre3qH0YlfKG2ZO1v",
  // 50% deposit: $875 one-time (half of the $1,750 first invoice). plink_1ULPTDFJWYd4pYux3UzwCLK5,
  // redirects to https://firstdeploy.ai/thanks after payment.
  "deposit": "https://buy.stripe.com/9B68wP92Qe5layV8ie2ZO1w"
};

// Old names that should now land on another link (logged under the new name).
// /go/setup used to be the $5,000 "AI Deployment Sprint" link; it now goes to the main offer.
export const ALIASES = {
  "setup": "start"
};
