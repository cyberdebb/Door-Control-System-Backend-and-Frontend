const { createApp } = Vue;

createApp({
    data() {
        return {
            idUFSC: '',
            senha: '',
        };
    },
    methods: {
        async handleLogin() {
            try {
                console.log("Realizando login");
                
                // Enviando dados para a rota de login usando Axios
                const response = await axios.post('/login', {
                    idUFSC: this.idUFSC,
                    senha: this.senha,
                });

                // Verificando a resposta do servidor
                if (response.status === 200) {
                    const data = response.data;
                    if(data.isAdmin){
                        window.location.href = 'admin.html'; // Redireciona para o admin                   
                    }
                    else{
                        window.location.href = 'menu.html'; // Redireciona para o menu                   
                    }
                } 
            } catch (error) {
                // Verificando se o erro tem uma resposta do servidor
                if (error.response) {
                    const errorMessage = error.response.data;
                    alert(errorMessage);
                } else {
                    console.error("Erro ao fazer a requisição:", error);
                    alert("Erro ao fazer login. Tente novamente.");
                }
            }
        }
    }
}).mount('#vue_login');
