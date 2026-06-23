// NUTRIBOX — Dashboard layout v3 (mobile-first)

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

  const planLabels = { semanal:"Plano Semanal", mensal:"Plano Mensal", anual:"Plano Anual" };
  const planLabel  = planLabels[user.plan] || "Sem plano";

  const nav = [
    { section:"Principal" },
    { key:"inicio",    to:"/inicio.html",       label:"Início",      icon:"🏠" },
    { key:"cardapio",  to:"/dashboard.html",    label:"Cardápio",    icon:"🥗" },
    { key:"receitas",  to:"/receitas.html",     label:"Receitas",    icon:"📋" },
    { section:"Acompanhamento" },
    { key:"progresso", to:"/progresso.html",    label:"Progresso",   icon:"📊" },
    { key:"pedidos",   to:"/pedidos.html",      label:"Pedidos",     icon:"📦" },
    { section:"Conta" },
    { key:"perfil",    to:"/perfil.html",       label:"Perfil",      icon:"👤" },
    { key:"config",    to:"/configuracao.html", label:"Metas",       icon:"🎯" },
  ];

  const topLabels = {
    inicio:"Início", cardapio:"Cardápio da semana",
    receitas:"Receitas", progresso:"Meu progresso",
    pedidos:"Pedidos", perfil:"Meu perfil", config:"Metas nutricionais",
  };

  const mobileNav = [
    { key:"inicio",    to:"/inicio.html",    icon:"🏠", label:"Início"    },
    { key:"cardapio",  to:"/dashboard.html", icon:"🥗", label:"Cardápio"  },
    { key:"receitas",  to:"/receitas.html",  icon:"📋", label:"Receitas"  },
    { key:"progresso", to:"/progresso.html", icon:"📊", label:"Progresso" },
    { key:"pedidos",   to:"/pedidos.html",   icon:"📦", label:"Pedidos"   },
  ];

  document.body.classList.add("has-dash");
  const root = document.getElementById("app");
  root.innerHTML = `
    <div class="dash">
      <!-- Sidebar desktop -->
      <aside class="sidebar">
        <div class="top">
          <a href="/" class="brand">
            <span class="brand-icon">🥗</span>
            <span class="brand-name"><span class="accent">NUTRI</span>BOX</span>
          </a>
        </div>
        <nav>
          ${nav.map(n => {
            if (n.section) return `<div class="nav-section">${n.section}</div>`;
            return `
              <a class="navlink ${n.key===activeKey?"active":""}" href="${n.to}">
                <span class="nav-icon">${n.icon}</span><span>${n.label}</span>
              </a>`;
          }).join("")}
        </nav>
        <div class="bottom">
          <div class="sidebar-user">
            <div class="sidebar-avatar">${user.fullName.charAt(0).toUpperCase()}</div>
            <div class="sidebar-info">
              <div class="name">${user.fullName.split(" ")[0]}</div>
              <div class="plan-tag">${planLabel}</div>
            </div>
          </div>
          <a class="navlink" href="#" id="logoutLink">
            <span class="nav-icon">↩</span><span>Sair</span>
          </a>
        </div>
      </aside>

      <!-- Main -->
      <div class="dash-main">
        <header class="dash-topbar">
          <h2>${topLabels[activeKey] || ""}</h2>
          <div class="row">
            <button class="btn btn-ghost btn-icon notif-dot" style="font-size:17px">🔔</button>
            <div class="dash-avatar">${user.fullName.charAt(0).toUpperCase()}</div>
          </div>
        </header>
        <main class="dash-content" id="content"></main>
      </div>
    </div>

    <!-- Bottom nav mobile -->
    <nav class="mobile-nav">
      ${mobileNav.map(n=>`
        <a href="${n.to}" class="${n.key===activeKey?"active":""}">
          <span class="mn-icon">${n.icon}</span>${n.label}
        </a>`).join("")}
    </nav>`;

  document.getElementById("logoutLink").addEventListener("click", e => { e.preventDefault(); logout(); });
  return user;
}
