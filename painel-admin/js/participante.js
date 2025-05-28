if (!sessionStorage.getItem("cpf")) {
    window.location.href = "index.html";
  } else {
const API_PARTICIPANTES = `${API_BASE_URL}/participantes`;
    const API_CATEGORIAS = `${API_BASE_URL}/categorias`;

    document.addEventListener("DOMContentLoaded", () => {
      carregarCategorias();
      carregarParticipantes();

      document.getElementById("formParticipante").addEventListener("submit", salvarParticipante);
      document.getElementById("imagem").addEventListener("change", converterImagemParaBase64);
    });

    function carregarCategorias(callback) {
      fetch(API_CATEGORIAS)
        .then(res => res.json())
        .then(categorias => {
          const select = document.getElementById("categoria");
          select.innerHTML = '<option value="">Selecione</option>';
          categorias.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat.id;
            opt.textContent = cat.nome;
            select.appendChild(opt);
          });
          if (callback) callback();
        });
    }

    function limparFormulario() {
      document.getElementById('formParticipante').reset();
      document.getElementById('idEditar').value = '';
      imagemBase64 = '';
      document.getElementById('preview').classList.add('d-none');
      document.getElementById('preview').src = '';
    }

    function carregarParticipantes() {
      fetch(API_PARTICIPANTES)
        .then(res => res.json())
        .then(participantes => {
          const tabela = document.getElementById("tabelaParticipantes");
          tabela.innerHTML = "";
          participantes.forEach(p => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
              <td hidden><img class="imagem-preview" src="data:image/jpeg;base64,${p.imagem || ''}" /></td>
              <td>${p.codigo}</td>
              <td>${p.nome}</td>
              <td>${p.idade}</td>
              <td hidden>${p.altura}</td>
              <td>${p.sexo}</td>
              <td>${p.categoria?.nome || ""}</td>
              <td>
                <button class="btn btn-primary btn-sm" onclick="editarParticipante(${p.id})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deletarParticipante(${p.id})">Excluir</button>
              </td>
            `;
            tabela.appendChild(tr);
          });
        });
    }

    function salvarParticipante(event) {
      event.preventDefault();

      const participante = {
        nome: document.getElementById("nome").value,
        codigo: document.getElementById("codigo").value,
        idade: parseInt(document.getElementById("idade").value),
        altura: document.getElementById("altura").value,
        sexo: document.getElementById("sexo").value,
        imagem: document.getElementById("imagemBase64").value,
        categoriaId: parseInt(document.getElementById("categoria").value)
      };

      const id = document.getElementById("participanteId").value;
      const url = id ? `${API_PARTICIPANTES}/${id}` : API_PARTICIPANTES;
      const metodo = id ? "PUT" : "POST";

      fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(participante)
      }).then(() => {
        document.getElementById("formParticipante").reset();
        document.getElementById("participanteId").value = "";
        carregarParticipantes();
      });
    }

    function editarParticipante(id) {
      fetch(`${API_PARTICIPANTES}/${id}`)
        .then(res => res.json())
        .then(data => {
          document.getElementById("participanteId").value = data.id;
          document.getElementById("nome").value = data.nome;
          document.getElementById("codigo").value = data.codigo;
          document.getElementById("idade").value = data.idade;
          document.getElementById("altura").value = data.altura;
          document.getElementById("sexo").value = data.sexo;
          document.getElementById("imagemBase64").value = data.imagem;

          imagemBase64 = data.imagem;

          const preview = document.getElementById('preview');
          preview.src = `data:image/jpeg;base64,${data.imagem}`;
          preview.classList.remove('d-none');

          carregarCategorias(() => {
            document.getElementById("categoria").value = data.categoria?.id || "";
          });
        });
    }

    function deletarParticipante(id) {
      if (confirm("Deseja realmente excluir este participante?")) {
        fetch(`${API_PARTICIPANTES}/${id}`, { method: "DELETE" })
          .then(() => carregarParticipantes());
      }
    }

    function converterImagemParaBase64(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        document.getElementById("imagemBase64").value = reader.result.split(",")[1];
      };
      if (file) {
        reader.readAsDataURL(file);
      }
    }

  }