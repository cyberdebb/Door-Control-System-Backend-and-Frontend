const { createApp } = Vue;

createApp({
  data() {
    return {
      salas: [],
      idUFSC: ''
    };
  },
  methods: {
    async fetchSalas() {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('/lista', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.status === 200) {
          this.salas = response.data;
        } else {
          alert('Erro ao carregar salas: ' + response.statusText);
        }
      } catch (error) {
        console.error('Erro ao acessar a rota protegida:', error);
        alert('Erro ao acessar a rota protegida. Tente novamente.');
      }
    },
    abrirSala(sala) {
      alert(`Abrindo a sala: ${sala}`);

      axios
        .post('/abre', { idPorta: sala })
        .then((response) => {
          console.log(`Porta ${sala} aberta com sucesso!`, response);
        })
        .catch((error) => {
          console.error('Erro ao abrir a sala:', error);
        });
    },
    logout() {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    }
  },
  mounted() {
    this.fetchSalas();
  }
}).mount('#vue_menu');
