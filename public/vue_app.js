// vue_app.js
const { createApp } = Vue;

createApp({
    data() {
        return {
            idUFSC: '',
            senha: ''
        };
    },
    methods: {
        async handleLogin() {
            try {
                // Enviando dados para a rota de login
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        idUFSC: this.idUFSC,
                        senha: this.senha
                    })
                });

                // Verificando a resposta do servidor
                if (response.redirected) {
                    window.location.href = response.url; 
                } 
                else {
                    const errorMessage = await response.text();
                    alert(errorMessage); 
                }
            } 
            catch (error) {
                console.error("Erro ao fazer a requisição:", error);
                alert("Erro ao fazer login. Tente novamente.");
            }
        }
    }
}).mount('#vue_app');
