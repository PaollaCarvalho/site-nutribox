// NUTRIBOX — Layout do dashboard (renderiza sidebar + header)

async function setupDashboard(activeKey) {
  if (!requireAuth()) return null;
  let user;
  try {
    const data = await api("/api/me", { auth: true });
    user = data.user;
  } catch {
    Storage.token = null;
    location.href = "/login.html"; return null;
  }

  const nav = [
    { key: "cardapio", to: "/dashboard.html",  label: "Cardápio", icon: "🥗" },
    { key: "pedidos",  to: "/pedidos.html",    label: "Pedidos",  icon: "📦" },
    { key: "perfil",   to: "/perfil.html",     label: "Perfil",   icon: "👤" },
  ];

  document.body.classList.add("has-dash");
  const root = document.getElementById("app");
  root.innerHTML = `
    <div class="dash">
      <aside class="sidebar">
        <div class="top">
          <a href="/" class="brand">
            <span class="brand-icon">🌱</span>
            <span class="brand-name"><span class="accent">NUTRI</span>BOX</span>
          </a>
        </div>
        <nav>
          ${nav.map(n => `
            <a class="navlink ${n.key===activeKey?"active":""}" href="${n.to}">
              <span>${n.icon}</span><span>${n.label}</span>
            </a>`).join("")}
        </nav>
        <div class="bottom">
          <div class="username">${user.fullName}</div>
          <a class="navlink" href="#" id="logoutLink"><span>↩</span><span>Sair</span></a>
        </div>
      </aside>
      <div class="dash-main">
        <header class="dash-header">
          <h2 style="margin:0;font-size:16px;font-weight:600">
            ${nav.find(n=>n.key===activeKey)?.label || ""}
          </h2>
          <div class="avatar">${user.fullName.charAt(0).toUpperCase()}</div>
        </header>
        <main class="dash-content" id="content"></main>
      </div>
    </div>`;
  document.getElementById("logoutLink").addEventListener("click", (e) => {
    e.preventDefault(); logout();
  });
  return user;
}
