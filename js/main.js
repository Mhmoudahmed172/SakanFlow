(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("primary-nav");
  var backdrop = document.querySelector(".nav-backdrop");
  var navLinks = document.querySelectorAll(".nav-link");
  var sections = ["home", "features", "showcase", "solutions"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var loginPanel = document.getElementById("login");
  var loginClose = document.querySelector(".login-close");
  var demoForm = document.getElementById("demo-request");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    if (toggle) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "إغلاق القائمة" : "فتح القائمة");
    }
    if (backdrop) backdrop.hidden = !open;
    if (open && nav) {
      var first = nav.querySelector("a");
      if (first) first.focus();
    }
  }

  function closeMenu() {
    setMenu(false);
    if (toggle) toggle.focus();
  }

  function onScrollHeader() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  function updateActiveNav() {
    var current = "home";
    var marker = window.scrollY + 120;
    sections.forEach(function (section) {
      if (section.offsetTop <= marker) current = section.id;
    });
    navLinks.forEach(function (link) {
      var href = link.getAttribute("href") || "";
      link.classList.toggle("is-active", href === "#" + current);
    });
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(!document.body.classList.contains("menu-open"));
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", closeMenu);
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (event) {
      var id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      if (document.body.classList.contains("menu-open")) setMenu(false);
      if (id === "#login") {
        openLogin();
        return;
      }
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", id);
    });
  });

  function openLogin() {
    if (!loginPanel) return;
    loginPanel.hidden = false;
    loginPanel.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    var closeBtn = loginPanel.querySelector(".login-close");
    if (closeBtn) closeBtn.focus();
  }

  function closeLogin() {
    if (!loginPanel) return;
    loginPanel.hidden = true;
    loginPanel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  if (loginClose) loginClose.addEventListener("click", closeLogin);
  if (loginPanel) {
    loginPanel.addEventListener("click", function (event) {
      if (event.target === loginPanel) closeLogin();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (document.body.classList.contains("menu-open")) closeMenu();
      if (loginPanel && !loginPanel.hidden) closeLogin();
    }
  });

  if (!reduceMotion && "IntersectionObserver" in window) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) {
      revealer.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  if (demoForm) {
    demoForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var note = demoForm.querySelector(".form-note");
      if (note) {
        note.textContent = "شكرًا لك. تم تجهيز طلب العرض التوضيحي، وسنتواصل معك عبر رقمك.";
      }
      demoForm.reset();
    });
  }

  onScrollHeader();
  updateActiveNav();
  window.addEventListener("scroll", function () {
    onScrollHeader();
    updateActiveNav();
  }, { passive: true });
})();

