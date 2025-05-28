   if (!sessionStorage.getItem("cpf")) {
    window.location.href = "index.html";
  } else {
   
   const apiUrlCatego = `${API_BASE_URL}/categorias`;

    const form = document.getElementById('categoriaForm');
    const inputId = document.getElementById('categoriaId');
    const inputNome = document.getElementById('categoriaNome');
    const inputIdadeInicial= document.getElementById('categoriaIdadeInicial');
    const inputIdadeFinal = document.getElementById('categoriaIdadeFinal');
    const tabela = document.getElementById('tabelaCategorias');
    const btnCancelar = document.getElementById('btnCancelar');

    // Carregar categorias da API
    function carregarCategori() {
      fetch(apiUrlCatego)
        .then(res => res.json())
        .then(data => {
          tabela.innerHTML = '';
          data.forEach(cat => {
            tabela.innerHTML += `
              <tr>
                <td>${cat.id}</td>
                <td>${cat.nome}</td>
                <td>${cat.idadeInicial}</td>
                <td>${cat.idadeFinal}</td>
                <td>
                  <button class="btn btn-sm btn-warning" onclick="editarCategoria(${cat.id})">Editar</button>
                  <button class="btn btn-sm btn-danger" onclick="excluirCategoria(${cat.id})">Excluir</button>
                </td>
              </tr>
            `;
          });
        })
        .catch(err => alert('Erro ao carregar categorias: ' + err));
    }

    // Salvar categoria (create ou update)
    form.addEventListener('submit', e => {
      e.preventDefault();

      const id = inputId.value;
      const nome = inputNome.value.trim();
      const idadeInicial = inputIdadeInicial.value.trim();
      const idadeFinal = inputIdadeFinal.value.trim();

      if (!nome && !idadeInicial && !idadeFinal)  {
        alert('Campo é obrigatório');
        return;
      }

      const method = id ? 'PUT' : 'POST';
      const url = id ? `${apiUrlCatego}/${id}` : apiUrlCatego;

      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, idadeInicial, idadeFinal })
      })
        .then(res => {
          if (!res.ok) throw new Error('Erro na resposta da API');
          return res.json();
        })
        .then(() => {
          carregarCategori();
          form.reset();
          inputId.value = '';
        })
        .catch(err => alert('Erro ao salvar categoria: ' + err));
    });

    // Editar categoria (buscar dados e preencher o formulário)
    function editarCategoria(id) {
      fetch(`${apiUrlCatego}/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Categoria não encontrada');
          return res.json();
        })
        .then(cat => {
          inputId.value = cat.id;
          inputNome.value = cat.nome;
          inputIdadeInicial.value = cat.idadeInicial;
          inputIdadeFinal.value = cat.idadeFinal;
          carregarCategori();
        })
        .catch(err => alert(err));
    }

    // Excluir categoria
    function excluirCategoria(id) {
    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
        fetch(`${API_BASE_URL}/categorias/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                alert("Categoria excluída com sucesso!");
                carregarCategori(); // Função que recarrega a lista
            } else if (response.status === 409) {
                // Conflito: categoria em uso
                return response.text().then(msg => {
                    alert(msg); // Exibe a mensagem enviada pela API
                });
            } else {
                alert("Erro ao excluir a categoria.");
            }
        })
        .catch(error => {
            console.error("Erro na requisição:", error);
            alert("Erro na conexão com o servidor.");
        });
    }
}

    // Cancelar edição
    btnCancelar.addEventListener('click', () => {
      form.reset();
      inputId.value = '';
    });

    // Inicializa a lista
    carregarCategori();

     document.addEventListener("DOMContentLoaded", renderMenu);


}


    