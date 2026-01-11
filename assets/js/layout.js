// /assets/js/layout.js
(function(){
  const cfg = window.EGR_CONFIG || {};
  const nav = document.getElementById("siteNav");
  const foot = document.getElementById("siteFooter");

  const path = (location.pathname || "/").replace(/index\.html$/,"");
  const isActive = (p) => path === p || path === (p.endsWith("/")? p : p + "/");

  const links = [
    ["Home","/"],
    ["About Us","/about/"],
    ["Our Divisions","/divisions/"],
    ["Our History","/history/"],
    ["Our Governance","/governance/"],
    ["Our Story","/story/"],
    ["Our Vision","/vision/"],
    ["Our Leadership","/leadership/"],
    ["Our Fleet","/fleet/"],
    ["PTFS","/ptfs/"],
    ["ROAV","/roav/"],
    ["FlyDubai", "/redirects/flydubai/"],
    ["Mission","/mission/"],
    ["Our Innovations","/innovations/"],
    ["Flights","/redirects/flights/"],
    ["Careers","/redirects/careers/"],
    ["Contact Us","/redirects/contact/"],
    ["FAQ","/faq/"],
    ["Safety & Report","/redirects/report/"],
    ["Media Center","/media/"],
    ["Newsroom","/news/"],
    ["Aviation University","/redirects/university/"],
    ["Alliance","/redirects/alliance/"]
  ];

  const social = [
    ["Discord", cfg.discordInviteUrl || "#"],
    ["Instagram", "#"],
    ["Twitter (X)", "#"],
    ["LinkedIn", "#"],
    ["Trello", "#"],
    ["YouTube", "#"]
  ];

  function makeNavLinks(list){
    return list.map(([t,h]) => {
      const active = isActive(h) ? "active" : "";
      return `<a class="${active}" href="${h}">${t}</a>`;
    }).join("");
  }

  function themeInit(){
    const stored = localStorage.getItem("egr_theme");
    if(stored === "dark") document.body.classList.add("theme-dark");
  }
  function themeToggle(){
    document.body.classList.toggle("theme-dark");
    localStorage.setItem("egr_theme", document.body.classList.contains("theme-dark") ? "dark" : "light");
  }

  if(nav){
    nav.innerHTML = `
      <div class="navWrap">
        <div class="container">
          <div class="nav">
            <a class="brand" href="/">
              <img src="/images/logo.png" alt="EGR Logo" />
              <div>
                <div class="t1">Emirates Group Roblox</div>
                <div class="t2">Vision 2026 • Corporate Website</div>
              </div>
            </a>

            <nav class="navLinks" aria-label="Main navigation">
              ${makeNavLinks([
                ["Home","/"],
                ["About Us","/about/"],
                ["Divisions","/divisions/"],
                ["Fleet","/fleet/"],
                ["Newsroom","/news/"],
                ["FAQ","/faq/"]
              ])}
            </nav>

            <div class="navRight">
              <button class="iconBtn" id="themeBtn" title="Toggle black/white theme" aria-label="Toggle theme">
                ☼
              </button>
              <button class="iconBtn hamburger" id="menuBtn" title="Menu" aria-label="Open menu">
                ≡
              </button>
            </div>
          </div>

          <div class="mobilePanel" id="mobilePanel">
            ${links.map(([t,h]) => `<a href="${h}">${t}</a>`).join("")}
          </div>
        </div>
      </div>
    `;

    themeInit();
    const themeBtn = document.getElementById("themeBtn");
    const menuBtn = document.getElementById("menuBtn");
    const mobilePanel = document.getElementById("mobilePanel");
    if(themeBtn) themeBtn.addEventListener("click", themeToggle);
    if(menuBtn) menuBtn.addEventListener("click", () => mobilePanel.classList.toggle("open"));
  }

  if(foot){
    foot.innerHTML = `
      <footer>
        <div class="container">
          <div class="footGrid">
            <div class="footCol">
              <h4>Emirates Group Roblox (EGR)</h4>
              <div class="muted" style="font-size:13px; max-width:360px">
                A virtual aviation organisation dedicated to realism, operational integrity, and technological innovation under Vision 2026.
              </div>
            </div>

            <div class="footCol">
              <h4>Company</h4>
              <a href="/about/">About Us</a>
              <a href="/divisions/">Our Divisions</a>
              <a href="/leadership/">Leadership</a>
              <a href="/fleet/">Fleet</a>
            </div>

            <div class="footCol">
              <h4>Legal</h4>
              <a href="/legal/framework/">Legal, Safety & Compliance Framework</a>
              <a href="/legal/terms/">Website Terms of Service</a>
              <a href="/legal/privacy/">Privacy Policy</a>
              <a href="/sitemap/">Site Map</a>
            </div>

            <div class="footCol">
              <h4>Social</h4>
              ${social.map(([t,h]) => `<a href="${h}" target="_blank" rel="noopener">${t}</a>`).join("")}
              <a href="/admin/" style="margin-top:6px">Admin Login</a>
              <a href="/redirects/staff-login/">Staff Login</a>
            </div>
          </div>

          <div class="fineprint">
            © 2026 Emirates Group Roblox (EGR). All Rights Reserved. Owned & Operated by The Tyler Nicholas Group.<br/>
            Disclaimer: Emirates Group Roblox is a virtual aviation organisation within the Roblox platform. We are an independent entity and are not officially affiliated with, endorsed by, or a subsidiary of the real-world Emirates Airline or The Emirates Group (dnata). All trademarks are the property of their respective owners.
          </div>
        </div>
      </footer>
    `;
  }
})();
