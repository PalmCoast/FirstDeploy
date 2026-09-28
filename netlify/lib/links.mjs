// First-party click-tracking map: /go/<name> -> exact Stripe Payment Link URL.
// Keep URLs byte-identical to what the site linked before; only tracking
// params (client_reference_id + utm_*) are appended at redirect time.
export const LINKS = {
  // consult.html ledger
  "consult-30": "https://buy.stripe.com/fZufZh92Qf9p5eB2XU2ZO1h", // AI Consult — 30 minutes, $75
  "consult-60": "https://buy.stripe.com/eVq9ATbaY6CT6iF7ea2ZO1g", // AI Consult — 1 hour, $150
  "consult-pack": "https://buy.stripe.com/7sY9ATenabXd7mJ7ea2ZO1i", // AI Consult — 10-hour pack deposit, $625
  // Main offer: First Deploy — $1,500 setup (one-time, first invoice) + $250/mo desk.
  // plink_1UKgGxFJWYd4pYuxOQm0QoYJ, redirects to https://firstdeploy.ai/thanks after payment.
  "start": "https://buy.stripe.com/14A00jfre3qH0YlfKG2ZO1v"
};

// Old names that should now land on another link (logged under the new name).
// /go/setup used to be the $5,000 "AI Deployment Sprint" link; it now goes to the main offer.
export const ALIASES = {
  "setup": "start"
};
