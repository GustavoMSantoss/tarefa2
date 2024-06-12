const { createApp } = Vue;

createApp({
    data() {
        return {
            nomedousuario: '',
            password: '',
            novoUsuario: { usuario: '', senha: '' },
            exibirFormulario: false,
            exibirErro: false,
            cadastroRealizado: false
        };
    },
    methods: {
        async autenticar() {
            try {
                const response = await fetch(`/validarUsuario?usuario=${this.nomedousuario}&senha=${this.password}`);
                if (!response.ok) {
                    this.exibirErro = true;
                } else {
                    window.location.href = '/dashboard';
                }
            } catch (error) {
                console.error('Erro ao autenticar usuário:', error);
            }
        },
        async cadastrar() {
            try {
                const response = await fetch('/inserirUsuario', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.novoUsuario)
                });
                if (response.ok) {
                    this.cadastroRealizado = true;
                    this.exibirFormulario = false;
                }
            } catch (error) {
                console.error('Erro ao cadastrar usuário:', error);
            }
        }
    }
}).mount('#app');
