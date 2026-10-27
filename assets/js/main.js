/* Tower Land Contracting — site behaviour: language switch, header, mobile menu,
   scroll reveals, counters, project filter and the quote form. */
(function () {
  "use strict";

  var root = document.documentElement;
  var dict = window.TL_I18N || { ar: {}, en: {} };
  var STORAGE_KEY = "tl-lang";

  /* ---------------- Language ---------------- */
  var textNodes = document.querySelectorAll("[data-i18n]");
  var attrNodes = document.querySelectorAll("[data-i18n-attr]");

  // Remember the English (source) content so we can switch back without a reload.
  textNodes.forEach(function (el) { el._en = el.innerHTML; });
  attrNodes.forEach(function (el) {
    el._enAttr = {};
    parseAttrs(el).forEach(function (pair) { el._enAttr[pair[0]] = el.getAttribute(pair[0]); });
  });

  function parseAttrs(el) {
    return el.getAttribute("data-i18n-attr").split(",").map(function (s) {
      var i = s.indexOf(":");
      return [s.slice(0, i).trim(), s.slice(i + 1).trim()];
    });
  }

  function t(key) {
    var lang = root.lang === "ar" ? "ar" : "en";
    return (dict[lang] && dict[lang][key]) || (dict.en && dict.en[key]) || key;
  }

  function applyLang(lang) {
    var isAr = lang === "ar";
    root.lang = isAr ? "ar" : "en";
    root.dir = isAr ? "rtl" : "ltr";

    textNodes.forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      el.innerHTML = isAr && dict.ar[key] != null ? dict.ar[key] : el._en;
    });
    attrNodes.forEach(function (el) {
      parseAttrs(el).forEach(function (pair) {
        var value = isAr && dict.ar[pair[1]] != null ? dict.ar[pair[1]] : el._enAttr[pair[0]];
        if (value != null) el.setAttribute(pair[0], value);
      });
    });

    document.querySelectorAll("[data-lang-toggle]").forEach(function (btn) {
      btn.textContent = isAr ? "English" : "العربية";
      btn.setAttribute("lang", isAr ? "en" : "ar");
      btn.setAttribute("aria-label", isAr ? "View the site in English" : "عرض الموقع باللغة العربية");
    });

    try { localStorage.setItem(STORAGE_KEY, root.lang); } catch (e) { /* storage unavailable */ }
    root.classList.remove("i18n-pending");
  }

  applyLang(root.lang === "ar" ? "ar" : "en");

  document.querySelectorAll("[data-lang-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLang(root.lang === "ar" ? "en" : "ar");
    });
  });

  /* ---------------- Header & mobile menu ---------------- */
  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");

  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 30);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function setMenu(open) {
    document.body.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", t(open ? "js.menu.close" : "common.menu"));
  }
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      setMenu(!document.body.classList.contains("nav-open"));
    });
    document.querySelectorAll(".main-nav a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) setMenu(false);
    });
    window.matchMedia("(min-width: 921px)").addEventListener("change", function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------------- Reveal on scroll & counters ---------------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (reduceMotion || !target) { el.textContent = target; return; }
    var start = null, duration = 1600;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        entry.target.querySelectorAll("[data-count]").forEach(animateCount);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------- Project filter ---------------- */
  var filterBtns = document.querySelectorAll("[data-filter]");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cat = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      document.querySelectorAll(".project-card").forEach(function (card) {
        card.classList.toggle("is-hidden", cat !== "all" && card.getAttribute("data-category") !== cat);
      });
    });
  });

  /* ---------------- Quote form ----------------
     Static hosting has no backend, so the form opens the visitor's email app
     with the details filled in. To receive submissions directly instead, point
     the form's action at a form service (e.g. Formspree) and remove this handler. */
  var form = document.getElementById("quote-form");
  if (form) {
    var status = form.querySelector(".form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var phone = form.elements.phone.value.trim();
      var message = form.elements.message.value.trim();
      if (!name || !phone || !message) {
        status.textContent = t("js.form.invalid");
        (!name ? form.elements.name : !phone ? form.elements.phone : form.elements.message).focus();
        return;
      }
      var body = [
        "Name: " + name,
        "Phone: " + phone,
        "Email: " + form.elements.email.value.trim(),
        "Service: " + form.elements.service.value,
        "",
        message
      ].join("\n");
      var subject = "Quote request — " + form.elements.service.value;
      status.textContent = t("js.form.opening");
      window.location.href = "mailto:" + form.getAttribute("data-email") +
        "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  }

  /* ---------------- Footer year ---------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
