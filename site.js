/* Don Andres N.V. preview. Sailing board is generated from published dates; everything after the last published date is marked projected. */
(function () {
  // Trinidad > Curaçao sailings published on the company's Facebook page for 2026 (Fridays).
  const PUBLISHED = ["2026-01-16","2026-01-30","2026-02-13","2026-02-27","2026-03-13","2026-03-27","2026-04-10","2026-05-08","2026-05-22","2026-06-05","2026-06-19","2026-07-03","2026-07-17","2026-07-31","2026-08-14","2026-08-28","2026-09-11","2026-10-23"];
  const DAY = 86400000;
  const fmt = (d, o) => d.toLocaleDateString("en-GB", Object.assign({ weekday: "short", day: "numeric", month: "short" }, o || {}));
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const today = new Date(); today.setHours(0, 0, 0, 0);

  function trinidadSailings(count) {
    const out = [];
    const pub = PUBLISHED.map(s => new Date(s + "T00:00:00"));
    let last = pub[pub.length - 1];
    pub.forEach(d => { if (d >= today) out.push({ date: d, projected: false }); });
    let next = addDays(last, 14);
    while (out.length < count) { if (next >= today) out.push({ date: next, projected: true }); next = addDays(next, 14); }
    return out.slice(0, count);
  }
  function nextMondays(count) {
    const out = []; let d = new Date(today);
    while (d.getDay() !== 1) d = addDays(d, 1);
    while (out.length < count) { out.push(d); d = addDays(d, 7); }
    return out;
  }

  function rows(limit) {
    const list = [];
    trinidadSailings(limit).forEach(s => {
      list.push({ sort: s.date, route: "Trinidad to Curaçao", sub: "Port of Spain, onward to Bonaire and Aruba", dep: s.date, arr: addDays(s.date, 2), arrNote: "Bonaire and Aruba day 3", vessel: "Doña Luisa I", status: s.projected ? "proj" : "open", cutoff: addDays(s.date, -2) });
    });
    nextMondays(Math.ceil(limit / 2)).forEach(d => {
      list.push({ sort: d, route: "Curaçao to Aruba", sub: "and Aruba to Curaçao, full containers", dep: d, arr: addDays(d, 1), arrNote: "", vessel: "Don Andres I", status: "open", cutoff: addDays(d, -3) });
    });
    list.sort((a, b) => a.sort - b.sort);
    return list.slice(0, limit);
  }

  function tag(status) {
    if (status === "open") return '<span class="tag tag-open">Booking open</span>';
    if (status === "proj") return '<span class="tag tag-proj">Projected</span>';
    return '<span class="tag tag-req">On request</span>';
  }

  function renderBoard(el, limit, withRequestRows) {
    const r = rows(limit);
    let html = r.map(x => `<tr>
      <td class="route">${x.route}<small>${x.sub}</small></td>
      <td class="date"><strong>${fmt(x.dep)}</strong><small>cut-off ${fmt(x.cutoff, { weekday: undefined })}</small></td>
      <td class="date"><strong>${fmt(x.arr)}</strong><small>${x.arrNote}</small></td>
      <td class="vessel">${x.vessel}</td>
      <td>${tag(x.status)}</td>
      <td><a class="book" href="quote.html?route=${encodeURIComponent(x.route)}&date=${x.dep.toISOString().slice(0,10)}">Book space</a></td>
    </tr>`).join("");
    if (withRequestRows) {
      html += `<tr><td class="route">Curaçao to Rio Haina<small>Dominican Republic, onward to Aruba and Bonaire</small></td><td class="date"><strong>Every two weeks</strong><small>2 days transit</small></td><td class="date"><strong>Next date on request</strong><small></small></td><td class="vessel">Doña Luisa I</td><td>${tag("req")}</td><td><a class="book" href="quote.html?route=Cura%C3%A7ao%20to%20Rio%20Haina">Ask for dates</a></td></tr>
      <tr><td class="route">Aruba to Bonaire<small>weekly, via Curaçao</small></td><td class="date"><strong>Weekly</strong><small></small></td><td class="date"><strong>Next date on request</strong><small></small></td><td class="vessel">Don Andres I</td><td>${tag("req")}</td><td><a class="book" href="quote.html?route=Aruba%20to%20Bonaire">Ask for dates</a></td></tr>`;
    }
    el.innerHTML = html;
  }

  document.querySelectorAll("[data-board]").forEach(el => renderBoard(el, parseInt(el.dataset.board, 10) || 6, el.hasAttribute("data-request-rows")));

  function renderCards(el, count) {
    const only = el.dataset.only, dest = el.dataset.dest;
    let r = rows(count * 4);
    if (only) r = r.filter(x => x.route.indexOf(only) === 0);
    if (dest) r = r.map(x => Object.assign({}, x, { route: x.route.replace("Curaçao", dest), arr: addDays(x.dep, 3) }));
    r = r.slice(0, count);
    el.innerHTML = r.map((x, i) => `<article class="sail-card${i === 0 ? " next" : ""}">
      <div class="sc-date"><span>${x.dep.toLocaleDateString("en-GB", { weekday: "short" })}</span><strong>${x.dep.getDate()}</strong><span>${x.dep.toLocaleDateString("en-GB", { month: "short" })}</span></div>
      <div><h3>${x.route}</h3><p>Arrives ${fmt(x.arr)}. Cut-off ${fmt(x.cutoff, { weekday: undefined })}. ${x.vessel.replace(/ I$/, "\u00a0I")}.</p></div>
      ${tag(x.status)}
      <a class="btn btn-red" href="quote.html?route=${encodeURIComponent(x.route)}&date=${x.dep.toISOString().slice(0,10)}">Book space</a>
    </article>`).join("");
  }
  document.querySelectorAll("[data-sailing-cards]").forEach(el => renderCards(el, parseInt(el.dataset.sailingCards, 10) || 3));


  const next = trinidadSailings(1)[0];
  document.querySelectorAll("[data-next-trinidad]").forEach(el => { el.textContent = fmt(next.date, { month: "long" }); });
  document.querySelectorAll("[data-next-trinidad-note]").forEach(el => { el.textContent = next.projected ? "Projected on the two-week rhythm, confirm with operations." : "Published sailing. Booking open."; });
  document.querySelectorAll("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });

  // nav
  const btn = document.querySelector(".menu-btn"), menu = document.querySelector(".nav ul");
  if (btn && menu) btn.addEventListener("click", () => { const o = menu.classList.toggle("open"); btn.setAttribute("aria-expanded", o); });

  // reveal
  if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
    document.querySelectorAll(".rv").forEach(el => io.observe(el));
  } else document.querySelectorAll(".rv").forEach(el => el.classList.add("in"));

  // hero video: only play if motion allowed
  const v = document.querySelector(".hero video");
  if (v && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { v.removeAttribute("autoplay"); v.pause(); }

  // quote form (preview, no backend)
  const form = document.querySelector("form[data-quote]");
  if (form) {
    const q = new URLSearchParams(location.search);
    if (q.get("route")) { const s = form.querySelector("[name=route]"); if (s) { [...s.options].forEach(o => { if (o.value === q.get("route")) o.selected = true; }); } }
    if (q.get("date")) { const d = form.querySelector("[name=date]"); if (d) d.value = q.get("date"); }
    form.addEventListener("submit", e => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll("[required]").forEach(f => { const w = f.closest("div"); const bad = !f.value.trim() || (f.type === "email" && !/.+@.+\..+/.test(f.value)); w.classList.toggle("bad", bad); if (bad) ok = false; });
      if (!ok) return;
      const data = Object.fromEntries(new FormData(form).entries());
      const body = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
      const out = document.getElementById("quote-result");
      out.innerHTML = `<strong>This preview is not connected to the office yet.</strong> On the live site this request goes straight to the operations desk. For now it opens your email app with everything filled in.`;
      out.hidden = false;
      location.href = "mailto:info@donandresnv.com?subject=" + encodeURIComponent("Quote request: " + (data.route || "shipping")) + "&body=" + encodeURIComponent(body);
    });
  }
})();

/* theme toggle: remembers the viewer's choice, falls back to the system setting */
(function () {
  const root = document.documentElement;
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const meta = document.querySelector('meta[name="theme-color"]');
  const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : mq.matches;
  const sync = () => { if (meta) meta.setAttribute("content", isDark() ? "#0D131B" : "#142334"); };
  sync();
  document.querySelectorAll(".theme-btn").forEach(b => b.addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("da-theme", next); } catch (e) {}
    sync();
  }));
})();
