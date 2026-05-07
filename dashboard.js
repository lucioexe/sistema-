// dashboard.js - Coordenador Principal

document.addEventListener('DOMContentLoaded', () => {
    // ---- 1. Authentication Check & Logout ----
    const logoutBtn = document.getElementById('logout-btn');
    const displayMatricula = document.getElementById('display-matricula');
    const displayName = document.getElementById('display-name');

    const savedUserJson = localStorage.getItem('currentUser');
    
    if (savedUserJson) {
        const user = JSON.parse(savedUserJson);
        if (displayMatricula) displayMatricula.textContent = user.matricula;
        if (displayName) displayName.textContent = user.nome;
    } else {
        window.location.href = 'index.html';
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }

    // ---- 2. Estado Global ----
    let meusCasos = JSON.parse(localStorage.getItem('meusCasos')) || [];

    // ---- 3. View Management (Drill-Down) ----
    const viewHome = document.getElementById('view-home');
    const viewGraph = document.getElementById('view-graph');
    const btnVoltarHome = document.getElementById('btn-voltar-home');

    function showHomeView() {
        viewGraph.classList.remove('active');
        // Pequeno atraso para a animação
        setTimeout(() => {
            viewHome.classList.add('active');
        }, 150);
    }

    function showGraphView() {
        viewHome.classList.remove('active');
        setTimeout(() => {
            viewGraph.classList.add('active');
        }, 150);
    }

    if (btnVoltarHome) {
        btnVoltarHome.addEventListener('click', showHomeView);
    }

    // ---- 4. Inicialização dos Módulos ----
    
    // Iniciar Wizard
    if (typeof Wizard !== 'undefined') {
        Wizard.init();
        
        // Escutar evento de finalização do Wizard
        Wizard.onSave((payload) => {
            // Adicionar ao array global
            meusCasos.push(payload);
            
            // Salvar no localStorage
            localStorage.setItem('meusCasos', JSON.stringify(meusCasos));
            
            // Atualizar a Grid de Casos
            if (typeof CaseManager !== 'undefined') {
                CaseManager.renderCards(meusCasos);
            }
        });
    }

    // Iniciar GraphEngine
    if (typeof GraphEngine !== 'undefined') {
        GraphEngine.init();
    }

    // Iniciar CaseManager
    if (typeof CaseManager !== 'undefined') {
        CaseManager.renderCards(meusCasos);
        
        // Escutar clique em um card para fazer o drill-down
        CaseManager.onCaseClick((casoClicado) => {
            showGraphView();
            if (typeof GraphEngine !== 'undefined') {
                GraphEngine.renderGraphForCase(casoClicado);
            }
        });
    }
});
