const API_URL = 'https://tarefadatabase.vercel.app';

const app = Vue.createApp({
    data() {
        return {
            nomedousuario: '',
            password: '',
            exibirFormulario: false,
            novoUsuario: {
                usuario: '',
                senha: ''
            },
            exibirErro: false,
            cadastroRealizado: false
        }
    },
    methods: {
        formulario() {
            this.exibirFormulario = !this.exibirFormulario;
        },
        cadastrar() {

            this.cadastrarUsuarioBD(this.novoUsuario.usuario, this.novoUsuario.senha);
            this.cadastroRealizado = true;
            
            
        },
        async cadastrarUsuarioBD(usuario, senha) {
            try {
                const response = await fetch(`${API_URL}/inserirUsuario`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ usuario, senha })
                });
                if (!response.ok) {
                    throw new Error('Erro ao inserir usuario no banco de dados.');
                }
                console.log('Usuario inserido com sucesso.');
            } catch (error) {
                console.error('Erro ao atualizar a vida no banco de dados:', error);
            }
        },
        async autenticar() {
            try {
                const response = await fetch(`${API_URL}/validarUsuario?usuario=${this.nomedousuario}&senha=${this.password}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    this.exibirErro = true;
                } else {
                    window.open('game.html', '_blank');
                }
                console.log('Usuario validado com sucesso.');
            } catch (error) {
                console.error('Erro ao validar o usuario:', error);
            }
        }
    }
});

app.mount('#app');
