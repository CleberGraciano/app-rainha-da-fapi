
function limparCpf(cpf) {
      if (!cpf) return '';
      return cpf.replace(/\D/g, '');  // Remove tudo que não for dígito
    }
    const cpfInput = document.getElementById("cpf");


    document.getElementById("loginForm").addEventListener("submit", async (e) => {
      e.preventDefault();

      const cpf = cpfInput.value.trim();

      if (!cpf) {
        alert("Por favor, preencha o CPF.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/jurados/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cpf }),
        });

        if (response.ok) {
          alert("Bem vindo ao Sistema, Login realizado com sucesso!!!");
          // Login OK, redireciona com o cpf na URL
          window.location.href = `categorias.html?cpfJurado=${encodeURIComponent(limparCpf(cpf))}`;
        } else if (response.status === 404 || response.status === 403) {
          alert("Jurado não cadastrado.");
        } else {
          alert("Erro ao tentar autenticar. Tente novamente.");
        }
      } catch (error) {
        alert("Erro na comunicação com o servidor.");
        console.error(error);
      }
    });


    