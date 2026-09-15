/* First Deploy — strip collage injects if any sneak back */
(function () {
  var SELECTORS = [
    ".hiveads",
    "#hiveads",
    "[id*='hiveads']",
    "[class*='hiveads']",
    "#jobproof-strip",
    ".jobproof-strip",
    "[id*='jobproof-strip']",
    "[class*='jobproof-strip']",
    "#flick-strip",
    ".flick-strip",
    "[id*='flick-strip']",
    "[class*='flick-strip']",
    "#hive-notes",
    ".hive-notes",
    "[id*='hive-notes']",
    "[class*='hive-notes']",
    "#fold-companion-strip",
    ".hive-toy",
    "[class*='hive-toy']",
    "[id*='hive-toy']",
    "[src*='hiveads.netlify.app']",
    "[src*='firstdeploy-pay.netlify.app/footer']",
    "script[src*='hiveads']",
    "script[src*='firstdeploy-pay.netlify.app/footer']",
    "script[src*='jobproof']",
    "iframe[src*='hiveads']"
  ];

  function scrub() {
    document.querySelectorAll(SELECTORS.join(",")).forEach(function (el) {
      el.remove();
    });
    document.querySelectorAll("a, button, summary, h2, h3, span").forEach(function (el) {
      var t = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (t === "Open comments" || t === "Open Comments") {
        var host = el.closest("section, aside, details, article, nav");
        (host && host !== document.body ? host : el).remove();
      }
    });
  }

  scrub();
  document.addEventListener("DOMContentLoaded", scrub);
  if (window.MutationObserver) {
    new MutationObserver(scrub).observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
})();
