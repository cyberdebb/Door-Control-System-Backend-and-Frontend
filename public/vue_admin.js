const { createApp } = Vue;

createApp({
  data() {
    return {
      allData:{
        allProfessores: [], // Lista de professores cadastrados
        allSalas: [] // Salas disponíveis para serem mostradas como checkboxes
      },
      novoProfessor: {
        nome: '',
        idUFSC: '',
        senha:'',
        salasDisponiveis:[]
      },
      isVerifiedAdmin: false, // Controle para verificar se o usuário é admin
      isLoading: true, // Controle para mostrar uma tela de carregamento
      errorMessage: '' // Controle para mensagens de erro
    };
  },
  methods: {
    formatarSalas(salasDisponiveis) {
      // Juntar o array de salas com vírgula ou outro separador
      return salasDisponiveis.join(', ');
    },

    async cadastrarProfessor() {
      try {
        const response = await axios.post('/admin/cadastrar-professor', this.novoProfessor, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log("Chegou ate aqui");
        if (response.status === 200) {
          alert('Professor cadastrado com sucesso!');
          this.novoProfessor = { nome: '', idUFSC: '', senha: '', salasDisponiveis: [] }; // Limpa os campos
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
      try {
        const response = await axios.get('/admin/listar-professores', {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (response.status === 200) {
          this.allData.allProfessores = response.data.professores;
          this.allData.allSalas = response.data.salas;
          console.log('Professores e Salas recebidos:', response.data.salas); // Verifica se os dados foram recebidos corretamente
          console.log('Professores e Salas recebidos:', this.allData.allSalas); // Verifica se os dados foram recebidos corretamente
        } else {
          alert('Erro ao carregar professores: ' + response.statusText);
        }
      } catch (error) {
        console.error('Erro ao carregar a lista de professores:', error);
        alert('Erro ao carregar a lista de professores. Tente novamente.');
      }
    },
    logout() {
       // Usando axios para fazer a requisição ao servidor
       axios.post('/logout')
       .then(() => {
           window.location.href = 'login.html';
       })
       .catch(error => {
           console.error('Erro ao fazer logout:', error);
           alert('Erro ao fazer logout. Tente novamente.');
       });
    },
    async verificarPermissaoAdmin() {

      try {
        const response = await axios.get('/admin', {
          headers: {
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
