document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Login
    const containerLogin = document.getElementById('container-login');
    const loginForm = document.getElementById('login-form');
    const matriculaInput = document.getElementById('matricula');
    const senhaInput = document.getElementById('senha');
    const errorMsgLogin = document.getElementById('error-message');
    const linkCadastro = document.getElementById('link-cadastro');

    // DOM Elements - Cadastro
    const containerCadastro = document.getElementById('container-cadastro');
    const cadastroForm = document.getElementById('cadastro-form');
    const cadNomeInput = document.getElementById('cad-nome');
    const cadMatriculaInput = document.getElementById('cad-matricula');
    const cadSenhaInput = document.getElementById('cad-senha');
    const cadDistritoInput = document.getElementById('cad-distrito');
    const errorMsgCad = document.getElementById('error-message-cad');
    const linkLogin = document.getElementById('link-login');

    // Toggle Password Visibility (Shared)
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            const icon = btn.querySelector('i');
            
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            
            if (isPassword) {
                icon.classList.remove('ph-eye');
                icon.classList.add('ph-eye-slash');
            } else {
                icon.classList.remove('ph-eye-slash');
                icon.classList.add('ph-eye');
            }
        });
    });

    // Alternar Telas
    function showCadastro(e) {
        if (e) e.preventDefault();
        containerLogin.style.display = 'none';
        containerCadastro.style.display = 'block';
        if (errorMsgCad) errorMsgCad.style.display = 'none';
        cadastroForm.reset();
    }

    function showLogin(e) {
        if (e) e.preventDefault();
        containerCadastro.style.display = 'none';
        containerLogin.style.display = 'block';
        if (errorMsgLogin) errorMsgLogin.style.display = 'none';
        loginForm.reset();
    }

    if (linkCadastro) linkCadastro.addEventListener('click', showCadastro);
    if (linkLogin) linkLogin.addEventListener('click', showLogin);

    // Inicializar Banco de Dados
    const defaultPoliciais = {
        '1234': { nome: 'Oficial Silva', senha: 'senha', matricula: '1234', distrito: '1º DP - Centro' },
        '5678': { nome: 'Oficial Costa', senha: 'senha', matricula: '5678', distrito: '2º DP - Zona Sul' }
    };

    let usuariosCadastrados = JSON.parse(localStorage.getItem('usuariosCadastrados'));
    if (!usuariosCadastrados) {
        usuariosCadastrados = defaultPoliciais;
        localStorage.setItem('usuariosCadastrados', JSON.stringify(usuariosCadastrados));
    }

    // Handle Cadastro
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nome = cadNomeInput.value;
            const matricula = cadMatriculaInput.value;
            const senha = cadSenhaInput.value;
            const distrito = cadDistritoInput.options[cadDistritoInput.selectedIndex].text;

            // Verifica se a matrícula já existe
            if (usuariosCadastrados[matricula]) {
                if (errorMsgCad) {
                    errorMsgCad.textContent = 'Essa matrícula já está cadastrada no sistema.';
                    errorMsgCad.style.display = 'block';
                }
                return;
            }

            // Salva o novo usuário
            usuariosCadastrados[matricula] = {
                nome: nome,
                matricula: matricula,
                senha: senha,
                distrito: distrito
            };

            localStorage.setItem('usuariosCadastrados', JSON.stringify(usuariosCadastrados));
            
            alert('Cadastro realizado com sucesso! Faça login para acessar o sistema.');
            showLogin();
        });
    }

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const matricula = matriculaInput.value;
            const senha = senhaInput.value;
            
            // Verifica na base persistida
            if (usuariosCadastrados[matricula] && usuariosCadastrados[matricula].senha === senha) {
                if (errorMsgLogin) errorMsgLogin.style.display = 'none';
                
                // Salva as informações do usuário atual logado
                localStorage.setItem('currentUser', JSON.stringify(usuariosCadastrados[matricula]));
                
                // Redireciona para o dashboard
                window.location.href = 'dashboard.html';
            } else {
                if (errorMsgLogin) {
                    errorMsgLogin.textContent = 'Matrícula ou senha incorretos.';
                    errorMsgLogin.style.display = 'block';
                } else {
                    alert('Matrícula ou senha incorretos!');
                }
            }
        });
    }
});
