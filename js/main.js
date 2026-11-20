/* =====================================================================
   DUST SUPERFOODS — main interactions
   (navigation, motion, cart, forms, accordions, explorer)
   ===================================================================== */
(function () {
  "use strict";
  const doc = document.documentElement;
  doc.classList.remove("no-js");
  const CFG = window.DUST_CONFIG || {};
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------------- Products & prices ---------------- */
  const PRODUCTS = {
    green: { id: "green", name: "So Fresh & So Green", sub: "Greens + Detox · 30 servings", priceKey: "PRICE_SO_FRESH_SO_GREEN", img: "assets/img/pouch-green-front-sm.webp", url: "so-fresh-so-green.html" },
    power: { id: "power", name: "Power Up", sub: "Energy + Cognition + Performance · 30 servings", priceKey: "PRICE_POWER_UP", img: "assets/img/pouch-powerup-veg-sm.webp", url: "power-up.html" }
  };
  const cur = CFG.currency || "$";
  const priceRaw = (id) => String(CFG[PRODUCTS[id].priceKey] || "").trim();
  const priceNum = (id) => { const n = parseFloat(priceRaw(id).replace(/[^0-9.]/g, "")); return isFinite(n) ? n : NaN; };
  const fmt = (n) => (isFinite(n) ? cur + n.toFixed(2) : cur + "XX.XX");
  const priceLabel = (id) => { const n = priceNum(id); return isFinite(n) ? fmt(n) : cur + (priceRaw(id) || "XX.XX"); };
  $$("[data-price]").forEach((el) => { const id = el.getAttribute("data-price"); if (PRODUCTS[id]) el.textContent = priceLabel(id); });

  /* config-driven links */
  if (CFG.instagram) $$("[data-ig]").forEach((a) => (a.href = CFG.instagram));
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------------- Loader ---------------- */
  const loader = $(".loader");
  if (loader) {
    const seen = sessionStorage.getItem("dust-loaded");
    if (seen || reduceMotion) { loader.remove(); }
    else {
      const done = () => { loader.classList.add("is-done"); sessionStorage.setItem("dust-loaded", "1"); document.dispatchEvent(new Event("dust:loaded")); setTimeout(() => loader.remove(), 1100); };
      window.addEventListener("load", () => setTimeout(done, 650));
      setTimeout(done, 3200); // safety
    }
  }
  const loaderGone = () => !document.querySelector(".loader:not(.is-done)");

  /* ---------------- Page transitions ---------------- */
  const veil = $(".veil");
  if (!reduceMotion) doc.classList.add("page-enter");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a || !veil || reduceMotion) return;
    const href = a.getAttribute("href") || "";
    if (a.target === "_blank" || a.hasAttribute("download") || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || /^https?:/i.test(href)) return;
    const url = new URL(a.href, location.href);
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    veil.classList.add("is-active");
    setTimeout(() => (location.href = a.href), 520);
  });
  window.addEventListener("pageshow", (e) => { if (e.persisted && veil) veil.classList.remove("is-active"); });

  /* ---------------- Header ---------------- */
  const header = $(".site-header");
  const darkHero = $("[data-header-dark]");
  let lastY = window.scrollY;
  function onScroll() {
    const y = window.scrollY;
    if (header) {
      const heroH = darkHero ? darkHero.offsetHeight - 80 : 0;
      header.classList.toggle("is-over-dark", !!darkHero && y < heroH);
      header.classList.toggle("is-solid", y > 24 && !(darkHero && y < heroH));
      const hide = y > 700 && y > lastY + 4 && !document.body.classList.contains("menu-open");
      if (hide) header.classList.add("is-hidden"); else if (y < lastY - 4 || y < 700) header.classList.remove("is-hidden");
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- Mobile menu ---------------- */
  const toggle = $(".menu-toggle");
  const mm = $(".mobile-menu");
  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    if (toggle) { toggle.setAttribute("aria-expanded", String(open)); toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu"); }
    if (mm) { mm.setAttribute("aria-hidden", String(!open)); if (open) setTimeout(() => { const f = mm.querySelector("a"); f && f.focus(); }, 300); }
  }
  toggle && toggle.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  mm && mm.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { setMenu(false); closeCart(); } });

  /* ---------------- Reveal on scroll ---------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
  $$("[data-reveal],[data-reveal-stagger],[data-reveal-img],.frame,.f-row,.formula").forEach((el) => io.observe(el));

  /* ---------------- Counters ---------------- */
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target; cio.unobserve(el);
      const to = parseFloat(el.getAttribute("data-count")); const dec = (el.getAttribute("data-count").split(".")[1] || "").length;
      if (reduceMotion) { el.textContent = to.toLocaleString(undefined, { minimumFractionDigits: dec }); return; }
      const t0 = performance.now(), dur = 1600;
      (function tick(t) { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4); el.textContent = (to * e).toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec }); if (p < 1) requestAnimationFrame(tick); })(t0);
    });
  }, { threshold: 0.5 });
  $$("[data-count]").forEach((el) => cio.observe(el));

  /* ---------------- Manifesto word lighting ---------------- */
  const manifesto = $(".manifesto");
  if (manifesto && !reduceMotion) {
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
            else { const s = document.createElement("span"); s.className = "w"; s.textContent = part; frag.appendChild(s); }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(manifesto);
    const words = $$(".w", manifesto);
    const light = () => {
      const r = manifesto.getBoundingClientRect(), vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const k = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle("is-lit", i < k));
    };
    window.addEventListener("scroll", light, { passive: true }); light();
  }

  /* ---------------- GSAP: hero intro + parallax ---------------- */
  if (window.gsap && !reduceMotion) {
    const gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
    const heroLines = $$(".hero-copy .display .line > span, .pd-info .h1 .line > span");
    if (heroLines.length) {
      gsap.set(heroLines, { yPercent: 110 });
      const intro = () => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.to(heroLines, { yPercent: 0, duration: 1.4, stagger: 0.1 });
        const a = $$(".hero-copy .eyebrow, .hero-copy .lead, .hero-ctas, .hero-badges, .pd-info [data-intro]");
        const b = $$(".blend-switch, .scroll-cue, .hero-meta");
        if (a.length) tl.from(a, { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, "-=1.0");
        if (b.length) tl.from(b, { opacity: 0, y: 16, duration: 1 }, "-=.8");
      };
      if (loaderGone()) intro(); else document.addEventListener("dust:loaded", intro, { once: true });
    }
    if (window.ScrollTrigger) {
      $$("[data-parallax]").forEach((el) => {
        const amt = parseFloat(el.getAttribute("data-parallax")) || 12;
        gsap.fromTo(el, { yPercent: -amt / 2 }, { yPercent: amt / 2, ease: "none", scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true } });
      });
      const giant = $(".footer-giant");
      giant && gsap.from(giant, { xPercent: -12, ease: "none", scrollTrigger: { trigger: giant, start: "top bottom", end: "bottom bottom", scrub: true } });
      $$(".hero .hero-copy").forEach((el) => gsap.to(el, { yPercent: 18, opacity: 0.2, ease: "none", scrollTrigger: { trigger: el.closest(".hero"), start: "top top", end: "bottom top", scrub: true } }));
    }
  }

  /* ---------------- Magnetic buttons ---------------- */
  if (finePointer && !reduceMotion) {
    $$("[data-magnetic]").forEach((el) => {
      const s = 0.28;
      el.addEventListener("mousemove", (e) => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * s}px, ${(e.clientY - r.top - r.height / 2) * s}px)`; });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
    /* 3D tilt cards */
    $$("[data-tilt]").forEach((el) => {
      const max = parseFloat(el.getAttribute("data-tilt")) || 6;
      el.addEventListener("mousemove", (e) => { const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; el.style.transform = `perspective(1100px) rotateY(${x * max}deg) rotateX(${-y * max}deg) translateY(-4px)`; });
      el.addEventListener("mouseleave", () => { el.style.transition = "transform .8s cubic-bezier(.22,1,.36,1), box-shadow .5s"; el.style.transform = ""; setTimeout(() => (el.style.transition = ""), 800); });
    });
  }

  /* ---------------- Hero blend switch (talks to 3D scene) ---------------- */
  $$(".blend-switch").forEach((sw) => {
    const btns = $$("button", sw), pill = $(".pill", sw);
    const place = (b) => { if (!pill) return; pill.style.width = b.offsetWidth + "px"; pill.style.transform = `translateX(${b.offsetLeft - 5}px)`; };
    const active = btns.find((b) => b.getAttribute("aria-pressed") === "true") || btns[0];
    requestAnimationFrame(() => place(active));
    window.addEventListener("resize", () => place(btns.find((b) => b.getAttribute("aria-pressed") === "true")));
    btns.forEach((b) => b.addEventListener("click", () => {
      btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); place(b);
      const id = b.getAttribute("data-blend");
      document.dispatchEvent(new CustomEvent("dust:blend", { detail: id }));
      $$("[data-blend-show]").forEach((el) => (el.hidden = el.getAttribute("data-blend-show") !== id));
    }));
  });

  /* ---------------- Ingredient tabs (home) ---------------- */
  $$("[data-tabs]").forEach((wrap) => {
    const tabs = $$('[role="tab"]', wrap);
    tabs.forEach((t) => t.addEventListener("click", () => {
      tabs.forEach((x) => { const on = x === t; x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1; const p = document.getElementById(x.getAttribute("aria-controls")); if (p) p.hidden = !on; });
      const id = t.getAttribute("aria-controls");
      $$("[data-tab-show]", wrap).forEach((el) => (el.hidden = el.getAttribute("data-tab-show") !== id));
    }));
    wrap.addEventListener("keydown", (e) => {
      if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
      const i = tabs.indexOf(document.activeElement); if (i < 0) return;
      const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); n.click();
    });
  });

  /* ---------------- FAQ accordion (animated <details>) ---------------- */
  $$(".faq details").forEach((d) => {
    const sum = $("summary", d), ans = $(".ans", d);
    sum.addEventListener("click", (e) => {
      if (reduceMotion || !ans.animate) return;
      e.preventDefault();
      if (d.open) {
        const a = ans.animate([{ height: ans.offsetHeight + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 420, easing: "cubic-bezier(.65,0,.35,1)" });
        a.onfinish = () => (d.open = false);
      } else {
        d.open = true; const h = ans.offsetHeight;
        ans.animate([{ height: "0px", opacity: 0 }, { height: h + "px", opacity: 1 }], { duration: 520, easing: "cubic-bezier(.22,1,.36,1)" });
      }
    });
  });

  /* ---------------- Ingredient explorer filters ---------------- */
  const filters = $(".filters");
  if (filters) {
    const btns = $$("button", filters), cards = $$(".ing-card"), count = $("[data-ing-count]");
    btns.forEach((b) => b.addEventListener("click", () => {
      btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      const f = b.getAttribute("data-filter"); let n = 0;
      cards.forEach((c) => { const show = f === "all" || c.getAttribute("data-blend") === f || c.getAttribute("data-group") === f; c.classList.toggle("is-hidden", !show); if (show) n++; });
      if (count) count.textContent = n;
    }));
  }

  /* ---------------- Sticky buy bar (product pages) ---------------- */
  const sticky = $(".sticky-buy"), buyBox = $(".buy-box");
  if (sticky && buyBox) {
    new IntersectionObserver(([en]) => sticky.classList.toggle("is-shown", !en.isIntersecting && en.boundingClientRect.top < 0)).observe(buyBox);
  }

  /* =====================================================================
     CART  (stored in localStorage; checkout sends an order request email)
     ===================================================================== */
  const KEY = "dust-cart-v1";
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { cart = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };
  const drawer = $(".drawer"), body = $(".drawer-body"), totalEl = $("[data-cart-total]");
  const countEls = $$(".cart-count");

  function render() {
    const ids = Object.keys(cart).filter((id) => PRODUCTS[id] && cart[id] > 0);
    const qty = ids.reduce((s, id) => s + cart[id], 0);
    countEls.forEach((c) => { c.textContent = qty; c.classList.toggle("has-items", qty > 0); });
    if (!body) return;
    if (!ids.length) {
      body.innerHTML = `<div class="cart-empty"><svg viewBox="0 0 80 80" aria-hidden="true"><g fill="none" stroke="#9b7550" stroke-width="2"><path d="M20 22h40l-3 46H23z" fill="#e9dcc6"/><path d="M28 22c0-8 5-12 12-12s12 4 12 12"/></g><g>${[...Array(9)].map((_, i) => `<circle cx="${30 + (i % 3) * 10}" cy="${38 + Math.floor(i / 3) * 9}" r="${2 + (i % 2)}" fill="${["#edc594", "#dd4d3d", "#33308c", "#3d74c9", "#4cab4a"][i % 5]}"/>`).join("")}</g></svg><p class="serif" style="font-size:1.5rem;color:var(--ink)">Your bag is empty</p><p>Add a blend to get started.</p><a href="shop.html" class="btn btn--sm">Shop the blends</a></div>`;
    } else {
      body.innerHTML = ids.map((id) => { const p = PRODUCTS[id]; const n = priceNum(id); return `
        <div class="cart-line" data-id="${id}">
          <img src="${p.img}" alt="${p.name} pouch" width="84" height="84" loading="lazy">
          <div><h3>${p.name}</h3><p class="lp">${p.sub}</p>
            <div class="qty" role="group" aria-label="Quantity for ${p.name}"><button type="button" data-q="-1" aria-label="Decrease">−</button><span aria-live="polite">${cart[id]}</span><button type="button" data-q="1" aria-label="Increase">+</button></div></div>
          <div style="text-align:right"><div class="serif" style="font-size:1.15rem">${isFinite(n) ? fmt(n * cart[id]) : priceLabel(id)}</div><button type="button" class="remove" data-remove>Remove</button></div>
        </div>`; }).join("");
    }
    const allPriced = ids.every((id) => isFinite(priceNum(id)));
    const total = ids.reduce((s, id) => s + (priceNum(id) || 0) * cart[id], 0);
    if (totalEl) totalEl.textContent = !ids.length ? fmt(0) : allPriced ? fmt(total) : cur + "XX.XX";
    $$("[data-needs-items]").forEach((b) => (b.disabled = !ids.length));
    const summary = $("[data-order-summary]");
    if (summary) summary.value = ids.map((id) => `${cart[id]} × ${PRODUCTS[id].name} @ ${priceLabel(id)}`).join("\n") + `\nEstimated total: ${totalEl ? totalEl.textContent : ""}`;
  }
  function add(id, n = 1) {
    if (!PRODUCTS[id]) return;
    cart[id] = (cart[id] || 0) + n; save(); render();
    countEls.forEach((c) => { c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); });
    toast(`${PRODUCTS[id].name} added to your bag`);
  }
  function openCart() { if (!drawer) return; const tt = document.querySelector(".toast"); if (tt) tt.classList.remove("is-shown"); document.body.classList.add("drawer-open"); drawer.setAttribute("aria-hidden", "false"); setTimeout(() => { const c = $(".drawer-close"); c && c.focus(); }, 200); }
  function closeCart() { if (!drawer) return; document.body.classList.remove("drawer-open"); drawer.setAttribute("aria-hidden", "true"); drawer.classList.remove("is-checkout"); }
  window.closeCart = closeCart;

  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) { e.preventDefault(); const qEl = addBtn.closest("[data-buy]") && $("[data-buy-qty]", addBtn.closest("[data-buy]")); add(addBtn.getAttribute("data-add"), qEl ? parseInt(qEl.textContent, 10) || 1 : 1); if (addBtn.hasAttribute("data-open-cart")) openCart(); return; }
    if (e.target.closest("[data-open-cart]")) { e.preventDefault(); openCart(); return; }
    if (e.target.closest("[data-close-cart]") || e.target.classList.contains("drawer-backdrop")) { closeCart(); return; }
    const line = e.target.closest(".cart-line");
    if (line) {
      const id = line.getAttribute("data-id");
      const q = e.target.closest("[data-q]");
      if (q) { cart[id] = Math.max(0, (cart[id] || 0) + parseInt(q.getAttribute("data-q"), 10)); if (!cart[id]) delete cart[id]; save(); render(); }
      if (e.target.closest("[data-remove]")) { delete cart[id]; save(); render(); }
    }
    if (e.target.closest("[data-checkout]")) { drawer.classList.add("is-checkout"); const f = $(".checkout-panel input", drawer); f && f.focus(); }
    if (e.target.closest("[data-back-cart]")) drawer.classList.remove("is-checkout");
    const bq = e.target.closest("[data-bq]");
    if (bq) { const span = $("[data-buy-qty]", bq.closest("[data-buy]")); span.textContent = Math.max(1, Math.min(20, (parseInt(span.textContent, 10) || 1) + parseInt(bq.getAttribute("data-bq"), 10))); }
  });
  window.addEventListener("storage", (e) => { if (e.key === KEY) { try { cart = JSON.parse(e.newValue) || {}; } catch (_) {} render(); } });
  render();

  /* ---------------- Toast ---------------- */
  let toastT;
  function toast(msg) {
    let t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.setAttribute("aria-live", "polite"); document.body.appendChild(t); }
    t.innerHTML = `<span class="tick"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" stroke-width="2"><path d="M2 6.5l2.5 2.5L10 3"/></svg></span>${msg}<button type="button" class="link-u" data-open-cart style="margin-left:6px;color:var(--leaf-soft)">View bag</button>`;
    t.classList.add("is-shown"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("is-shown"), 3600);
  }

  /* =====================================================================
     FORMS → FormSubmit.co  (AJAX with native-post fallback)
     The first submission sends an activation email to the inbox in config.js.
     ===================================================================== */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  $$("form.js-form").forEach((form) => {
    const status = $(".form-status", form);
    const setStatus = (msg, ok) => { if (status) { status.textContent = msg; status.className = "form-status " + (ok ? "ok" : "bad"); } };
    if (CFG.email) form.action = "https://formsubmit.co/" + CFG.email;
    const next = $('input[name="_next"]', form);
    if (next) next.value = new URL("thank-you.html", location.href).href;

    const validate = () => {
      let first = null;
      $$("[required], input[type=email]", form).forEach((f) => {
        const field = f.closest(".field"); const err = field && $(".err", field);
        let msg = "";
        const v = (f.value || "").trim();
        if (f.type === "checkbox" && f.required && !f.checked) msg = "Please tick this box to continue.";
        else if (f.required && !v) msg = "This field is required.";
        else if (f.type === "email" && v && !EMAIL_RE.test(v)) msg = "Please enter a valid email address.";
        else if (f.minLength > 0 && v.length < f.minLength) msg = `Please write at least ${f.minLength} characters.`;
        if (field) field.classList.toggle("has-error", !!msg);
        if (err) err.textContent = msg;
        f.setAttribute("aria-invalid", msg ? "true" : "false");
        if (msg && !first) first = f;
      });
      if (first) first.focus();
      return !first;
    };
    $$("input,textarea,select", form).forEach((f) => f.addEventListener("input", () => { const field = f.closest(".field"); if (field && field.classList.contains("has-error")) { field.classList.remove("has-error"); const err = $(".err", field); if (err) err.textContent = ""; } }));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const hp = $('input[name="_honey"]', form);
      if (hp && hp.value) return; // bot
      if (!validate()) { setStatus("Please check the highlighted fields.", false); return; }
      const btn = $('button[type="submit"]', form); const label = btn ? btn.innerHTML : "";
      if (btn) { btn.disabled = true; btn.innerHTML = "Sending…"; }
      setStatus("", true);
      const data = Object.fromEntries(new FormData(form).entries());
      try {
        const res = await fetch("https://formsubmit.co/ajax/" + (CFG.email || ""), { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
        const json = await res.json().catch(() => ({}));
        if (res.ok && String(json.success) === "true") {
          form.classList.add("is-sent"); form.reset();
          if (form.hasAttribute("data-clears-cart")) { cart = {}; save(); render(); }
        } else if (json && json.message && /activat/i.test(json.message)) {
          setStatus("Almost there — this form is waiting for the site owner to confirm the FormSubmit activation email. Please try again shortly or email us directly.", false);
        } else { throw new Error(json.message || "Request failed"); }
      } catch (err) {
        // Network/CORS issue → fall back to a normal form post (redirects to thank-you.html)
        HTMLFormElement.prototype.submit.call(form);
      } finally { if (btn) { btn.disabled = false; btn.innerHTML = label; } }
    });
  });
})();
