// Arquivo de configuração centralizada
//const API_BASE_URL = '/api';
const API_BASE_URL = 'http://145.79.7.14:8086/api';


function logout() {
sessionStorage.clear();
window.location.href = "index.html";
}

function validaUsuarioJurado() {
  const cpf = sessionStorage.getItem("cpf");

  validaUsuarioAdmin();

  if (!cpf) {
    console.log("CPF não encontrado no sessionStorage.");
    window.location.href = "index.html";
    return;
  }

  const cpfInput = cpf.value.trim();

  fetch(`${API_BASE_URL}/jurados/verificar-cpf/${cpfInput}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Erro na requisição");
      }
      return response.json();
    })
    .then(existe => {
      if (!existe) {
        console.log("CPF não encontrado, redirecionando...");
        window.location.href = "index.html";
      } else {
        console.log("CPF encontrado, acesso permitido.");
        // Continuação do fluxo aqui, se necessário
      }
    })
    .catch(error => {
      console.error("Erro ao verificar CPF:", error);
      window.location.href = "index.html";
    });
}

function validaUsuarioAdmin(){

    if (!sessionStorage.getItem("cpf")) {
        window.location.href = "index.html";
      } else {
      // Chamada para a API para verificar se é admin
      fetch(`${API_BASE_URL}/usuarios/verifica-admin/${sessionStorage.getItem("cpf")}`)
        .then(response => {
          if (!response.ok) {
            throw new Error("Erro ao verificar admin");
          }
          return response.json(); // Espera boolean ou objeto com `admin: true`
        })
        .then(data => {
          const isAdmin = typeof data === "boolean" ? data : data.admin;
          if (isAdmin) {
            const btn = document.getElementById("btnAdmin");
            btn.style.display = "inline-block";
            btn.addEventListener("click", () => {
              window.location.href = "./painel-admin/index.html";
            });
          }
        })
        .catch(error => {
          console.error("Erro na verificação de admin:", error);
        });
    }
    }

