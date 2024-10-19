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
        abrirSala(sala) {
            alert(`Abrindo a sala: ${sala}`);
        },
        logout() {
            window.location.href = 'login.html';
        }
    }
}).mount('#vue_app');