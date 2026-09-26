(function () {
  "use strict";

  var APP_URL = "https://real-estate-platform-blond.vercel.app/dashboard";
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("primary-nav");
  var backdrop = document.querySelector(".nav-backdrop");
  var navLinks = document.querySelectorAll(".nav-link");
  var sections = ["home", "features", "showcase", "solutions"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var demoPanel = document.getElementById("demo-access");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lastFocusedElement = null;

  document.querySelectorAll("[data-app-link]").forEach(function (link) {
    link.setAttribute("href", APP_URL);
  });

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

  function closeMenu(returnFocus) {
    setMenu(false);
    if (returnFocus && toggle) toggle.focus();
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

  function getFocusableElements(container) {
    return Array.prototype.slice.call(container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(function (element) {
      return !element.hasAttribute("hidden");
    });
  }

  function openDemoAccess(trigger) {
    if (!demoPanel) return;
    lastFocusedElement = trigger || document.activeElement;
    demoPanel.hidden = false;
    demoPanel.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    var closeButton = demoPanel.querySelector(".js-demo-close");
    if (closeButton) closeButton.focus();
  }

  function closeDemoAccess() {
    if (!demoPanel || demoPanel.hidden) return;
    demoPanel.hidden = true;
    demoPanel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function trapDialogFocus(event) {
    if (!demoPanel || demoPanel.hidden || event.key !== "Tab") return;
    var focusable = getFocusableElements(demoPanel);
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (!demoPanel.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function fallbackCopy(text) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    var copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }
    textarea.remove();
    return copied;
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        return fallbackCopy(text);
      }
    }
    return fallbackCopy(text);
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(!document.body.classList.contains("menu-open"));
    });
  }

  if (backdrop) backdrop.addEventListener("click", function () { closeMenu(false); });

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (event) {
      var id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      if (document.body.classList.contains("menu-open")) closeMenu(false);
      if (id === "#demo-access") {
        openDemoAccess(anchor);
        return;
      }
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", id);
    });
  });

  document.querySelectorAll(".js-demo-close").forEach(function (button) {
    button.addEventListener("click", closeDemoAccess);
  });

  if (demoPanel) {
    demoPanel.addEventListener("click", function (event) {
      if (event.target === demoPanel) closeDemoAccess();
    });
  }

  document.querySelectorAll(".copy-button").forEach(function (button) {
    button.addEventListener("click", async function () {
      var target = document.getElementById(button.dataset.copyTarget);
      if (!target) return;
      var originalLabel = button.dataset.defaultAriaLabel || button.getAttribute("aria-label");
      button.dataset.defaultAriaLabel = originalLabel || "";
      var copied = await copyText(target.textContent.trim());
      button.textContent = copied ? "تم النسخ" : "تعذر النسخ";
      button.setAttribute("aria-label", copied ? "تم النسخ" : "تعذر النسخ، حاول تحديد النص ونسخه يدويًا");
      button.focus();
      window.clearTimeout(button.copyResetTimer);
      button.copyResetTimer = window.setTimeout(function () {
        button.textContent = button.dataset.defaultText || "نسخ";
        if (originalLabel) button.setAttribute("aria-label", originalLabel);
      }, 1800);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (document.body.classList.contains("menu-open")) closeMenu(true);
      closeDemoAccess();
    }
    trapDialogFocus(event);
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
    document.querySelectorAll(".reveal").forEach(function (el) { revealer.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  function normalizeValue(field) {
    field.value = field.value.replace(/\s+/g, " ").trim();
    return field.value;
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function isValidPhone(value) {
    var compact = value.replace(/[\s().-]/g, "");
    return /^\+?\d{7,15}$/.test(compact);
  }

  function setFieldError(field, message) {
    var wrapper = field.closest(".form-field");
    var error = wrapper ? wrapper.querySelector(".field-error") : null;
    if (message) {
      field.setAttribute("aria-invalid", "true");
      if (error) {
        error.textContent = message;
        if (error.id) field.setAttribute("aria-describedby", error.id);
      }
    } else {
      field.removeAttribute("aria-invalid");
      if (error) error.textContent = "";
    }
  }

  function validateManagedForm(form) {
    var firstInvalid = null;
    var requiredMessage = "هذا الحقل مطلوب.";
    form.querySelectorAll("input, textarea").forEach(function (field) {
      if (field.type === "hidden" || field.name === "_honey") return;
      var value = normalizeValue(field);
      var message = "";
      if (field.hasAttribute("required") && !value) message = requiredMessage;
      if (!message && field.type === "email" && value && !isValidEmail(value)) message = "أدخل بريدًا إلكترونيًا صحيحًا.";
      if (!message && field.type === "tel" && value && !isValidPhone(value)) message = "أدخل رقم جوال صحيحًا مع مفتاح الدولة عند الحاجة.";
      setFieldError(field, message);
      if (message && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  function setFormNote(form, state, title, message) {
    var note = form.querySelector(".form-note");
    if (!note) return;
    note.className = "form-note" + (note.classList.contains("page-form-note") ? " page-form-note" : "") + (state ? " is-" + state : "");
    note.replaceChildren();
    if (title) {
      var strong = document.createElement("strong");
      strong.textContent = title;
      note.appendChild(strong);
      var span = document.createElement("span");
      span.textContent = message;
      note.appendChild(span);
    } else {
      note.textContent = message;
    }
  }

  document.querySelectorAll(".managed-form").forEach(function (form) {
    var isSubmitting = false;
    form.addEventListener("input", function (event) {
      if (event.target.matches("input, textarea")) setFieldError(event.target, "");
    });
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (isSubmitting) return;
      if (!validateManagedForm(form)) {
        setFormNote(form, "error", "", "راجع الحقول المحددة ثم حاول مرة أخرى.");
        return;
      }

      var endpoint = form.getAttribute("action") || form.dataset.endpoint || "";
      var submitButton = form.querySelector('button[type="submit"]');
      var defaultText = submitButton ? (submitButton.dataset.defaultText || submitButton.textContent) : "";

      if (!endpoint) {
        setFormNote(form, "error", "", "تعذر تحديد وجهة الإرسال. حاول مرة أخرى لاحقًا.");
        return;
      }

      isSubmitting = true;
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "جارٍ الإرسال...";
      }
      setFormNote(form, "loading", "", "جارٍ إرسال الطلب...");

      try {
        var response = await fetch(endpoint, {
          method: (form.getAttribute("method") || "POST").toUpperCase(),
          body: new FormData(form),
          headers: { "Accept": "application/json" }
        });
        if (!response.ok) throw new Error("Request failed");
        setFormNote(form, "success", form.dataset.successTitle || "تم الإرسال بنجاح", form.dataset.successMessage || "تم استلام رسالتك بنجاح.");
        form.reset();
      } catch (error) {
        setFormNote(form, "error", "", "تعذر إرسال الطلب الآن. تحقق من اتصالك وحاول مرة أخرى.");
      } finally {
        isSubmitting = false;
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = defaultText;
        }
      }
    });
  });

  onScrollHeader();
  updateActiveNav();
  window.addEventListener("scroll", function () {
    onScrollHeader();
    updateActiveNav();
  }, { passive: true });
})();
