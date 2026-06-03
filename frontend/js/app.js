// NUTRIBOX — utilitários compartilhados
const API = ""; // mesma origem do Flask

const Storage = {
  get token() { return localStorage.getItem("nbx_token"); },
  set token(v) { v ? localStorage.setItem("nbx_token", v) : localStorage.removeItem("nbx_token"); },
};

async function api(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && Storage.token) headers["Authorization"] = "Bearer " + Storage.token;
  const res = await fetch(API + path, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erro de rede");
  return data;
}

function toast(msg, type = "ok") {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = "toast show " + (type === "error" ? "error" : "");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("show"), 2400);
}

function requireAuth() {
  if (!Storage.token) {
    window.location.href = "/login.html";
    return false;
  }
  return true;
}

function logout() {
  api("/api/signout", { method: "POST", auth: true }).catch(() => {});
  Storage.token = null;
  window.location.href = "/login.html";
}

function fmtCurrency(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("pt-BR",
    { day: "2-digit", month: "short", year: "numeric" });
}
const STATUS_LABELS = {
  pendente: "Pendente", em_preparo: "Em preparo",
  em_rota: "Em rota", entregue: "Entregue",
};

// Header genérico
function renderHeader(target) {
  target.innerHTML = `
    <header class="site-header">
      <div class="inner">
        <a href="/" class="brand">
          <span class="brand-icon">🌱</span>
          <span class="brand-name"><span class="accent">NUTRI</span>BOX</span>
        </a>
        <div class="row">
          <a class="btn btn-ghost" href="/login.html">Entrar</a>
          <a class="btn btn-primary" href="/cadastro.html">Começar agora</a>
        </div>
      </div>
    </header>`;
}
