// /admin/admin.js
const loginPanel = document.getElementById("loginPanel");
const navPanel = document.getElementById("navPanel");
const btnLogin = document.getElementById("btnLogin");
const btnSignOut = document.getElementById("btnSignOut");
const btnTheme = document.getElementById("btnTheme");
const whoami = document.getElementById("whoami");
const loginMsg = document.getElementById("loginMsg");

const tableSelect = document.getElementById("tableSelect");
const btnRefresh = document.getElementById("btnRefresh");
const btnNew = document.getElementById("btnNew");
const searchInput = document.getElementById("search");
const onlyPublished = document.getElementById("onlyPublished");
const statusEl = document.getElementById("status");
const thead = document.getElementById("thead");
const tbody = document.getElementById("tbody");

// Modal
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalSub = document.getElementById("modalSub");
const formArea = document.getElementById("formArea");
const btnClose = document.getElementById("btnClose");
const btnSave = document.getElementById("btnSave");
const btnDelete = document.getElementById("btnDelete");
const modalMsg = document.getElementById("modalMsg");

const TABLES = [
  { name: "cms_divisions", label: "Divisions", orderBy: "sort_order", cols: ["title","slug","is_published","updated_at"] },
  { name: "cms_leadership", label: "Leadership", orderBy: "sort_order", cols: ["full_name","position","rank_group","is_published","updated_at"] },
  { name: "cms_fleet", label: "Fleet", orderBy: "sort_order", cols: ["operator","aircraft_name","status","is_published","updated_at"] },
  { name: "cms_timeline", label: "History Timeline", orderBy: "milestone_date", cols: ["milestone_date","title","is_published","updated_at"] },
  { name: "cms_faq", label: "FAQ", orderBy: "sort_order", cols: ["category","question","is_published","updated_at"] },
  { name: "cms_news", label: "Newsroom", orderBy: "created_at", cols: ["title","slug","published_date","is_published","updated_at"] },
  { name: "cms_media", label: "Media Center", orderBy: "sort_order", cols: ["media_type","title","is_published","updated_at"] },
  { name: "cms_innovations", label: "Innovations", orderBy: "sort_order", cols: ["title","status","is_published","updated_at"] }
];

const FORMS = {
  cms_divisions: [
    ["slug","text"],["title","text"],["short_description","textarea"],["hover_description","textarea"],
    ["long_description","textarea"],["logo_url","text"],
    ["link1_label","text"],["link1_url","text"],
    ["link2_label","text"],["link2_url","text"],
    ["link3_label","text"],["link3_url","text"],
    ["sort_order","number"],["is_published","checkbox"]
  ],
  cms_leadership: [
    ["full_name","text"],["position","text"],
    ["rank_group","select",["Board of Directors","Executive Board (C-Suite)"]],
    ["department","text"],["profile_photo_url","text"],
    ["first_person_blurb","textarea"],["sort_order","number"],["is_published","checkbox"]
  ],
  cms_fleet: [
    ["operator","select",["PTFS","ROAV"]],
    ["aircraft_name","text"],["image_url","text"],["description","textarea"],
    ["status","select",["Operational","Out of Service","Maintenance","Planned"]],
    ["sort_order","number"],["is_published","checkbox"]
  ],
  cms_timeline: [
    ["milestone_date","date"],["title","text"],["description","textarea"],
    ["sort_order","number"],["is_published","checkbox"]
  ],
  cms_faq: [
    ["category","text"],["question","textarea"],["answer","textarea"],
    ["sort_order","number"],["is_published","checkbox"]
  ],
  cms_news: [
    ["slug","text"],["title","text"],["summary","textarea"],["body","textarea"],
    ["cover_image_url","text"],["published_date","date"],["is_published","checkbox"]
  ],
  cms_media: [
    ["media_type","select",["Image","Video","Document","Link"]],
    ["title","text"],["url","text"],["thumbnail_url","text"],["description","textarea"],
    ["sort_order","number"],["is_published","checkbox"]
  ],
  cms_innovations: [
    ["title","text"],
    ["status","select",["In Development","Testing","Released","Paused"]],
    ["summary","textarea"],["details","textarea"],["image_url","text"],
    ["sort_order","number"],["is_published","checkbox"]
  ],
};

