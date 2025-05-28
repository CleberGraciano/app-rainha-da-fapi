
const tiposUrl = `${API_BASE_URL}/tipos-avaliacao`;
    const avaliacoesContainer = document.getElementById('avaliacoes');
    const participanteId = new URLSearchParams(window.location.search).get('id');
    const cpfJurado = new URLSearchParams(window.location.search).get('cpfJurado');
    const nomeCat = new URLSearchParams(window.location.search).get('categoria');
    const participanteUrl = `${API_BASE_URL}/participantes/${participanteId}`;

    const nomeCategoria = document.getElementById("categoria");
    const enviarBtn = document.getElementById("enviarNotas");
    const loader = document.getElementById("loader");

    const textoCat = document.createElement("div");
    textoCat.className = "text-uppercase fw-bold text-warning mb-0";
    textoCat.textContent = `CATEGORIA ${nomeCat}`;
    nomeCategoria.appendChild(textoCat);

    const notasDisponiveis = [5, 6, 7, 8, 9, 10];
    const notasSelecionadas = {};

    fetch(participanteUrl)
      .then(res => res.json())
      .then(data => {
        document.querySelector('.nome').textContent = data.nome;
        document.querySelector('.codigoCandidata').textContent = data.codigo;
      })
      .catch(err => console.error('Erro ao buscar participante:', err));

    function criarBlocoAvaliacao(tipo) {
      const div = document.createElement('div');
      div.className = 'avaliacao';
      div.innerHTML = `<h4>${tipo.nome}</h4>`;
      const notasDiv = document.createElement('div');
      notasDiv.className = 'notas';

      notasDisponiveis.forEach(nota => {
        const btn = document.createElement('div');
        btn.className = 'nota';
        btn.textContent = nota;
        btn.onclick = () => {
          notasSelecionadas[tipo.id] = nota;
          [...notasDiv.children].forEach(n => n.classList.remove('selecionada'));
          btn.classList.add('selecionada');

          if (Object.keys(notasSelecionadas).length === qtdAvaliacoes) {
            enviarBtn.classList.add("ativa");
          }
        };
        notasDiv.appendChild(btn);
      });

      div.appendChild(notasDiv);
      avaliacoesContainer.appendChild(div);
    }

    let qtdAvaliacoes = 0;
    fetch(tiposUrl)
      .then(res => res.json())
      .then(data => {
        qtdAvaliacoes = data.length;
        data.forEach(tipo => criarBlocoAvaliacao(tipo));
      })
      .catch(err => console.error('Erro ao buscar tipos de avaliação:', err));

    async function enviarPontuacao(participanteId, notasSelecionadas, cpfJurado) {
      const url = `${API_BASE_URL}/participantes/${participanteId}/jurado/${cpfJurado}/pontuacoes`;
      const payload = Object.entries(notasSelecionadas).map(([tipoAvaliacaoId, valor]) => ({ tipoAvaliacaoId, valor }));
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    async function verificarEVotar() {
      loader.style.display = 'block';
      enviarBtn.disabled = true;
      enviarBtn.classList.remove("ativa");
      try {
        const res = await fetch(`${API_BASE_URL}/pontuacoes/${participanteId}/jurado/${cpfJurado}/ja-votou`);
        const jaVotou = await res.json();
        if (jaVotou) {
          loader.style.display = 'none';
          alert("Jurado já votou Nesse Candidato(a)");
          setTimeout(() => history.back(), 1000);
        } else {
          await enviarPontuacao(participanteId, notasSelecionadas, cpfJurado);
          loader.style.display = 'none';
          alert("Votado com sucesso");
          setTimeout(() => history.back(), 1000);
        }
      } catch (err) {
        loader.style.display = 'none';
        console.error("Erro ao consultar a API:", err);
        alert("Erro ao verificar voto");
      }
    }

    enviarBtn.onclick = () => {
      if (Object.keys(notasSelecionadas).length === qtdAvaliacoes) {
        verificarEVotar();
      } else {
        alert('Favor selecione todas avaliações.');
      }
    };