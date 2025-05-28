if (!sessionStorage.getItem("cpf")) {
    window.location.href = "index.html";
  } else {
let participantes = [];
const podiumPorCategoria = new Map();
const avaliacoesPorParticipante = new Map(); // id -> texto
let categorias = [];

async function carregarCategorias() {
  const resposta = await fetch(`${API_BASE_URL}/categorias`);
  categorias = await resposta.json();

  const select = document.getElementById('filtroCategoria');
  select.innerHTML = '<option value="">Todas as categorias</option>'; // reset
  categorias.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.nome.toLowerCase();
    option.textContent = cat.nome;
    select.appendChild(option);
  });
}

async function carregarParticipantes() {
  const resposta = await fetch(`${API_BASE_URL}/participantes`);
  const data = await resposta.json();
  participantes = data;

  calcularPodiumPorCategoria();

  // Carrega os resumos de pontuações
  await Promise.all(participantes.map(async (p) => {
    const resumoResp = await fetch(`${API_BASE_URL}/participantes/${p.id}/resumo-pontuacoes`);
    const resumo = await resumoResp.json();
    const texto = resumo.map(r => `${r.tipoPontuacao.nome} - ${r.soma}`).join(', ');
    avaliacoesPorParticipante.set(p.id, texto);
  }));

  aplicarFiltros(); // Aplica os filtros ativos após atualizar os dados
}

function calcularPodiumPorCategoria() {
  podiumPorCategoria.clear();
  const categoriasMap = new Map();

  participantes.forEach(p => {
    const catId = p.categoria.id;
    if (!categoriasMap.has(catId)) categoriasMap.set(catId, []);
    categoriasMap.get(catId).push(p);
  });

  categoriasMap.forEach((lista, catId) => {
    const top3 = lista
      .sort((a, b) => b.totalPontuacao - a.totalPontuacao)
      .slice(0, 3)
      .map(p => p.id);
    podiumPorCategoria.set(catId, top3);
  });
}

