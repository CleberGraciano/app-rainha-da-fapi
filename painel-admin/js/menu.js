document.getElementById("menu-toggle").addEventListener("click", function () {
  document.getElementById("menu").classList.toggle("active");
});






function renderMenu() {
  const cpf = sessionStorage.getItem("cpf");
  const isAdmin = sessionStorage.getItem("admin") === "true";

  const menuContainer = document.getElementById("menu-container");
  if (!menuContainer) return;

  menuContainer.innerHTML = "";

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "menu-toggle";
  toggleBtn.id = "menu-toggle";
  toggleBtn.innerHTML = "&#9776;";

  const nav = document.createElement("nav");
  nav.id = "menu";
  nav.className = "menu";

  if (cpf) {
    if (isAdmin) {
      const links = [
        { href: "apresentacao.html", text: "Início" },
        { href: "categorias.html", text: "Categorias" },
        { href: "participantes.html", text: "Participantes" },
        { href: "usuario.html", text: "Usuarios" },
        { href: "jurados.html", text: "Jurados" },
        { href: "avaliacao.html", text: "Tipo Avaliação" },
        { href: "relatorio.html", text: "Relatório Ranking" },
        { href: "https://clebergraciano.github.io/app-rainha-da-fapi/", text: "Acesso Portal Votação" },
        { href: "#", onclick:"resetarPontuacoes()", text: "Resetar Pontuações" },
        { href: "#", onclick:"logout()", text: "Sair" },
      ];

      links.forEach(item => {
        const link = document.createElement("a");
        link.href = item.href;
        link.innerText = item.text;
        nav.appendChild(link);
      });
    } else {
      const link = document.createElement("a");
      link.href = "usuario.html";
      link.innerText = "Cadastro de Usuário";
      nav.appendChild(link);
    }

    // Botão de logout visível quando logado
    const logoutBtn = document.createElement("a");
    logoutBtn.href = "#";
    logoutBtn.innerText = "Sair";
    logoutBtn.onclick = logout;
    logoutBtn.style.color = "red";
    nav.appendChild(logoutBtn);
  }

  menuContainer.appendChild(toggleBtn);
  menuContainer.appendChild(nav);
}







function logout() {
  sessionStorage.clear();
  window.location.href = "index.html";
}



    function resetarPontuacoes() {
      if (confirm("Tem certeza que deseja resetar todas as pontuações?")) {
        fetch(`${API_BASE_URL}/admin/reset-pontuacoes`, {
          method: 'POST'
        })
        .then(response => response.text())
        .then(data => alert(data))
        .catch(error => alert("Erro ao resetar pontuações: " + error));
      }
    }
