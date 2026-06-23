// NUTRIBOX — utilitários v3
const API = "";

const Storage = {
  get token()  { return localStorage.getItem("nbx_token"); },
  set token(v) { v ? localStorage.setItem("nbx_token", v) : localStorage.removeItem("nbx_token"); },
};

async function api(path, { method="GET", body, auth=false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && Storage.token) headers["Authorization"] = "Bearer " + Storage.token;
  const res = await fetch(API + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erro de rede");
  return data;
}

function toast(msg, type = "ok") {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<span class="toast-icon"></span><span class="toast-text"></span>`;
    document.body.appendChild(el);
  }
  const icon = type === "error" ? "❌" : "✅";
  el.querySelector(".toast-icon").textContent = icon;
  el.querySelector(".toast-text").textContent = msg;
  el.className = "toast show " + (type === "error" ? "error" : "");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("show"), 2800);
}

function requireAuth() {
  if (!Storage.token) { window.location.href = "/login.html"; return false; }
  return true;
}
function logout() {
  api("/api/signout", { method:"POST", auth:true }).catch(()=>{});
  Storage.token = null;
  window.location.href = "/login.html";
}
function fmtCurrency(v) { return v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }
function fmtDate(iso)    { return new Date(iso).toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"}); }
function calcKcal(p,c,f) { return Math.round(p*4 + c*4 + f*9); }

const STATUS_LABELS = { pendente:"Pendente", em_preparo:"Em preparo", em_rota:"Em rota", entregue:"Entregue" };
const STATUS_ICONS  = { pendente:"🕐", em_preparo:"🍳", em_rota:"🛵", entregue:"✅" };

function renderHeader(target) {
  target.innerHTML = `
    <header class="site-header">
      <div class="inner">
        <a href="/" class="brand">
          <span class="brand-icon">🥗</span>
          <span class="brand-name"><span class="accent">NUTRI</span>BOX</span>
        </a>
        <nav>
          <a class="nav-link" href="/#missao">Missão</a>
          <a class="nav-link" href="/#como-funciona">Como funciona</a>
          <a class="nav-link" href="/#planos">Planos</a>
        </nav>
        <div class="header-actions">
          <a class="btn btn-ghost btn-sm" href="/login.html">Entrar</a>
          <a class="btn btn-primary btn-sm" href="/cadastro.html">Começar →</a>
        </div>
      </div>
    </header>`;
}
