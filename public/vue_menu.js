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

            // Criar um formulário de forma programática
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/abre';  // A rota no backend
        
            // Adicionar o campo idPorta como input hidden no formulário
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'idPorta';
            input.value = sala;  // O ID da sala a ser enviado
        
            // Adicionar o input ao formulário e submeter
            form.appendChild(input);
            document.body.appendChild(form);  // Adicionar o formulário ao corpo do documento
            form.submit();  // Submeter o formulário
        },
        logout() {
            window.location.href = 'login.html';
        }
    },
    mounted() {
        this.fetchSalas();
    }
}).mount('#vue_menu');