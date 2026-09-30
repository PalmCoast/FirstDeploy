// Ad-source passthrough: remembers where the visitor landed from (e.g. ?from=gads,
// or utm_source=google&utm_medium=cpc / gclid) for this browser session and adds
// it as &src=<tag> to /go/* checkout links. /go tags Stripe client_reference_id
// as fd_<src>_<button>_<link>, e.g. fd_gads_pricing_deposit.
(function () {
  try {
    var clean = function (s) { return String(s || "").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 24); };
    var q = new URLSearchParams(location.search), src = "";
    var us = (q.get("utm_source") || "").toLowerCase(), um = (q.get("utm_medium") || "").toLowerCase();
    if (q.get("gclid") || q.get("gbraid") || q.get("wbraid") || (us === "google" && /cpc|ppc|paid/.test(um))) src = "gads";
    else if (q.get("src")) src = clean(q.get("src"));
    else if (q.get("from") && !/^\/go\//.test(location.pathname)) src = clean(q.get("from"));
    else if (us) src = clean(us + (um ? "-" + um : ""));
    if (src) sessionStorage.setItem("fd_src", src); else src = sessionStorage.getItem("fd_src") || "";
    if (!src) return;
    var links = document.querySelectorAll('a[href^="/go/"], a[href^="https://firstdeploy.ai/go/"]');
    for (var i = 0; i < links.length; i++) {
      var u = new URL(links[i].getAttribute("href"), location.origin);
      if (!u.searchParams.get("src")) { u.searchParams.set("src", src); links[i].setAttribute("href", u.pathname + u.search); }
    }
  } catch (e) {}
})();
