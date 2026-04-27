document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginForm = document.getElementById('login-form');
    const matriculaInput = document.getElementById('matricula');
    const senhaInput = document.getElementById('senha');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const togglePasswordIcon = togglePasswordBtn?.querySelector('i');

    // Toggle Password Visibility
    if (togglePasswordBtn && senhaInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = senhaInput.type === 'password';
            senhaInput.type = isPassword ? 'text' : 'password';
            
            // Update Icon
            if (isPassword) {
                togglePasswordIcon.classList.remove('ph-eye');
                togglePasswordIcon.classList.add('ph-eye-slash');
            } else {
                togglePasswordIcon.classList.remove('ph-eye-slash');
                togglePasswordIcon.classList.add('ph-eye');
            }
        });
    }

    // Base de dados simulada de policiais
    const policiais = {
        '1234': { nome: 'Oficial Silva', senha: 'senha', matricula: '1234' },
        '5678': { nome: 'Oficial Costa', senha: 'senha', matricula: '5678' }
    };

    // Handle Login
    if (loginForm) {
        const errorMsg = document.getElementById('error-message');
        
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const matricula = matriculaInput.value;
            const senha = senhaInput.value;
            
            // Verifica se a matrícula existe e a senha está correta
            if (policiais[matricula] && policiais[matricula].senha === senha) {
                // Esconde erro se houver
                if (errorMsg) errorMsg.style.display = 'none';
                
                // Salva as informações do usuário no localStorage
                localStorage.setItem('currentUser', JSON.stringify(policiais[matricula]));
                
                // Redireciona para o dashboard
                window.location.href = 'dashboard.html';
            } else {
                // Mostra erro
                if (errorMsg) {
                    errorMsg.style.display = 'block';
                } else {
                    alert('Matrícula ou senha incorretos!');
                }
            }
        });
    }
});
