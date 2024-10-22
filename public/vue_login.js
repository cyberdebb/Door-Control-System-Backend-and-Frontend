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
                console.log("Realizando login");
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

                if (response.ok) {
                    window.location.href = 'menu.html';
                } 
                else {
                    const errorMessage = await response.text();
                    alert(errorMessage);
                }
            } catch (error) {
                console.error("Erro ao fazer a requisição:", error);
                alert("Erro ao fazer login. Tente novamente.");
            }
        }
    }
}).mount('#vue_login');
