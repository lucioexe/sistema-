document.addEventListener('DOMContentLoaded', () => {
    // ---- 1. Authentication Check & Logout ----
    const logoutBtn = document.getElementById('logout-btn');
    const displayMatricula = document.getElementById('display-matricula');

    const displayName = document.getElementById('display-name');

    // Recupera o usuário logado do localStorage
    const savedUserJson = localStorage.getItem('currentUser');
    
    if (savedUserJson) {
        const user = JSON.parse(savedUserJson);
        // Atualiza a interface com os dados do usuário
        if (displayMatricula) displayMatricula.textContent = user.matricula;
        if (displayName) displayName.textContent = user.nome;
    } else {
        // Se não houver usuário logado, redireciona para o login
        window.location.href = 'index.html';
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Limpa os dados da sessão
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }

    // ---- 2. Tab Switching Logic ----
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all tabs
            tabBtns.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active to clicked tab
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
            
            // If graph tab is shown, redraw network to ensure it fits the container properly
            if (targetId === 'tab-graph' && window.network) {
                setTimeout(() => {
                    window.network.redraw();
                    window.network.fit();
                }, 100);
            }
        });
    });

    // ---- 3. Vis.js Network Graph Initialization ----
    const container = document.getElementById('network-graph');
    if (container && typeof vis !== 'undefined') {
        
        let initialNodes = [];

        let initialEdges = [];

        const savedNodes = localStorage.getItem('graphNodes');
        const savedEdges = localStorage.getItem('graphEdges');
        if (savedNodes) initialNodes = JSON.parse(savedNodes);
        if (savedEdges) initialEdges = JSON.parse(savedEdges);

        const nodes = new vis.DataSet(initialNodes);
        const edges = new vis.DataSet(initialEdges);

        const data = {
            nodes: nodes,
            edges: edges
        };

        const options = {
            nodes: {
                shape: 'dot',
                size: 20,
                font: {
                    color: '#f8fafc',
                    size: 14,
                    face: 'Inter'
                },
                borderWidth: 2,
                shadow: {
                    enabled: true,
                    color: 'rgba(0,0,0,0.5)',
                    size: 10,
                    x: 5,
                    y: 5
                }
            },
            edges: {
                width: 2,
                font: {
                    color: '#94a3b8',
                    size: 11,
                    align: 'top',
                    face: 'Inter',
                    background: '#1e293b',
                    strokeWidth: 0
                },
                color: {
                    color: 'rgba(148, 163, 184, 0.4)',
                    highlight: '#3b82f6'
                },
                smooth: {
                    type: 'continuous'
                }
            },
            groups: {
                case: { color: { background: '#f97316', border: '#ea580c' }, size: 25 },
                suspect: { color: { background: '#3b82f6', border: '#2563eb' } },
                location: { color: { background: '#10b981', border: '#059669' }, shape: 'square' },
                vehicle: { color: { background: '#8b5cf6', border: '#7c3aed' }, shape: 'triangle' },
                weapon: { color: { background: '#ef4444', border: '#dc2626' }, shape: 'triangleDown' }
            },
            physics: {
                forceAtlas2Based: {
                    gravitationalConstant: -70,
                    centralGravity: 0.01,
                    springLength: 120,
                    springConstant: 0.08
                },
                maxVelocity: 50,
                solver: 'forceAtlas2Based',
                timestep: 0.35,
                stabilization: { iterations: 150 }
            },
            interaction: {
                hover: true,
                tooltipDelay: 200,
                zoomView: true
            }
        };

        window.network = new vis.Network(container, data, options);
        
        // Expose datasets to be accessed by modal save function
        window.graphNodes = nodes;
        window.graphEdges = edges;
    }

    // ---- 4. Modal de Cadastro Wizard ----
    const btnNovoCaso = document.getElementById('btn-novo-caso');
    const modal = document.getElementById('cadastro-modal');
    const btnClose = document.getElementById('close-modal');
    const btnCancelar = document.getElementById('btn-cancelar');
    
    // Wizard buttons
    const btnProximo = document.getElementById('btn-proximo');
    const btnVoltar = document.getElementById('btn-voltar');
    const btnFinalizar = document.getElementById('btn-finalizar');
    
    // Progress
    const progressFill = document.getElementById('progress-fill');
    const stepIndicators = document.querySelectorAll('.progress-steps .step');
    
    let currentStep = 1;
    const totalSteps = 3;

    if (btnNovoCaso && modal) {
        // Open Modal
        btnNovoCaso.addEventListener('click', () => {
            modal.classList.add('active');
            goToStep(1);
        });

        // Close Modal
        const closeModal = () => {
            modal.classList.remove('active');
            // Reset form
            document.querySelectorAll('.form-control').forEach(input => input.value = '');
        };

        btnClose.addEventListener('click', closeModal);
        btnCancelar.addEventListener('click', closeModal);

        // Validation logic
        const validateStep = (step) => {
            let isValid = true;
            if (step === 1) {
                if (!document.getElementById('local-nome').value) isValid = false;
            } else if (step === 2) {
                if (!document.getElementById('crime-id_crime').value) isValid = false;
                if (!document.getElementById('crime-titulo').value) isValid = false;
            } else if (step === 3) {
                if (!document.getElementById('pessoa-nome').value) isValid = false;
            }
            
            if (!isValid) {
                alert('Preencha os campos obrigatórios (*) para avançar.');
            }
            return isValid;
        };

        // Navigate Steps
        const goToStep = (step) => {
            // Hide all steps
            document.querySelectorAll('.wizard-step').forEach(el => el.style.display = 'none');
            // Show current step
            document.getElementById(`step-${step}`).style.display = 'block';
            
            if (btnVoltar) btnVoltar.style.display = step === 1 ? 'none' : 'block';
            
            if (step === totalSteps) {
                btnProximo.style.display = 'none';
                btnFinalizar.style.display = 'flex'; // It's a flex button
            } else {
                btnProximo.style.display = 'block';
                btnFinalizar.style.display = 'none';
            }
            
            // Update progress bar
            progressFill.style.width = `${(step / totalSteps) * 100}%`;
            
            // Update indicators
            stepIndicators.forEach((ind, index) => {
                if (index < step) {
                    ind.classList.add('active');
                } else {
                    ind.classList.remove('active');
                }
            });
            
            currentStep = step;
        };

        btnProximo.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                goToStep(currentStep + 1);
            }
        });

        if (btnVoltar) {
            btnVoltar.addEventListener('click', () => {
                if (currentStep > 1) {
                    goToStep(currentStep - 1);
                }
            });
        }

        // Finalize and Add to Graph
        btnFinalizar.addEventListener('click', () => {
            if (!validateStep(3)) return;
            
            if (!window.graphNodes || !window.graphEdges) {
                alert('O grafo não está inicializado.');
                return;
            }

            // Generate sequential IDs based on graph or use Date.now() 
            const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

            // Gather all data
            const localData = {
                id: document.getElementById('local-id').value ? parseInt(document.getElementById('local-id').value) : generateId(),
                nome: document.getElementById('local-nome').value,
                endereco: document.getElementById('local-endereco').value,
                tipo: document.getElementById('local-tipo').value
            };

            const crimeData = {
                id: document.getElementById('crime-id').value ? parseInt(document.getElementById('crime-id').value) : generateId(),
                id_crime: document.getElementById('crime-id_crime').value,
                titulo: document.getElementById('crime-titulo').value,
                data: document.getElementById('crime-data').value,
                tipo: document.getElementById('crime-tipo').value
            };

            const pessoaData = {
                id: document.getElementById('pessoa-id').value ? parseInt(document.getElementById('pessoa-id').value) : generateId(),
                nome: document.getElementById('pessoa-nome').value,
                cpf: document.getElementById('pessoa-cpf').value,
                funcao: document.getElementById('pessoa-funcao').value,
                status: document.getElementById('pessoa-status').value
            };

            // 1. Add to graph
            try {
                // Add Local Node
                window.graphNodes.add({
                    id: localData.id,
                    label: localData.endereco ? `${localData.nome}\n${localData.endereco}` : localData.nome,
                    group: 'location'
                });
                
                // Add Crime Node
                window.graphNodes.add({
                    id: crimeData.id,
                    label: `Caso #${crimeData.id_crime}\n${crimeData.titulo}`,
                    group: 'case'
                });
                
                // Add Pessoa Node
                window.graphNodes.add({
                    id: pessoaData.id,
                    label: pessoaData.nome,
                    group: 'suspect'
                });
                
                // Create Edges
                // Pessoa -> envolvida em -> Crime
                window.graphEdges.add({
                    from: pessoaData.id,
                    to: crimeData.id,
                    label: pessoaData.funcao || 'Envolvido em'
                });
                
                // Crime -> ocorreu em -> Local
                window.graphEdges.add({
                    from: crimeData.id,
                    to: localData.id,
                    label: 'Ocorreu em'
                });

            } catch (err) {
                alert('Erro ao adicionar nós. Verifique se os IDs já não existem no grafo.');
                console.error(err);
                return;
            }

            // 2. Prepare JSON for backend (Django/Neo4j)
            const payload = {
                transactionType: 'CREATE_SCENE',
                local: localData,
                crime: crimeData,
                pessoa: pessoaData
            };
            
            console.log('Payload pronto para o Django/Neo4j:', JSON.stringify(payload, null, 2));

            // Salvar no localStorage temporariamente
            localStorage.setItem('graphNodes', JSON.stringify(window.graphNodes.get()));
            localStorage.setItem('graphEdges', JSON.stringify(window.graphEdges.get()));
            
            meusCasos.push(payload);
            localStorage.setItem('meusCasos', JSON.stringify(meusCasos));
            
            // Atualizar tabela
            renderTable();

            closeModal();
        });
    }

    // ---- 5. Lista de Casos e Persistência ----
    let meusCasos = JSON.parse(localStorage.getItem('meusCasos')) || [];

    const renderTable = () => {
        const tbody = document.getElementById('case-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        // Se estiver vazio, mostrar estado inicial (Empty State)
        if (meusCasos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 40px 20px;">
                        <i class="ph ph-folder-open" style="font-size: 32px; margin-bottom: 12px; display: block; opacity: 0.5;"></i>
                        Nenhum caso registrado até o momento.<br>Clique em "Novo Caso" para começar sua investigação.
                    </td>
                </tr>
            `;
            return;
        }

        meusCasos.forEach((caso, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${caso.crime.id_crime}</td>
                <td>${caso.crime.titulo}</td>
                <td>${caso.crime.data || 'Não informada'}</td>
                <td><button class="btn-primary btn-small" onclick="verDetalhes(${index})">Ver Detalhes</button></td>
            `;
            tbody.appendChild(tr);
        });
    };

    renderTable();

    // Make verDetalhes global to be called from onclick
    window.verDetalhes = (index) => {
        const caso = meusCasos[index];
        const modal = document.getElementById('detalhes-modal');
        const body = document.getElementById('detalhes-body');
        
        if (!modal || !body) return;

        body.innerHTML = `
            <div class="detail-section">
                <h3><i class="ph ph-map-pin"></i> Dados do Local</h3>
                <div class="detail-row"><span class="detail-label">Nome:</span><span class="detail-value">${caso.local.nome}</span></div>
                <div class="detail-row"><span class="detail-label">Endereço:</span><span class="detail-value">${caso.local.endereco || '-'}</span></div>
                <div class="detail-row"><span class="detail-label">Tipo:</span><span class="detail-value">${caso.local.tipo || '-'}</span></div>
            </div>
            <div class="detail-section">
                <h3><i class="ph ph-warning-circle"></i> Dados do Crime</h3>
                <div class="detail-row"><span class="detail-label">Título:</span><span class="detail-value">${caso.crime.titulo}</span></div>
                <div class="detail-row"><span class="detail-label">Tipo:</span><span class="detail-value">${caso.crime.tipo || '-'}</span></div>
                <div class="detail-row"><span class="detail-label">Boletim/ID:</span><span class="detail-value">${caso.crime.id_crime}</span></div>
                <div class="detail-row"><span class="detail-label">Data:</span><span class="detail-value">${caso.crime.data || '-'}</span></div>
            </div>
            <div class="detail-section">
                <h3><i class="ph ph-user"></i> Dados da Pessoa</h3>
                <div class="detail-row"><span class="detail-label">Nome:</span><span class="detail-value">${caso.pessoa.nome}</span></div>
                <div class="detail-row"><span class="detail-label">CPF:</span><span class="detail-value">${caso.pessoa.cpf || '-'}</span></div>
                <div class="detail-row"><span class="detail-label">Função:</span><span class="detail-value">${caso.pessoa.funcao || '-'}</span></div>
                <div class="detail-row"><span class="detail-label">Status:</span><span class="detail-value">${caso.pessoa.status || '-'}</span></div>
            </div>
        `;
        modal.classList.add('active');
    };

    document.getElementById('close-detalhes')?.addEventListener('click', () => {
        document.getElementById('detalhes-modal').classList.remove('active');
    });
    document.getElementById('btn-fechar-detalhes')?.addEventListener('click', () => {
        document.getElementById('detalhes-modal').classList.remove('active');
    });
});
