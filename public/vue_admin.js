const { createApp } = Vue;

createApp({
  data() {
    return {
      professores: [], // Lista de professores cadastrados
      novoProfessor: {
        nome: '',
        idUFSC: ''
      },
      isVerifiedAdmin: false, // Controle para verificar se o usuário é admin
      isLoading: true, // Controle para mostrar uma tela de carregamento
      errorMessage: '' // Controle para mensagens de erro
    };
  },
  methods: {
    async cadastrarProfessor() {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.post('/admin/cadastrar-professor', this.novoProfessor, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.status === 200) {
          alert('Professor cadastrado com sucesso!');
          this.novoProfessor = { nome: '', idUFSC: '' }; // Limpa os campos
          this.fetchProfessores(); // Atualiza a lista de professores
        } else {
          alert('Erro ao cadastrar professor: ' + response.statusText);
        }
      } catch (error) {
        console.error('Erro ao cadastrar professor:', error);
        alert('Erro ao cadastrar professor. Tente novamente.');
      }
    },
    async fetchProfessores() {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('/admin/listar-professores', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.status === 200) {
          this.professores = response.data;
        } else {
          alert('Erro ao carregar professores: ' + response.statusText);
        }
      } catch (error) {
        console.error('Erro ao carregar a lista de professores:', error);
        alert('Erro ao carregar a lista de professores. Tente novamente.');
      }
    },
    logout() {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    },
    async verificarPermissaoAdmin() {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Você não está autenticado. Redirecionando para a página de login.");
        window.location.href = 'login.html';
        return;
      }

      try {
        const response = await axios.get('/admin', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 200 && response.data.isAdmin) {
          this.isVerifiedAdmin = true;
          this.fetchProfessores();
        } else {
          alert("Acesso negado. Apenas administradores podem acessar esta página.");
          window.location.href = 'menu.html';
        }
      } catch (error) {
        alert("Erro ao verificar permissões.");
        window.location.href = 'login.html';
      } finally {
        this.isLoading = false;
      }
    }
  },
  mounted() {
    this.verificarPermissaoAdmin();
  }
}).mount('#vue_admin');
