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
            const token = localStorage.getItem('token'); // Recupera o token do localStorage
    
            try {
                const response = await fetch('/api/salas', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`, // Envia o token no cabeçalho
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
            window.location.href = '/abre';
        },
        logout() {
            window.location.href = 'login.html';
        }
    },
    mounted() {
        this.fetchSalas();
    }
}).mount('#vue_menu');