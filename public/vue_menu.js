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
            try {
              const response = await axios.get('/lista', {
                headers: {
                  'Content-Type': 'application/json'
                },
              });
          
              if (response.status === 200) {
                this.salas = response.data; // Se a resposta for OK, armazena as salas
              } else {
                const errorMessage = response.statusText;
                alert('Erro ao carregar salas: ' + errorMessage);
              }
            } catch (error) {
              console.error('Erro ao acessar a rota protegida:', error);
              alert('Erro ao acessar a rota protegida. Tente novamente.');
            }
          },          
        abrirSala(sala) {
            alert(`Abrindo a sala: ${sala}`);
            console.log(`Comando enviado de vue_menu.js abrirSala ${sala}`);
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
            // Usando axios para fazer a requisição ao servidor
            axios.post('/logout')
                .then(() => {
                    window.location.href = 'login.html';
                })
                .catch(error => {
                    console.error('Erro ao fazer logout:', error);
                    alert('Erro ao fazer logout. Tente novamente.');
                });
        }
    },
    mounted() {
        this.fetchSalas();
    }
}).mount('#vue_menu');
