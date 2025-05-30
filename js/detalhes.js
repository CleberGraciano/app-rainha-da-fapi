   if (!sessionStorage.getItem("cpf")) {
    window.location.href = "index.html";
  } else {

const tiposUrl = `${API_BASE_URL}/tipos-avaliacao`;

    const avaliacoesContainer = document.getElementById('avaliacoes');
    const participanteId = sessionStorage.getItem("idParticipante");
    const cpfJurado = sessionStorage.getItem("cpf");
    const nomeCat = sessionStorage.getItem("categoria");
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
const MAX_TENTATIVAS = 10;
const INTERVALO_RETRY_MS = 2000;

function carregarAvaliacoesComPolling(tentativa = 1) {
  loader.style.display = 'block';
  loader.textContent = 'Aguarde Enviando votação ...';

  fetch(tiposUrl)
    .then(res => {
      if (!res.ok) throw new Error("Resposta não OK");
      return res.json();
    })
    .then(data => {
      if (!data || data.length === 0) {
        throw new Error("Lista de avaliações vazia");
      }

      qtdAvaliacoes = data.length;
      data.forEach(tipo => criarBlocoAvaliacao(tipo));
      loader.style.display = 'none';
    })
    .catch(err => {
      console.warn(`Tentativa ${tentativa} falhou:`, err.message);
      if (tentativa < MAX_TENTATIVAS) {
        setTimeout(() => carregarAvaliacoesComPolling(tentativa + 1), INTERVALO_RETRY_MS);
      } else {
        loader.textContent = "Erro ao carregar avaliações. Tente novamente.";
      }
    });
}

carregarAvaliacoesComPolling();

    async function enviarPontuacao(participanteId, notasSelecionadas, cpfJurado) {
      const url = `${API_BASE_URL}/participantes/${participanteId}/jurado/${cpfJurado}/pontuacoes`;
      const payload = Object.entries(notasSelecionadas).map(([tipoAvaliacaoId, valor]) => ({ tipoAvaliacaoId, valor }));
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    async function verificarEVotar(participanteId, cpfJurado) {
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
        verificarEVotar(participanteId, cpfJurado);
      } else {
        alert('Favor selecione todas avaliações.');
      }
    };

  }