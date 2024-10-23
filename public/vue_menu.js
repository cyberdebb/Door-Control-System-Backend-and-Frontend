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
                const response = await fetch('/api/salas', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    this.salas = await response.json();
                } 
                else {
                    const errorMessage = await response.text();
                    alert('Erro ao carregar salas: ' + errorMessage);                
                }
            } 
            catch (error) {
                console.error('Erro ao acessar a rota protegida:', error);
                alert('Erro ao acessar a rota protegida. Tente novamente.');
            }
        },
        abrirSala(sala) {
            alert(`Abrindo a sala: ${sala}`);

            // O restante do código permanece o mesmo
        },
        logout() {
            // Para remover o cookie, precisamos fazer uma requisição ao servidor
            fetch('/logout', {
                method: 'POST'
            })
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
