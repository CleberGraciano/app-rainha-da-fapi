if (!sessionStorage.getItem("cpf")) {
    window.location.href = "index.html";
  } else {

const apiUrlAvaliacao = `${API_BASE_URL}/tipos-avaliacao`;

  document.getElementById("tipoForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const id = document.getElementById("tipoId").value;
    const nome = document.getElementById("nomeAvaliacao").value;

    const tipo = { nome };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${apiUrlAvaliacao}/${id}` : apiUrlAvaliacao;

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tipo)
    })
    .then(() => {
      carregarTipos();
      limparFormularioAvaliacao();
    })
    .catch(error => console.error("Erro ao salvar:", error));
  });

  function carregarTipos() {
    fetch(apiUrlAvaliacao)
      .then(res => res.json())
      .then(data => {
        const tabela = document.getElementById("tipoTabelaBody");
        tabela.innerHTML = "";
        data.forEach(tipo => {
          tabela.innerHTML += `
            <tr>
              <td>${tipo.id}</td>
              <td>${tipo.nome}</td>
              <td>
                <button class="btn btn-sm btn-warning" onclick="editarTipo(${tipo.id})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="excluirTipo(${tipo.id})">Excluir</button>
              </td>
            </tr>
          `;
        });
      });
  }

  function editarTipo(id) {
    fetch(`${apiUrlAvaliacao}/${id}`)
      .then(res => res.json())
      .then(tipo => {
        document.getElementById("tipoId").value = tipo.id;
        document.getElementById("nomeAvaliacao").value = tipo.nome;
      });
  }

  function excluirTipo(id) {
    if (confirm("Deseja realmente excluir este tipo de avaliação?")) {
      fetch(`${apiUrlAvaliacao}/${id}`, { method: 'DELETE' })
        .then(() => carregarTipos())
        .catch(error => alert("Erro ao excluir: " + error.message));
    }
  }

  function limparFormularioAvaliacao() {
    document.getElementById("tipoId").value = "";
    document.getElementById("nomeAvaliacao").value = "";
  }

  // Carregar dados ao abrir a tela
  carregarTipos();
}