/* Escentie — scroll engine: parallax, in/out reveals, nav theming, variant modal. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = document.querySelector(".nav");
  var darkSections = [];
  var intensity = 0.16;

  window.__escentie = { setIntensity: function (v) { intensity = v; schedule(); } };

  /* ---- hero video: autoplay in view, pause when off the page ---- */
  var heroVideo = document.getElementById("heroVideo");
  var heroSec = document.getElementById("hero");

  /* ---- parallax + reveal items ---- */
  var items = [].slice.call(document.querySelectorAll("[data-parallax]"));
  var revealEls = [].slice.call(document.querySelectorAll(".reveal"));
  var ticking = false;

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    if (!reduce) {
      for (var i = 0; i < items.length; i++) {
        var el = items[i];
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0;
        var r = el.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) continue;
        var fromCenter = (r.top + r.height / 2) - vh / 2;
        var y = -fromCenter * speed * intensity;
        el.style.transform = "translate3d(0," + y.toFixed(1) + "px,0)";
      }
      /* reveal: inline styles win the cascade; .reveal class supplies transition timing */
      for (var j = 0; j < revealEls.length; j++) {
        var re = revealEls[j];
        var rr = re.getBoundingClientRect();
        if (rr.height === 0 && rr.top === 0) continue;
        var inView = rr.top < vh * 0.9 && rr.bottom > vh * 0.1;
        var state = inView ? "1" : "0";
        if (re._rv === state) continue; // only write on change → don't restart the transition
        re._rv = state;
        re.style.opacity = inView ? "1" : "0";
        var shift = (getComputedStyle(document.documentElement).getPropertyValue("--reveal-shift") || "34px").trim() || "34px";
        re.style.transform = inView ? "none" : "translateY(" + shift + ")";
      }
    }
    if (nav) {
      nav.classList.toggle("scrolled", window.scrollY > 40);
      var overDark = false, navMid = nav.offsetHeight / 2 + 4;
      for (var d = 0; d < darkSections.length; d++) {
        var dr = darkSections[d].getBoundingClientRect();
        if (dr.top <= navMid && dr.bottom >= navMid) { overDark = true; break; }
      }
      nav.classList.toggle("over-dark", overDark);
    }
    if (heroVideo && heroSec) {
      var hv = heroSec.getBoundingClientRect();
      var onPage = hv.bottom > vh * 0.15 && hv.top < vh * 0.85;
      if (onPage) { if (heroVideo.paused) { var p = heroVideo.play(); if (p && p.catch) p.catch(function () {}); } }
      else if (!heroVideo.paused) { heroVideo.pause(); }
    }
  }
  function schedule() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);

  if (reduce) { revealEls.forEach(function (el) { el.style.opacity = "1"; el.style.transform = "none"; }); }

  darkSections = [].slice.call(document.querySelectorAll("[data-dark]"));

  /* ---- variant card videos: play only while visible, stop off-page ---- */
  var cardVideos = [].slice.call(document.querySelectorAll(".card__video"));
  function playVid(v) { if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
  function stopVid(v) { if (!v.paused) v.pause(); }
  if (cardVideos.length && "IntersectionObserver" in window) {
    var cvObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        e.target._inview = e.isIntersecting;
        if (e.isIntersecting && !document.hidden) playVid(e.target); else stopVid(e.target);
      });
    }, { threshold: 0.15 });
    cardVideos.forEach(function (v) { cvObs.observe(v); });
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { cardVideos.forEach(stopVid); }
    else { cardVideos.forEach(function (v) { if (v._inview) playVid(v); }); schedule(); }
  });

  /* ---- variant modal ---- */
  var modal = document.getElementById("variantModal");
  var mEls = modal ? {
    img: modal.querySelector("#mImg"), notes: modal.querySelector("#mNotes"),
    name: modal.querySelector("#mName"), tag: modal.querySelector("#mTagline"),
    narr: modal.querySelector("#mNarr"), reel: modal.querySelector("#mReel")
  } : null;
  var lastFocus = null;

  function openModal(card) {
    if (!modal) return;
    lastFocus = document.activeElement;
    mEls.img.src = card.getAttribute("data-img");
    mEls.img.alt = card.getAttribute("data-name");
    if (mEls.img.tagName === "VIDEO") { try { mEls.img.load(); } catch (e) {} var mp = mEls.img.play(); if (mp && mp.catch) mp.catch(function () {}); }
    mEls.notes.textContent = card.getAttribute("data-notes");
    mEls.name.textContent = card.getAttribute("data-name");
    mEls.tag.textContent = card.getAttribute("data-tagline");
    mEls.narr.innerHTML = "";
    (card.getAttribute("data-narrative") || "").split("||").forEach(function (par) {
      var txt = par.trim();
      if (!txt) return;
      var p = document.createElement("p");
      p.textContent = txt;
      mEls.narr.appendChild(p);
    });
    var reelUrl = card.getAttribute("data-reel");
    if (mEls.reel) {
      if (reelUrl) { mEls.reel.href = reelUrl; mEls.reel.style.display = ""; }
      else { mEls.reel.style.display = "none"; }
    }
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(function () { modal.classList.add("open"); });
    modal.querySelector(".modal__close").focus();
  }
  function closeModal() {
    if (!modal) return;
    if (mEls && mEls.img && mEls.img.tagName === "VIDEO" && !mEls.img.paused) mEls.img.pause();
    modal.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(function () { modal.hidden = true; }, 420);
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("click", function () { openModal(card); });
    card.setAttribute("tabindex", "0");
    card.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(card); } });
  });
  document.querySelectorAll(".catalog__detail").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = btn.getAttribute("data-target");
      var card = document.querySelector('.card[data-name="' + target + '"]');
      if (card) openModal(card);
    });
  });
  if (modal) {
    modal.querySelector(".modal__close").addEventListener("click", closeModal);
    modal.querySelector(".modal__backdrop").addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) closeModal(); });
    modal.querySelector(".modal__add").addEventListener("click", function (b) {
      var btn = b.currentTarget; var old = btn.textContent;
      btn.textContent = "✓ Ditambahkan"; setTimeout(function () { btn.textContent = old; }, 1400);
    });
  }

  /* ---- smooth anchor ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (ev) {
      var id = a.getAttribute("href"); if (id.length < 2) return;
      var t = document.querySelector(id);
      if (t) { ev.preventDefault(); t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }
    });
  });

  // first pass on next frame so initial in-view elements animate from hidden
  requestAnimationFrame(schedule);
  window.addEventListener("load", schedule);
  setTimeout(schedule, 300);
  setTimeout(schedule, 900);
})();
