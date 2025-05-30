
const urlParams = new URLSearchParams(window.location.search);
  const id = sessionStorage.getItem("idCategoria"); // id da categoria
  const cpf = sessionStorage.getItem("cpf");

  console.log(id);
  console.log(cpf);

  let participantesOriginais = [];

  document
    .querySelector(".search-bar input")
    .addEventListener("input", (e) => {
      const termo = e.target.value.toLowerCase().trim();
      const filtrados = participantesOriginais.filter(
        (p) =>
          p.codigo.toLowerCase().includes(termo) ||
          p.nome.toLowerCase().includes(termo)
      );
      renderizarParticipantes(filtrados);
    });

  function renderizarParticipantes(listaFiltrada) {
    const lista = document.getElementById("participantes-lista");
    lista.innerHTML = "";

    listaFiltrada.forEach((p) => {
      const row = document.createElement("div");
      row.className = "participant-row";
      row.dataset.id = p.id; // guarda id para facilitar atualização

      const codigo = document.createElement("span");
      codigo.textContent = p.codigo;

      const nome = document.createElement("span");
      nome.textContent = p.nome;

      const botao = document.createElement("button");
      botao.className = `btn-votar ${p.votado ? "btn-vermelho" : "btn-verde"}`;
      botao.textContent = p.votado ? "JÁ VOTADO" : "VOTAR";

      if (!p.votado) {
        botao.onclick = () => {
          sessionStorage.setItem("cpf", cpf);
          sessionStorage.setItem("idParticipante", p.id);

          sessionStorage.setItem("categoria", p.categoria.nome);
          window.location.href = 'detalhes.html';
          //window.location.href = `detalhes.html?id=${p.id}&categoria=${p.categoria.nome}&cpfJurado=${cpfJurado}`;
        };
      } else {
        botao.disabled = true;
      }

      row.appendChild(codigo);
      row.appendChild(nome);
      row.appendChild(botao);

      lista.appendChild(row);
    });
  }

  async function carregarParticipantes() {
    try {
      const resposta = await fetch(
        `${API_BASE_URL}/participantes/categoria/${id}`
      );

      if (!resposta.ok) {
        throw new Error(`Erro na requisição: ${resposta.status}`);
      }

      const participantes = await resposta.json();

      document.getElementById("categoria-nome").textContent =
        `CATEGORIA ${participantes[0].categoria.nome.toUpperCase()}`;
      document.getElementById("categoria-idade").textContent =
        `${participantes[0].categoria.idadeInicial} À ${participantes[0].categoria.idadeFinal} ANOS`;

      // Buscar IDs dos participantes já votados pelo jurado nessa categoria
      const votosRes = await fetch(
        `${API_BASE_URL}/pontuacoes/jurado/${cpf}/categoria/${id}/participantes-votados`
      );
      const idsVotados = await votosRes.json();

      for (const p of participantes) {
        p.votado = idsVotados.includes(p.id);
      }

      participantesOriginais = participantes;
      renderizarParticipantes(participantesOriginais);

      iniciarPolling();

    } catch (error) {
      console.error("Erro ao carregar participantes:", error);
      document.getElementById("participantes-lista").innerHTML =
        '<p class="text-danger text-center">Erro ao carregar participantes.</p>';
    }
  }

  async function verificarVotoParticipante(participanteId) {
    try {
      const url = `${API_BASE_URL}/pontuacoes/${participanteId}/jurado/${cpf}/ja-votou`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erro na verificação de voto');
      return await res.json();
    } catch (e) {
      console.error(`Erro verificando voto para participante ${participanteId}`, e);
      return false;
    }
  }

  function atualizarBotaoVoto(participanteId, votado) {
    const lista = document.getElementById("participantes-lista");
    const rows = lista.getElementsByClassName("participant-row");
    for (const row of rows) {
      if (row.dataset.id == participanteId) {
        const botao = row.querySelector("button.btn-votar");
        if (votado) {
          botao.textContent = "JÁ VOTADO";
          botao.className = "btn-votar btn-vermelho";
          botao.disabled = true;
        } else {
          botao.textContent = "VOTAR";
          botao.className = "btn-votar btn-verde";
          botao.disabled = false;
        }
        break;
      }
    }
  }

  function iniciarPolling() {
    const intervalo = 10; // 1 segundos

    setInterval(async () => {
      for (const participante of participantesOriginais) {
        if (!participante.votado) {
          const votou = await verificarVotoParticipante(id);
          if (votou) {
            participante.votado = true;
            atualizarBotaoVoto(id, true);
          }
        }
      }
    }, intervalo);
  }

  carregarParticipantes();


  function validaUsuarioAdmin(){
    if (!sessionStorage.getItem("cpf")) {
        window.location.href = "index.html";
      } else {
      // Chamada para a API para verificar se é admin
      fetch(`${API_BASE_URL}/usuarios/verifica-admin/${cpf}`)
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
              window.location.href = "./painel-admin/index.html"; // redireciona para o painel
            });
          }
        })
        .catch(error => {
          console.error("Erro na verificação de admin:", error);
        });
    }
    }