let currentTable = TABLES[0].name;
let rowsCache = [];
let currentRow = null;

init();

function init(){
  // Theme (admin-only): store separate preference
  const stored = localStorage.getItem("egr_admin_theme") || "dark";
  document.body.classList.toggle("light", stored === "light");
  btnTheme.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light");
    localStorage.setItem("egr_admin_theme", isLight ? "light" : "dark");
  });

  tableSelect.innerHTML = TABLES.map(t => `<option value="${t.name}">${t.label}</option>`).join("");
  tableSelect.value = currentTable;

  btnLogin.addEventListener("click", doLogin);
  btnSignOut.addEventListener("click", () => window.sb?.auth.signOut());
  btnRefresh.addEventListener("click", loadTable);
  btnNew.addEventListener("click", () => openEditor(null));
  tableSelect.addEventListener("change", () => { currentTable = tableSelect.value; loadTable(); });
  searchInput.addEventListener("input", renderTable);
  onlyPublished.addEventListener("change", renderTable);

  btnClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e)=>{ if(e.target === modal) closeModal(); });
  btnSave.addEventListener("click", saveCurrent);
  btnDelete.addEventListener("click", deleteCurrent);

  if(!window.sb){
    loginMsg.textContent = "Supabase not configured. Update /assets/js/config.js";
    statusEl.textContent = "Supabase not configured.";
    return;
  }

  window.sb.auth.getSession().then(({data}) => setSessionUI(data.session));
  window.sb.auth.onAuthStateChange((_ev, session) => setSessionUI(session));
}

function setSessionUI(session){
  const signedIn = !!session?.user;
  if(signedIn){
    whoami.textContent = session.user.email;
    btnSignOut.classList.remove("hidden");
    loginPanel.style.display = "none";
    navPanel.style.display = "block";
    loadTable();
  } else {
    whoami.textContent = "Not signed in";
    btnSignOut.classList.add("hidden");
    loginPanel.style.display = "block";
    navPanel.style.display = "none";
    rowsCache = [];
    renderTable();
    statusEl.textContent = "Sign in to manage content.";
  }
}

async function doLogin(){
  loginMsg.textContent = "";
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  if(!email || !password){
    loginMsg.textContent = "Email and password are required.";
    return;
  }
  const { error } = await window.sb.auth.signInWithPassword({ email, password });
  if(error) loginMsg.textContent = error.message;
}

function tableMeta(name){ return TABLES.find(t => t.name === name); }

async function loadTable(){
  statusEl.textContent = "Loading…";
  const meta = tableMeta(currentTable);
  let q = window.sb.from(currentTable).select("*");

  if(meta.orderBy === "milestone_date"){
    q = q.order(meta.orderBy, { ascending: true });
  } else if(meta.orderBy === "created_at"){
    q = q.order(meta.orderBy, { ascending: false });
  } else {
    q = q.order(meta.orderBy, { ascending: true }).order("updated_at", { ascending: false });
  }

  const { data, error } = await q;
  if(error){
    statusEl.textContent = `Error: ${error.message}`;
    rowsCache = [];
    renderTable();
    return;
  }
  rowsCache = data || [];
  statusEl.textContent = `Loaded ${rowsCache.length} records from ${meta.label}.`;
  renderTable();
}

