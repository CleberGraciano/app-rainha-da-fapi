if (!sessionStorage.getItem("cpf")) {
    window.location.href = "index.html";
  } else {
function login() {
  const cpf = document.getElementById("cpf").value;

  fetch(`${API_BASE_URL}/usuarios/verifica-admin/${cpf}`)
    .then(res => {
      if (!res.ok) throw new Error("CPF não encontrado ou erro na verificação");
      return res.json();
    })
    .then(data => {
      const menuSection = document.getElementById("menu-section");
      const menuContainer = document.getElementById("menu-container"); // Assuma que existe um container com esse ID
      menuSection.style.display = "block";
      menuContainer.innerHTML = ""; // Limpa qualquer conteúdo anterior

      const toggleBtn = document.createElement("button");
      toggleBtn.className = "menu-toggle";
      toggleBtn.id = "menu-toggle";
      toggleBtn.innerHTML = "&#9776;";

      const nav = document.createElement("nav");
      nav.id = "menu";
      nav.className = "menu";

      if (data.admin) {
        const links = [
          { href: "index.html", text: "Início" },
          { href: "categorias.html", text: "Categorias" },
          { href: "participantes.html", text: "Participantes" },
          { href: "jurados.html", text: "Jurados" },
          { href: "avaliacao.html", text: "Tipo Avaliação" },
          { href: "relatorio.html", text: "Relatório Ranking" },
          { href: "../../index.html", text: "Acesso Portal Votação" },
          { href: "#", text: "Contato" }
        ];

        links.forEach(item => {
          const link = document.createElement("a");
          link.href = item.href;
          link.innerText = item.text;
          nav.appendChild(link);
        });

      } else {
        const link = document.createElement("a");
        link.href = "cadastro-usuario.html"; // Assuma que esta é a URL para o cadastro
        link.innerText = "Cadastro de Usuário";
        nav.appendChild(link);
      }

      menuContainer.appendChild(toggleBtn);
      menuContainer.appendChild(nav);
    })
    .catch(err => alert(err.message));
}

function logout() {
  sessionStorage.clear();
  window.location.href = "index.html";
}



    function resetarPontuacoes() {
      if (confirm("Tem certeza que deseja resetar todas as pontuações?")) {
        fetch('https://www.rainhadafapi2025.shop/admin/reset-pontuacoes', {
          method: 'POST'
        })
        .then(response => response.text())
        .then(data => alert(data))
        .catch(error => alert("Erro ao resetar pontuações: " + error));
      }
    }
  }