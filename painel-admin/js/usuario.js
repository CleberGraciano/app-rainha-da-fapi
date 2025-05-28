if (!sessionStorage.getItem("cpf")) {
    window.location.href = "index.html";
  } else {

const API_URL = `${API_BASE_URL}/usuarios`;

    function carregarUsuarios() {
      fetch(API_URL)
        .then(res => res.json())
        .then(data => {
          const tbody = document.getElementById("tabela-usuarios");
          tbody.innerHTML = "";
          data.forEach(usuario => {
            const linha = `
              <tr>
                <td>${usuario.id}</td>
                <td>${usuario.nome}</td>
                <td>${usuario.cpf}</td>
                <td>${usuario.admin ? "Sim" : "Não"}</td>
                <td>
                  <button class="btn btn-sm btn-warning" onclick='editarUsuario(${JSON.stringify(usuario)})'>Editar</button>
                  <button class="btn btn-sm btn-danger" onclick="excluirUsuario(${usuario.id})">Excluir</button>
                </td>
              </tr>
            `;
            tbody.innerHTML += linha;
          });
        });
    }

    function salvarUsuario(event) {
      event.preventDefault();
      const id = document.getElementById("id").value;
      const nome = document.getElementById("nome").value;
      const cpf = document.getElementById("cpf").value;
      const admin = document.getElementById("admin").checked;

      const usuario = { nome, cpf, admin };
      const metodo = id ? "PUT" : "POST";
      const url = id ? `${API_URL}/${id}` : API_URL;

      fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
      })
      .then(() => {
        limparFormulario();
        carregarUsuarios();
      });
    }

    function editarUsuario(usuario) {
      document.getElementById("id").value = usuario.id;
      document.getElementById("nome").value = usuario.nome;
      document.getElementById("cpf").value = usuario.cpf;
      document.getElementById("admin").checked = usuario.admin;
    }

    function excluirUsuario(id) {
      if (confirm("Tem certeza que deseja excluir?")) {
        fetch(`${API_URL}/${id}`, { method: "DELETE" })
          .then(() => carregarUsuarios());
      }
    }

    function limparFormulario() {
      document.getElementById("form-usuario").reset();
      document.getElementById("id").value = "";
    }

    document.getElementById("form-usuario").addEventListener("submit", salvarUsuario);
    window.onload = carregarUsuarios;
  }