function renderTable(){
  const meta = tableMeta(currentTable);
  const q = (searchInput.value || "").trim().toLowerCase();
  const pubOnly = !!onlyPublished.checked;

  let rows = [...rowsCache];
  if(pubOnly) rows = rows.filter(r => r.is_published === true);
  if(q) rows = rows.filter(r => JSON.stringify(r).toLowerCase().includes(q));

  const cols = ["id", ...meta.cols, "actions"];
  thead.innerHTML = `<tr>${cols.map(c => `<th>${escapeHtml(c)}</th>`).join("")}</tr>`;

  tbody.innerHTML = rows.map(r => {
    const cells = ["id", ...meta.cols].map(c => `<td>${formatCell(r[c])}</td>`).join("");
    return `
      <tr>
        ${cells}
        <td>
          <div class="row">
            <button class="btn" data-edit="${r.id}">Edit</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll("[data-edit]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-edit");
      const row = rowsCache.find(x => x.id === id);
      openEditor(row);
    });
  });
}

function openEditor(row){
  currentRow = row ? { ...row } : null;
  const meta = tableMeta(currentTable);
  modalTitle.textContent = row ? `Edit: ${meta.label}` : `New: ${meta.label}`;
  modalSub.textContent = currentTable;
  btnDelete.classList.toggle("hidden", !row);
  modalMsg.textContent = "";

  const fields = FORMS[currentTable] || [];
  formArea.innerHTML = fields.map(([key,type,opts]) => renderField(key,type,opts,row)).join("");
  modal.classList.remove("hidden");
}

function closeModal(){
  modal.classList.add("hidden");
  currentRow = null;
}

function getVal(key,type){
  const el = document.getElementById(`f_${key}`);
  if(!el) return null;
  if(type === "checkbox") return !!el.checked;
  if(type === "number"){
    const n = el.value === "" ? null : Number(el.value);
    return Number.isFinite(n) ? n : null;
  }
  return el.value === "" ? null : el.value;
}

async function saveCurrent(){
  modalMsg.textContent = "Saving…";
  const fields = FORMS[currentTable] || [];
  const payload = {};
  for(const [key,type] of fields) payload[key] = getVal(key,type);

  if((currentTable === "cms_divisions" || currentTable === "cms_news") && !payload.slug){
    modalMsg.textContent = "slug is required.";
    return;
  }

  const op = currentRow?.id
    ? window.sb.from(currentTable).update(payload).eq("id", currentRow.id)
    : window.sb.from(currentTable).insert(payload);

  const { error } = await op;
  if(error){
    modalMsg.textContent = `Error: ${error.message}`;
    return;
  }
  modalMsg.textContent = "Saved.";
  await loadTable();
  closeModal();
}

async function deleteCurrent(){
  if(!currentRow?.id) return;
  modalMsg.textContent = "Deleting…";
  const { error } = await window.sb.from(currentTable).delete().eq("id", currentRow.id);
  if(error){
    modalMsg.textContent = `Error: ${error.message}`;
    return;
  }
  modalMsg.textContent = "Deleted.";
  await loadTable();
  closeModal();
}

function renderField(key,type,opts,row){
  const val = row ? row[key] : null;

  if(type === "textarea"){
    return `
      <div class="field">
        <label>${escapeHtml(key)}</label>
        <textarea id="f_${escapeAttr(key)}" placeholder="${escapeAttr(key)}">${escapeHtml(val ?? "")}</textarea>
      </div>
    `;
  }
  if(type === "checkbox"){
    const checked = val === true ? "checked" : "";
    return `
      <div class="field">
        <label>${escapeHtml(key)}</label>
        <label class="chk"><input id="f_${escapeAttr(key)}" type="checkbox" ${checked}/> ${escapeHtml(key)}</label>
      </div>
    `;
  }
  if(type === "select"){
    const options = (opts || []).map(o => {
      const selected = (val === o) ? "selected" : "";
      return `<option value="${escapeAttr(o)}" ${selected}>${escapeHtml(o)}</option>`;
    }).join("");
    return `
      <div class="field">
        <label>${escapeHtml(key)}</label>
        <select id="f_${escapeAttr(key)}">${options}</select>
      </div>
    `;
  }
  const inputType = (type === "date") ? "date" : (type === "number" ? "number" : "text");
  const v2 = (type === "date" && val) ? String(val) : (val ?? "");
  return `
    <div class="field">
      <label>${escapeHtml(key)}</label>
      <input id="f_${escapeAttr(key)}" type="${inputType}" value="${escapeAttr(v2)}" placeholder="${escapeAttr(key)}"/>
    </div>
  `;
}

function formatCell(v){
  if(v === null || v === undefined) return `<span class="muted">—</span>`;
  if(typeof v === "boolean") return v ? "true" : "false";
  if(typeof v === "object") return `<span class="muted">${escapeHtml(JSON.stringify(v))}</span>`;
  return escapeHtml(String(v));
}

function escapeHtml(s){
  return String(s ?? "")
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function escapeAttr(s){ return escapeHtml(s); }
