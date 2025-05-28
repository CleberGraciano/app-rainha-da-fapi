if (!sessionStorage.getItem("cpf")) {
    window.location.href = "index.html";
  } else {

const apiUrl = `${API_BASE_URL}/jurados`;

    const formJurado = document.getElementById('juradoForm');
    const idInput = document.getElementById('juradoId');
    const nomeInput = document.getElementById('nomeJurado');
    const telefoneInput = document.getElementById('telefone');
    const cpfInput = document.getElementById('cpf');
    const imagemInput = document.getElementById('imagem');
    const imagemAtualInput = document.getElementById('imagemAtual');
    const tabelaBody = document.querySelector('#tabelaJurados tbody');
    const btnCancelarJurado = document.getElementById('btnCancelar');

    async function listarJurados() {
      tabelaBody.innerHTML = '<tr><td colspan="6">Carregando...</td></tr>';
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error('Erro ao buscar jurados');
        const jurados = await res.json();

        if (jurados.length === 0) {
          tabelaBody.innerHTML = '<tr><td colspan="6">Nenhum jurado encontrado.</td></tr>';
          return;
        }

        tabelaBody.innerHTML = '';
        jurados.forEach(jurado => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${jurado.id}</td>
            <td hidden>${jurado.imagem ? `<img src="${jurado.imagem}" alt="Imagem" />` : ''}</td>
            <td>${jurado.nome}</td>
            <td>${jurado.telefone}</td>
            <td>${jurado.cpf}</td>
            <td>
              <button class="btn btn-sm btn-warning btn-editar" data-id="${jurado.id}">Editar</button>
              <button class="btn btn-sm btn-danger btn-excluir" data-id="${jurado.id}">Excluir</button>
            </td>
          `;
          tabelaBody.appendChild(tr);
        });

        document.querySelectorAll('.btn-editar').forEach(btn => {
          btn.addEventListener('click', () => editarJurado(btn.dataset.id));
        });
        document.querySelectorAll('.btn-excluir').forEach(btn => {
          btn.addEventListener('click', () => excluirJurado(btn.dataset.id));
        });

      } catch (error) {
        tabelaBody.innerHTML = `<tr><td colspan="6">Erro: ${error.message}</td></tr>`;
      }
    }

    function arquivoParaBase64(arquivo) {
      return new Promise((resolve, reject) => {
        if (!arquivo) resolve(null);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(arquivo);
      });
    }

    async function adicionarJurado(jurado) {
      try {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jurado)
        });
        if (!res.ok) throw new Error('Erro ao adicionar jurado');
        await listarJurados();
        formJurado.reset();
      } catch (error) {
        alert(error.message);
      }
    }

    async function editarJurado(id) {
      try {
        const res = await fetch(`${apiUrl}/${id}`);
        if (!res.ok) throw new Error('Erro ao buscar jurado');
        const jurado = await res.json();

        idInput.value = jurado.id;
        nomeInput.value = jurado.nome;
        telefoneInput.value = jurado.telefone;
        cpfInput.value = jurado.cpf;
        imagemAtualInput.value = jurado.imagem || '';
        cpfInput.disabled = true;
        btnCancelarJurado.style.display = 'inline-block';
      } catch (error) {
        alert(error.message);
      }
    }

    async function atualizarJurado(jurado) {
      try {
        const res = await fetch(`${apiUrl}/${jurado.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jurado)
        });
        if (!res.ok) throw new Error('Erro ao atualizar jurado');
        await listarJurados();
        formJurado.reset();
        cpfInput.disabled = false;
        btnCancelarJurado.style.display = 'none';
      } catch (error) {
        alert(error.message);
      }
    }

    async function excluirJurado(id) {
      if (!confirm('Tem certeza que deseja excluir este jurado?')) return;
      try {
        const res = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Erro ao excluir jurado');
        await listarJurados();
      } catch (error) {
        alert(error.message);
      }
    }

    function validarCPF(cpf) {
      cpf = cpf.replace(/[^\d]+/g, '');
      if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

      let soma = 0, resto;
      for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cpf[9])) return false;

      soma = 0;
      for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;

      return resto === parseInt(cpf[10]);
    }

    formJurado.addEventListener('submit', async e => {
      e.preventDefault();

      const id = idInput.value.trim();
      const cpf = cpfInput.value.trim();

      if (!id && !validarCPF(cpf)) {
        alert('CPF inválido. Verifique o número digitado.');
        return;
      }

      const arquivoImagem = imagemInput.files[0];
      let imagemBase64 = imagemAtualInput.value || null;

      if (arquivoImagem) {
        try {
          imagemBase64 = await arquivoParaBase64(arquivoImagem);
        } catch (error) {
          alert('Erro ao ler arquivo de imagem');
          return;
        }
      }

      const jurado = {
        nome: nomeInput.value.trim(),
        telefone: telefoneInput.value.trim(),
        cpf,
        imagem: imagemBase64
      };

      if (id) {
        jurado.id = parseInt(id);
        await atualizarJurado(jurado);
      } else {
        await adicionarJurado(jurado);
      }

      formJurado.reset();
      idInput.value = '';
      imagemAtualInput.value = '';
      cpfInput.disabled = false;
      btnCancelarJurado.style.display = 'none';
    });

    btnCancelar.addEventListener('click', () => {
      formJurado.reset();
      idInput.value = '';
      imagemAtualInput.value = '';
      cpfInput.disabled = false;
      btnCancelarJurado.style.display = 'none';
    });

    cpfInput.addEventListener('click', () => {
      if (cpfInput.disabled) {
        alert('O CPF não pode ser alterado. Este campo é único e fixo.');
      }
    });

    listarJurados();
  }