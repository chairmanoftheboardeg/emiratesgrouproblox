/* EGR Website JS (Vanilla) */
(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Theme
  const themeKey = "egr-theme";
  function applyTheme(theme){
    document.documentElement.classList.toggle("theme-dark", theme === "dark");
    const btn = $("#themeToggle");
    if(btn){
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btn.querySelector(".label").textContent = theme === "dark" ? "Dark" : "Light";
    }
  }
  const savedTheme = localStorage.getItem(themeKey) || "light";
  applyTheme(savedTheme);

  window.toggleTheme = function(){
    const current = document.documentElement.classList.contains("theme-dark") ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem(themeKey, next);
    applyTheme(next);
  };

  // Mobile nav
  window.toggleMobileMenu = function(){
    const menu = $("#mobileMenu");
    if(!menu) return;
    menu.classList.toggle("open");
  };

  // Inject navbar/footer (partials)
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
      // Silent fail: site still works without injected partials
    }

    // After injection: wire buttons and links
    wireDynamicLinks();
    startReveal();
    updateDubaiFooter();
    initAccordions();
  }

  function wireDynamicLinks(){
    if(!window.CONFIG) return;

    // Social links
    const map = {
      aDiscord: CONFIG.links.discord,
      aInstagram: CONFIG.links.instagram,
      aX: CONFIG.links.x,
      aLinkedIn: CONFIG.links.linkedin,
      aTrello: CONFIG.links.trello,
      aYouTube: CONFIG.links.youtube
    };
    Object.entries(map).forEach(([id, url]) => {
      const el = document.getElementById(id);
      if(el && url) el.href = url;
    });

    // Footer legal pdf
    const fw = document.getElementById("frameworkLink");
    if(fw && CONFIG.links.frameworkPdf) fw.href = CONFIG.links.frameworkPdf;

    // Redirect buttons (fallback)
    const redirectBtn = document.getElementById("redirectBtn");
    if(redirectBtn){
      const target = redirectBtn.getAttribute("data-target");
      const url = CONFIG.links[target] || CONFIG.links.discord || "/";
      redirectBtn.href = url;
    }
  }

  // Home hero rotation
  function initHomeHero(){
    const hero = document.getElementById("hero");
    if(!hero || !window.CONFIG) return;
    const images = (CONFIG.home && CONFIG.home.heroImages) ? CONFIG.home.heroImages.filter(Boolean) : [];
    if(!images.length) return;

    const a = document.createElement("div");
    const b = document.createElement("div");
    a.className = "hero-bg active";
    b.className = "hero-bg";
    a.style.backgroundImage = `url('${images[0]}')`;
    b.style.backgroundImage = `url('${images[0]}')`;
    hero.prepend(b);
    hero.prepend(a);

    let i = 0;
    let activeA = true;

    function setNext(){
      i = (i + 1) % images.length;
      const nextUrl = images[i];
      const active = activeA ? a : b;
      const idle = activeA ? b : a;

      idle.style.backgroundImage = `url('${nextUrl}')`;
      idle.classList.add("active");
      active.classList.remove("active");
      activeA = !activeA;
    }

    const ms = (CONFIG.home && CONFIG.home.heroRotationMs) ? CONFIG.home.heroRotationMs : 6500;
    setInterval(setNext, ms);
  }

  // Loading overlay (Home)
  function initLoading(){
    const loading = document.getElementById("loading");
    if(!loading) return;

    // Always show on home; hide after full load
    window.addEventListener("load", () => {
      setTimeout(() => loading.classList.add("hidden"), 250);
    }, { once:true });
  }

  // Reveal on scroll
  function startReveal(){
    const items = $$(".reveal");
    if(!items.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(ent => {
        if(ent.isIntersecting){
          ent.target.classList.add("visible");
          obs.unobserve(ent.target);
        }
      });
    }, { threshold: 0.14 });

    items.forEach(el => obs.observe(el));
  }

  // Accordions
  function initAccordions(){
    $$(".acc-item").forEach(item => {
      const btn = item.querySelector(".acc-btn");
      if(!btn) return;
      btn.addEventListener("click", () => {
        item.classList.toggle("open");
      });
    });
  }

  // Dubai time + HQ status (6:00–22:30 Dubai time)
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
      if(timeEl) timeEl.textContent = fmt.format(now);

      // Determine HQ open
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dubai",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).formatToParts(now);

      let hh = 0, mm = 0;
      parts.forEach(p => {
        if(p.type === "hour") hh = parseInt(p.value, 10);
        if(p.type === "minute") mm = parseInt(p.value, 10);
      });

      const minutes = hh * 60 + mm;
      const openStart = 6 * 60;        // 06:00
      const openEnd = 22 * 60 + 30;    // 22:30

      const isOpen = minutes >= openStart && minutes <= openEnd;

      if(hqPill){
        hqPill.classList.toggle("open", isOpen);
        hqPill.classList.toggle("closed", !isOpen);
        hqPill.querySelector(".label").textContent = isOpen ? "HQ Open" : "HQ Closed";
        hqPill.querySelector(".detail").textContent = "HQ hours: 06:00–22:30 Dubai";
      }
      if(opsPill){
        opsPill.querySelector(".label").textContent = "Operations 24/7";
        opsPill.querySelector(".detail").textContent = "Dubai time";
      }
    }

    tick();
    setInterval(tick, 1000);
  }

  // Redirect page helper
  window.runRedirect = function(targetKey){
    if(!window.CONFIG) return;
    const url = (CONFIG.links && CONFIG.links[targetKey]) ? CONFIG.links[targetKey] : (CONFIG.links.discord || "/");
    // Prefer replace to avoid back button loops
    window.location.replace(url);
  };

  // Fleet tabs
  window.setFleet = function(mode){
    const ptfs = document.getElementById("fleetPTFS");
    const roav = document.getElementById("fleetROAV");
    const tabs = $$(".tab");
    tabs.forEach(t => t.classList.toggle("active", t.getAttribute("data-mode") === mode));
    if(ptfs) ptfs.style.display = (mode === "ptfs") ? "grid" : "none";
    if(roav) roav.style.display = (mode === "roav") ? "grid" : "none";
  };

  // Boot
  injectPartials().then(() => {
    initHomeHero();
    initLoading();
    // default fleet state if page uses it
    const fleetPage = document.getElementById("fleetPage");
    if(fleetPage) window.setFleet("ptfs");
  });
})();
