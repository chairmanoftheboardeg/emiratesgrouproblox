/* EGR Website JS (Vanilla) */
(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const SITE_VERSION = "1.5";
  const SITE_UPDATED = "7 Feb 2026";

  // ---------------------------------------------------------------------------
  // Theme
  // ---------------------------------------------------------------------------
  const themeKey = "egr-theme";
  function applyTheme(theme){
    document.documentElement.classList.toggle("theme-dark", theme === "dark");
    const btn = $("#themeToggle");
    if(btn){
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      const label = btn.querySelector(".label");
      if(label) label.textContent = theme === "dark" ? "Dark" : "Light";
    }
  }
  const savedTheme = localStorage.getItem(themeKey) || "light";
  applyTheme(savedTheme);

  window.toggleTheme = function(){
    const next = document.documentElement.classList.contains("theme-dark") ? "light" : "dark";
    localStorage.setItem(themeKey, next);
    applyTheme(next);
  };

  // ---------------------------------------------------------------------------
  // Mobile nav
  // ---------------------------------------------------------------------------
  window.toggleMobileMenu = function(){
    const menu = $("#mobileMenu");
    if(!menu) return;
    menu.classList.toggle("open");
  };

  // ---------------------------------------------------------------------------
  // Inject navbar/footer (partials)
  // ---------------------------------------------------------------------------
  async function injectPartials(){
    const navHost = $("#navHost");
    const footerHost = $("#footerHost");

    try{
      if(navHost){
        const res = await fetch("/partials/nav.html", {cache:"no-cache"});
        navHost.innerHTML = await res.text();
      }
      if(footerHost){
        const res = await fetch("/partials/footer.html", {cache:"no-cache"});
        footerHost.innerHTML = await res.text();
      }
    }catch(e){
      // Fail open: site should still render page content even if partials fail.
      console.warn("Partials failed to load", e);
    }

    startReveal();
    updateDubaiFooter();
    initAccordions();
    initDropdowns();
    updateBuildInfo();
  }


  // ---------------------------------------------------------------------------
  // Footer: build info (version + last updated)
  // ---------------------------------------------------------------------------
  function updateBuildInfo(){
    const v = document.getElementById("siteVersion");
    const u = document.getElementById("siteUpdated");
    if(v) v.textContent = SITE_VERSION;
    if(u) u.textContent = SITE_UPDATED;
  }

  // ---------------------------------------------------------------------------
  // Reveal-on-scroll
  // ---------------------------------------------------------------------------
  function startReveal(){
    const els = $$(".reveal");
    if(!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if(en.isIntersecting){
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
  }

  // ---------------------------------------------------------------------------
  // Loading overlay (Home)
  // ---------------------------------------------------------------------------
  function initLoading(){
    const loading = document.getElementById("loading");
    if(!loading) return;

    const hide = () => {
      if(loading.classList.contains("hidden")) return;
      loading.classList.add("hidden");
    };

    window.addEventListener("load", () => setTimeout(hide, 160), { once:true });
    document.addEventListener("DOMContentLoaded", () => setTimeout(hide, 900), { once:true });
    setTimeout(hide, 3200);
  }

  // ---------------------------------------------------------------------------
  // Home hero rotation
  // ---------------------------------------------------------------------------
  const HOME_HERO_IMAGES = [
    "/pictures/A350 New Pics.png",
    "/pictures/EGR Headquarters Pic.png",
    "/pictures/Emirates Roav Boeing 777 Cabin Economy.png",
    "/pcitures/b737 3.png",
    "/pictures/occ office.png",
    "/pictures/A350 New Pics2.png"
  ];

  function initHomeHero(){
    const hero = document.getElementById("hero");
    if(!hero) return;

    const images = HOME_HERO_IMAGES.filter(Boolean);
    if(!images.length) return;

    const a = document.createElement("div");
    const b = document.createElement("div");
    a.className = "hero-bg layer a";
    b.className = "hero-bg layer b";
    hero.prepend(b);
    hero.prepend(a);

    let idx = 0;
    let showingA = true;

    function setBg(layer, url){
      layer.style.backgroundImage = `url('${url}')`;
    }

    function swap(){
      idx = (idx + 1) % images.length;
      const nextUrl = images[idx];
      const incoming = showingA ? b : a;
      const outgoing = showingA ? a : b;

      setBg(incoming, nextUrl);
      incoming.classList.add("show");
      outgoing.classList.remove("show");
      showingA = !showingA;
    }

    // Start with first image
    setBg(a, images[0]);
    a.classList.add("show");

    // Preload next image to minimise flicker
    const preload = (url) => {
      const img = new Image();
      img.src = url;
      return img;
    };
    images.slice(0,3).forEach(preload);

    setInterval(swap, 6500);
  }

  // ---------------------------------------------------------------------------
  // Footer: Dubai local time + HQ open/closed + operations 24/7
  // ---------------------------------------------------------------------------
  function updateDubaiFooter(){
    const timeEl = document.getElementById("dubaiTime");
    const hqPill = document.getElementById("hqPill");
    const opsPill = document.getElementById("opsPill");

    function tick(){
      const now = new Date();
      const fmt = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dubai",
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      const parts = fmt.formatToParts(now);
      const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
      const display = `${map.weekday}, ${map.day} ${map.month} ${map.year} • ${map.hour}:${map.minute}:${map.second}`;
      if(timeEl) timeEl.textContent = display;

      const hh = parseInt(map.hour, 10);
      const mm = parseInt(map.minute, 10);
      const minutes = (hh * 60) + mm;
      const openStart = 6 * 60;      // 06:00
      const openEnd = (22 * 60) + 30; // 22:30
      const isOpen = minutes >= openStart && minutes <= openEnd;

      if(hqPill){
        hqPill.classList.toggle("open", isOpen);
        hqPill.classList.toggle("closed", !isOpen);
        const label = hqPill.querySelector(".label");
        const detail = hqPill.querySelector(".detail");
        if(label) label.textContent = isOpen ? "HQ Open" : "HQ Closed";
        if(detail) detail.textContent = "HQ hours: 06:00–22:30 Dubai";
      }

      if(opsPill){
        const label = opsPill.querySelector(".label");
        const detail = opsPill.querySelector(".detail");
        if(label) label.textContent = "Operations 24/7";
        if(detail) detail.textContent = "Dubai time";
      }
    }

    tick();
    setInterval(tick, 1000);
  }

  // ---------------------------------------------------------------------------
  // Accordions (FAQ)
  // ---------------------------------------------------------------------------
  function initAccordions(){
    const items = $$(".acc");
    if(!items.length) return;
    items.forEach(item => {
      const btn = item.querySelector(".acc-btn");
      if(!btn) return;
      btn.addEventListener("click", () => item.classList.toggle("open"));
    });
  }

  // ---------------------------------------------------------------------------
  // Navbar dropdowns (desktop)
  // ---------------------------------------------------------------------------
  function initDropdowns(){
    const dropdowns = $$(".dropdown");
    if(!dropdowns.length) return;

    function closeAll(){
      dropdowns.forEach(dd => {
        dd.classList.remove("open");
        const btn = dd.querySelector(".dropbtn");
        if(btn) btn.setAttribute("aria-expanded", "false");
      });
    }

    dropdowns.forEach(dd => {
      const btn = dd.querySelector(".dropbtn");
      if(!btn) return;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = dd.classList.toggle("open");
        btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        dropdowns.forEach(other => {
          if(other === dd) return;
          other.classList.remove("open");
          const ob = other.querySelector(".dropbtn");
          if(ob) ob.setAttribute("aria-expanded", "false");
        });
      });
    });

    document.addEventListener("click", closeAll);
    document.addEventListener("keydown", (e) => {
      if(e.key === "Escape") closeAll();
    });
  }

  // ---------------------------------------------------------------------------
  // Fleet tabs helper (used on /fleet/)
  // ---------------------------------------------------------------------------
  window.setFleet = function(mode){
    const ptfs = document.getElementById("fleetPTFS");
    const roav = document.getElementById("fleetROAV");
    const tabs = $$(".fleet-tab");
    tabs.forEach(t => t.classList.toggle("active", t.getAttribute("data-mode") === mode));
    if(ptfs) ptfs.style.display = (mode === "ptfs") ? "grid" : "none";
    if(roav) roav.style.display = (mode === "roav") ? "grid" : "none";
  };

  // Boot
  injectPartials().then(() => {
    initHomeHero();
    initLoading();
    const fleetPage = document.getElementById("fleetPage");
    if(fleetPage) window.setFleet("ptfs");
  });
})();
