(function () {
  var root = document.documentElement;
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // --- Taille du texte & contraste (préférences mémorisées) ---
  var sizes = ["md", "lg", "xl"];
  var size = load("fl-text") || "md";
  var contrast = load("fl-contrast") || "normal";
  function apply() {
    root.setAttribute("data-text", size);
    root.setAttribute("data-contrast", contrast);
    var c = document.querySelector("[data-a11y='contrast']");
    if (c) c.setAttribute("aria-pressed", contrast === "high" ? "true" : "false");
  }
  apply();
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-a11y]");
    if (!b) return;
    var a = b.getAttribute("data-a11y");
    var i = sizes.indexOf(size);
    if (a === "plus" && i < sizes.length - 1) size = sizes[i + 1];
    if (a === "minus" && i > 0) size = sizes[i - 1];
    if (a === "contrast") contrast = contrast === "high" ? "normal" : "high";
    save("fl-text", size); save("fl-contrast", contrast); apply();
  });

  // --- Menu mobile ---
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); toggle.focus();
      }
    });
  }

  // --- Onglets « Vous êtes » (clavier : flèches gauche/droite) ---
  document.querySelectorAll("[role='tablist']").forEach(function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll("[role='tab']"));
    function select(t) {
      tabs.forEach(function (x) {
        var on = x === t;
        x.setAttribute("aria-selected", on ? "true" : "false");
        x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t); });
      t.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (n) { e.preventDefault(); select(n); n.focus(); }
      });
    });
  });

  // --- Formulaire de contact (prépare un e-mail tant qu'aucun service d'envoi n'est branché) ---
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      if (form.getAttribute("action")) return; // un service d'envoi (Formspree…) est configuré
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      var besoins = d.getAll("besoin").join(", ");
      var body = "Nom : " + d.get("nom") + "\nProfil : " + d.get("profil") + "\nTéléphone : " + (d.get("tel") || "-") +
        "\nE-mail : " + d.get("email") + "\nDépartement : " + (d.get("dep") || "-") + "\nBesoins : " + (besoins || "-") +
        "\n\n" + d.get("message");
      var to = form.getAttribute("data-mailto");
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent("Demande de contact — " + d.get("profil")) +
        "&body=" + encodeURIComponent(body);
      var s = document.getElementById("form-status");
      s.hidden = false; s.focus();
    });
  }

  // --- Apparition douce au défilement ---
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: .12 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
