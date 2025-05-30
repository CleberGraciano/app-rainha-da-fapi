
// URL da API de categorias (substitua pela real)
  const API_URL = `${API_BASE_URL}/categorias`;

  // Cores para alternar (opcional)
  const cores = ['#d61a92', '#f46c00', '#0274c9', '#00184c', '#6a1b9a', '#00897b'];

  const cpfJurado = sessionStorage.getItem("cpf");



  // Função para criar e inserir os cards
  async function carregarCategorias() {
    try {
      const resposta = await fetch(API_URL);
      const categorias = await resposta.json(); // Supondo que vem um array com objetos

      const container = document.getElementById('categoria-lista');
      container.innerHTML = ''; // Limpa qualquer conteúdo anterior
      
      categorias.forEach((categoria, index) => {
        const cor = cores[index % cores.length];
        const col = document.createElement('div');
        col.className = 'col-6';

        const card = document.createElement('div');
        card.className = 'category-card';
        card.style.backgroundColor = cor;
        card.textContent = categoria.nome; // ajuste para o campo real da API
        card.onclick = () => {
          sessionStorage.setItem("cpf", cpf);
          sessionStorage.setItem("idCategoria", categoria.id);
          window.location.href = "participantes.html";
           // window.location.href = `participantes.html?id=${categoria.id}&cpfJurado=${cpfJurado}`;
          };


        col.appendChild(card);
        container.appendChild(col);
      });
    } catch (erro) {
      console.error('Erro ao carregar categorias:', erro);
    }
  }

  // Executa ao carregar a página
  carregarCategorias();

  


    const cpf = sessionStorage.getItem("cpf");

    

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
              window.location.href = "./painel-admin/index.html"; // redireciona para o painel
            });
          }
        })
        .catch(error => {
          console.error("Erro na verificação de admin:", error);
        });
    }
    }
