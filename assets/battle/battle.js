(function () {
  var form = document.getElementById("battle-form");
  if (!form) return;
  var teamFields = document.getElementById("team-fields");
  var err = document.getElementById("form-error");
  var done = document.getElementById("form-done");

  // Show team name / teammates only when "I have a team" is picked.
  form.addEventListener("change", function (e) {
    if (e.target.name === "team_status") teamFields.hidden = e.target.value !== "I have a team";
  });

  // "official rules" link inside the form opens the rules panel.
  var rulesLink = form.querySelector("[data-open-rules]");
  if (rulesLink) rulesLink.addEventListener("click", function () {
    var d = document.getElementById("official-rules");
    if (d) d.open = true;
  });

  function fail(msg) { err.textContent = msg; err.hidden = false; err.scrollIntoView({ block: "center", behavior: "smooth" }); }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    err.hidden = true;
    var fd = new FormData(form);
    var need = [["name", "Please add your full name."], ["email", "Please add your email."], ["x_handle", "Please add your X handle."],
      ["side", "Please pick a side."], ["team_status", "Please tell us if you have a team."], ["idea", "Please tell us what you'd build."],
      ["age", "Please confirm your age."], ["rules", "Please agree to the official rules."]];
    for (var i = 0; i < need.length; i++) {
      if (!String(fd.get(need[i][0]) || "").trim()) return fail(need[i][1]);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(fd.get("email")))) return fail("That email doesn't look right.");
    if (fd.get("team_status") === "I have a team" && !String(fd.get("team_name") || "").trim()) return fail("Please add your team name.");

    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true; btn.textContent = "Sending…";
    fetch(form.action, { method: "POST", body: new URLSearchParams(fd), headers: { accept: "application/json" } })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.j.error || "Something went wrong. Please try again.");
        document.getElementById("done-side").textContent = res.j.side || fd.get("side");
        form.hidden = true; done.hidden = false; done.focus();
      })
      .catch(function (e2) { btn.disabled = false; btn.textContent = "Enter your bot"; fail(e2.message || "Something went wrong. Please try again."); });
  });
})();
