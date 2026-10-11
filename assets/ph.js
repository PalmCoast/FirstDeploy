// PostHog (project 598301, US cloud). The phc_ key is PostHog's public project
// token, made for browser code; it can only send events, not read data.
// Events:
//   cta_click: buy links (/go/*, buy.stripe.com), booking (calendly.com),
//              and any link with data-ph-cta (First Workflow buttons).
//   purchase:  /thanks or /workflow/thanks with a Stripe session_id, once per id.
// A visit with ?src=audit (or a webdriver/headless browser) is tagged audit=true.
(function () {
  try {
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset identify setPersonProperties group get_distinct_id getFeatureFlag isFeatureEnabled onFeatureFlags".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

    var q = new URLSearchParams(location.search);
    var audit = /^audit/i.test(q.get("src") || "") || sessionStorage.getItem("ph_audit") === "1" || navigator.webdriver === true || /HeadlessChrome/i.test(navigator.userAgent);
    if (audit) sessionStorage.setItem("ph_audit", "1");

    posthog.init("phc_y9BPZxQLpF7FviUKN6JSBqSUD7fcnwXuXzHzDQ8asLjv", {
      api_host: "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: true,
      autocapture: false,
      disable_session_recording: true
    });
    posthog.register({ site: location.hostname, audit: audit, project: "598301" });

    var kindOf = function (href) {
      if (/\/go\//.test(href) || /buy\.stripe\.com/.test(href) || /#TODO-STRIPE-FIRST-WORKFLOW/.test(href)) return "checkout";
      if (/calendly\.com/.test(href)) return "booking";
      return "";
    };
    document.addEventListener("click", function (ev) {
      var a = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
      if (!a) return;
      var href = a.href || "";
      var ph = a.getAttribute("data-ph-cta") || "";
      var kind = ph ? (/-nav$/.test(ph) ? "nav" : "checkout") : kindOf(href);
      if (!kind) return;
      var u;
      try { u = new URL(href, location.href); } catch (e) { return; }
      var m = u.pathname.match(/\/go\/([a-z0-9-]+)/i);
      posthog.capture("cta_click", {
        kind: kind,
        cta: ph || (m ? m[1] : kind === "booking" ? "calendly" : "stripe"),
        from: a.getAttribute("data-ph-from") || u.searchParams.get("from") || "",
        label: (a.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
        href: u.origin + u.pathname + u.hash,
        page: location.pathname
      }, { send_instantly: true, transport: "sendBeacon" });
    }, true);

    var sid = q.get("session_id") || "";
    var thanks = /^\/thanks(\.html)?\/?$/.test(location.pathname);
    var workflowThanks = /^\/workflow\/thanks(\.html)?\/?$/.test(location.pathname);
    if ((thanks || workflowThanks) && /^cs_(live|test)_[A-Za-z0-9]+$/.test(sid) && !localStorage.getItem("ph_purchase_" + sid)) {
      localStorage.setItem("ph_purchase_" + sid, "1");
      posthog.capture("purchase", {
        session_id: sid,
        livemode: sid.indexOf("cs_live_") === 0,
        offer: workflowThanks ? "first-workflow" : "first-deploy"
      });
    }
  } catch (e) {}
})();
