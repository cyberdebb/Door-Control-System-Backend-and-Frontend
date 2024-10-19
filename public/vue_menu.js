const { createApp } = Vue;
const { salasDisponiveis } = require('../src/models/database');

createApp({
    data() {
        return {
            currentSection: 'salas', 
            salas: [],
            idUFSC: ''
        };
    },
    methods: {
        showSection(section) {
            this.currentSection = section; 
        },
        async fetchSalas() {
            try {
                this.salas = await salasDisponiveis(this.idUFSC);
            } 
            catch (error) {
                alert(errorMessage); 
            }
        },
        async acessarProtegido() {
            const token = localStorage.getItem('token'); // Recupera o token do localStorage
    
            try {
                const response = await fetch('protegido', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}` // Envia o token no cabeçalho
                    }
                });
    
                if (response.ok) {
                    const data = await response.text(); // Lê a resposta
                    alert(data); // Mostra a resposta da rota protegida
                } 
                else {
                    const errorMessage = await response.text();
                    alert(errorMessage); // Mostra mensagem de erro
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
    }
}).mount('#vue_app');