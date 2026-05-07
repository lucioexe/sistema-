// dashboard.js - Coordenador Principal

document.addEventListener('DOMContentLoaded', () => {
    // ---- 1. Authentication Check & Logout ----
    const logoutBtn = document.getElementById('logout-btn');
    const displayMatricula = document.getElementById('display-matricula');
    const displayName = document.getElementById('display-name');

    const savedUserJson = localStorage.getItem('currentUser');
    let user = null;
    let storageKey = 'meusCasos'; // Fallback
    
    if (savedUserJson) {
        user = JSON.parse(savedUserJson);
        if (displayMatricula) displayMatricula.textContent = user.matricula;
        if (displayName) displayName.textContent = user.nome;
        storageKey = `${user.matricula}_meusCasos`;
    } else {
        window.location.href = 'index.html';
        return; // Stop execution
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            meusCasos = []; // Limpa memória
            currentCaseIndex = null;
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }

    // ---- 2. Estado Global ----
    let meusCasos = JSON.parse(localStorage.getItem(storageKey)) || [];
    let currentCaseIndex = null;

    // ---- 3. View Management (Drill-Down) ----
    const viewHome = document.getElementById('view-home');
    const viewGraph = document.getElementById('view-graph');
    const btnVoltarHome = document.getElementById('btn-voltar-home');
    const btnNovoCaso = document.getElementById('btn-novo-caso');
    const btnNovoText = document.getElementById('btn-novo-text');
    const btnAddEdge = document.getElementById('btn-add-edge');

    function showHomeView() {
        currentCaseIndex = null;
        if (btnNovoText) btnNovoText.textContent = 'Novo Caso';
        if (btnAddEdge) btnAddEdge.style.display = 'none';

        viewGraph.classList.remove('active');
        setTimeout(() => {
            viewHome.classList.add('active');
        }, 150);
    }

    function showGraphView(index) {
        currentCaseIndex = index;
        if (btnNovoText) btnNovoText.textContent = 'Adicionar Elemento';
        if (btnAddEdge) btnAddEdge.style.display = 'block';

        viewHome.classList.remove('active');
        setTimeout(() => {
            viewGraph.classList.add('active');
        }, 150);
    }

    if (btnVoltarHome) {
        btnVoltarHome.addEventListener('click', showHomeView);
    }

    if (btnAddEdge) {
        btnAddEdge.addEventListener('click', () => {
            if (typeof GraphEngine !== 'undefined' && GraphEngine.enableEdgeMode) {
                GraphEngine.enableEdgeMode();
            }
        });
    }

    if (btnNovoCaso) {
        btnNovoCaso.addEventListener('click', () => {
            if (currentCaseIndex === null) {
                // Na Home -> Abre Wizard
                if (typeof Wizard !== 'undefined' && Wizard.open) {
                    Wizard.open();
                }
            } else {
                // No Grafo -> Abre ElementModal
                if (typeof ElementModal !== 'undefined' && ElementModal.open) {
                    ElementModal.open();
                }
            }
        });
    }

    // ---- 4. Inicialização dos Módulos ----
    
    // Iniciar Wizard
    if (typeof Wizard !== 'undefined') {
        Wizard.init();
        
        Wizard.onSave((payload) => {
            payload.elementosExtras = []; // Initialize empty array for extra elements
            meusCasos.push(payload);
            localStorage.setItem(storageKey, JSON.stringify(meusCasos));
            if (typeof CaseManager !== 'undefined') {
                CaseManager.renderCards(meusCasos);
            }
        });
    }

    // Iniciar ElementModal
    if (typeof ElementModal !== 'undefined') {
        ElementModal.init();

        ElementModal.onSave((elemento) => {
            if (currentCaseIndex !== null) {
                // 1. Salvar na persistência
                const caso = meusCasos[currentCaseIndex];
                if (!caso.elementosExtras) caso.elementosExtras = [];
                caso.elementosExtras.push(elemento);
                localStorage.setItem(storageKey, JSON.stringify(meusCasos));

                // 2. Criar a Edge com o Crime
                const crimeId = caso.crime.id;
                let edgeLabel = '';
                let nodeGroup = '';

                if (elemento.tipo === 'pessoa') {
                    edgeLabel = 'Envolvido em';
                    nodeGroup = 'suspect';
                } else if (elemento.tipo === 'local') {
                    edgeLabel = 'Relacionado a';
                    nodeGroup = 'location';
                } else if (elemento.tipo === 'veiculo') {
                    edgeLabel = 'Usado em';
                    nodeGroup = 'vehicle';
                } else if (elemento.tipo === 'arma') {
                    edgeLabel = 'Usada em';
                    nodeGroup = 'weapon';
                }

                const nodeData = {
                    id: elemento.id,
                    label: elemento.nome,
                    group: nodeGroup
                };

                const edgeData = {
                    from: elemento.tipo === 'pessoa' || elemento.tipo === 'veiculo' || elemento.tipo === 'arma' ? elemento.id : crimeId,
                    to: elemento.tipo === 'pessoa' || elemento.tipo === 'veiculo' || elemento.tipo === 'arma' ? crimeId : elemento.id,
                    label: edgeLabel
                };

                // 3. Adicionar dinamicamente ao grafo atual
                if (typeof GraphEngine !== 'undefined') {
                    GraphEngine.addExtraNode(nodeData, edgeData);
                }
            }
        });
    }

    // Iniciar GraphEngine
    if (typeof GraphEngine !== 'undefined') {
        GraphEngine.init();

        GraphEngine.onManualEdgeAdded((edgeData) => {
            if (currentCaseIndex !== null) {
                const caso = meusCasos[currentCaseIndex];
                if (!caso.conexoesManuais) caso.conexoesManuais = [];
                
                // Limpar ids gerados internamente pelo vis.js se preferir, ou manter para consistência visual
                // Push a new object matching Vis.js edge structure
                caso.conexoesManuais.push({
                    from: edgeData.from,
                    to: edgeData.to,
                    label: edgeData.label
                });
                
                localStorage.setItem(storageKey, JSON.stringify(meusCasos));
            }
        });

        GraphEngine.onNodeClick((nodeId) => {
            if (currentCaseIndex === null || typeof CaseManager === 'undefined' || !CaseManager.showInspector) return;

            const caso = meusCasos[currentCaseIndex];

            if (!nodeId) {
                CaseManager.showInspector(null);
                return;
            }

            let foundData = null;

            if (caso.local && caso.local.id === nodeId) {
                foundData = caso.local;
            } else if (caso.crime && caso.crime.id === nodeId) {
                foundData = caso.crime;
            } else if (caso.pessoa && caso.pessoa.id === nodeId) {
                foundData = caso.pessoa;
            } else if (caso.elementosExtras) {
                foundData = caso.elementosExtras.find(el => el.id === nodeId);
            }

            CaseManager.showInspector(foundData);
        });
    }

  // Iniciar CaseManager
if (typeof CaseManager !== 'undefined') {
    CaseManager.renderCards(meusCasos);
    
    // Corrigido: Fechamento de chaves e parênteses organizados
    CaseManager.onCaseClick((casoClicado) => {
        // Encontrar o índice do caso clicado
        const index = meusCasos.findIndex(c => c.crime.id === casoClicado.crime.id);
        showGraphView(index);
        
        if (typeof GraphEngine !== 'undefined') {
            GraphEngine.renderGraphForCase(casoClicado);
        }
        
        if (typeof CaseManager.showInspector !== 'undefined') {
            CaseManager.showInspector(null); // Reset inspector
        }
    }); // <--- Aqui fechamos o onCaseClick corretamente

    CaseManager.onDataUpdated(() => {
        // Salvar dados atualizados usando a chave dinâmica (storageKey) que criamos
        localStorage.setItem(storageKey, JSON.stringify(meusCasos));
        
        // Re-renderizar o grafo para refletir mudanças (ex: nome alterado)
        if (currentCaseIndex !== null && typeof GraphEngine !== 'undefined') {
            GraphEngine.renderGraphForCase(meusCasos[currentCaseIndex]);
        }
    });
} // Fechamento do if (typeof CaseManager !== 'undefined')

}); // Fechamento do document.addEventListener