function renderizarTabela(lista) {
  const tbody = document.getElementById('tabelaParticipantes');
  tbody.innerHTML = '';

  const ordenados = [...lista].sort((a, b) => b.totalPontuacao - a.totalPontuacao);

  ordenados.forEach((p, index) => {
    const categoriaTop3 = podiumPorCategoria.get(p.categoria.id) || [];

    let medalha = '';
    if (categoriaTop3[0] === p.id) medalha = '🥇';
    else if (categoriaTop3[1] === p.id) medalha = '🥈';
    else if (categoriaTop3[2] === p.id) medalha = '🥉';

    let imagemSrc = '';
    if (p.imagem) {
      imagemSrc = p.imagem.startsWith('http')
        ? p.imagem
        : `data:image/jpeg;base64,${p.imagem}`;
    }

    const textoAvaliacoes = avaliacoesPorParticipante.get(p.id) || '...';

    tbody.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td class="text-center fs-4">${medalha}</td>
        <td hidden><img src="${imagemSrc}" alt="Foto" width="50" height="50" class="rounded-circle border"></td>
        <td>${p.codigo}</td>
        <td>${p.nome}</td>
        <td>${p.idade}</td>
        <td hidden>${p.altura}</td>
        <td>${p.sexo}</td>
        <td>${p.categoria.nome}</td>
        <td>${p.totalPontuacao}</td>
        <td>${textoAvaliacoes}</td>
      </tr>
    `;
  });
}

function aplicarFiltros() {
  const nome = document.getElementById('filtroNome').value.toLowerCase();
  const pontuacao = parseFloat(document.getElementById('filtroPontuacao').value);
  const categoria = document.getElementById('filtroCategoria').value;
  const avaliacao = document.getElementById('filtroAvaliacao').value.toLowerCase();

  const filtrados = participantes.filter(p => {
    const nomeMatch = p.nome.toLowerCase().includes(nome);
    const pontuacaoMatch = isNaN(pontuacao) || p.totalPontuacao >= pontuacao;
    const categoriaMatch = !categoria || p.categoria.nome.toLowerCase() === categoria;
    const avaliacoesTexto = (avaliacoesPorParticipante.get(p.id) || '').toLowerCase();
    const avaliacaoMatch = avaliacao === '' || avaliacoesTexto.includes(avaliacao);
    return nomeMatch && pontuacaoMatch && categoriaMatch && avaliacaoMatch;
  });

  renderizarTabela(filtrados);
}

// Eventos de filtro
document.querySelectorAll('input, select').forEach(input => {
  input.addEventListener('input', aplicarFiltros);
});

// Início
(async () => {
  await carregarCategorias();
  await carregarParticipantes();
})();

// Atualização automática a cada 5 segundos
setInterval(async () => {
  await carregarParticipantes();
}, 5000);

async function baixarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const headers = [
    ["#", "Medalha", "Nome", "Idade", "Altura", "Sexo", "Categoria", "Total", "Avaliações"]
  ];

  const rows = [];
  const nome = document.getElementById('filtroNome').value.toLowerCase();
  const pontuacao = parseFloat(document.getElementById('filtroPontuacao').value);
  const categoria = document.getElementById('filtroCategoria').value;
  const avaliacao = document.getElementById('filtroAvaliacao').value.toLowerCase();

  const filtrados = participantes.filter(p => {
    const nomeMatch = p.nome.toLowerCase().includes(nome);
    const pontuacaoMatch = isNaN(pontuacao) || p.totalPontuacao >= pontuacao;
    const categoriaMatch = !categoria || p.categoria.nome.toLowerCase() === categoria;
    const avaliacoesTexto = (avaliacoesPorParticipante.get(p.id) || '').toLowerCase();
    const avaliacaoMatch = avaliacao === '' || avaliacoesTexto.includes(avaliacao);
    return nomeMatch && pontuacaoMatch && categoriaMatch && avaliacaoMatch;
  });

  const ordenados = [...filtrados].sort((a, b) => b.totalPontuacao - a.totalPontuacao);

  ordenados.forEach((p, index) => {
    const categoriaTop3 = podiumPorCategoria.get(p.categoria.id) || [];
    let medalha = '';
    if (categoriaTop3[0] === p.id) medalha = '1º';
    else if (categoriaTop3[1] === p.id) medalha = '2º';
    else if (categoriaTop3[2] === p.id) medalha = '3º';

    const avaliacoesTexto = avaliacoesPorParticipante.get(p.id) || '';
    rows.push([
      index + 1,
      medalha,
      p.nome,
      p.idade,
      p.altura,
      p.sexo,
      p.categoria.nome,
      p.totalPontuacao,
      avaliacoesTexto
    ]);
  });

  doc.text("Ranking de Ganhadoras", 14, 15);
  doc.autoTable({
    startY: 20,
    head: headers,
    body: rows,
    styles: { fontSize: 8 }
  });

  doc.save("ranking.pdf");
}

function baixarExcel() {
  const nome = document.getElementById('filtroNome').value.toLowerCase();
  const pontuacao = parseFloat(document.getElementById('filtroPontuacao').value);
  const categoria = document.getElementById('filtroCategoria').value;
  const avaliacao = document.getElementById('filtroAvaliacao').value.toLowerCase();

  const filtrados = participantes.filter(p => {
    const nomeMatch = p.nome.toLowerCase().includes(nome);
    const pontuacaoMatch = isNaN(pontuacao) || p.totalPontuacao >= pontuacao;
    const categoriaMatch = !categoria || p.categoria.nome.toLowerCase() === categoria;
    const avaliacoesTexto = (avaliacoesPorParticipante.get(p.id) || '').toLowerCase();
    const avaliacaoMatch = avaliacao === '' || avaliacoesTexto.includes(avaliacao);
    return nomeMatch && pontuacaoMatch && categoriaMatch && avaliacaoMatch;
  });

  const ordenados = [...filtrados].sort((a, b) => b.totalPontuacao - a.totalPontuacao);

  const dados = ordenados.map((p, index) => {
    const categoriaTop3 = podiumPorCategoria.get(p.categoria.id) || [];
    let medalha = '';
    if (categoriaTop3[0] === p.id) medalha = '1º';
    else if (categoriaTop3[1] === p.id) medalha = '2º';
    else if (categoriaTop3[2] === p.id) medalha = '3º';

    return {
      Posicao: index + 1,
      Medalha: medalha,
      Nome: p.nome,
      Idade: p.idade,
      Altura: p.altura,
      Sexo: p.sexo,
      Categoria: p.categoria.nome,
      TotalPontuacao: p.totalPontuacao,
      Avaliacoes: avaliacoesPorParticipante.get(p.id) || ''
    };
  });

  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ranking");

  XLSX.writeFile(wb, "ranking.xlsx");
}
  }