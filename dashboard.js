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
        
        const nodes = new vis.DataSet([
            { id: 1, label: 'Caso #2405\nHomicídio', group: 'case' },
            { id: 2, label: 'Caso #2410\nRoubo', group: 'case' },
            { id: 10, label: 'Caso #2415\nTráfico', group: 'case' },
            
            { id: 3, label: 'João Silva', group: 'suspect' },
            { id: 4, label: 'Marcos Costa', group: 'suspect' },
            { id: 5, label: 'Ana Souza', group: 'suspect' },
            { id: 11, label: 'Carlos Lima', group: 'suspect' },
            
            { id: 6, label: 'Galpão\nZona Norte', group: 'location' },
            { id: 7, label: 'Centro\nFinanceiro', group: 'location' },
            { id: 12, label: 'Zona Sul', group: 'location' },
            
            { id: 8, label: 'Carro Preto\nABC-1234', group: 'vehicle' },
            { id: 13, label: 'Moto Branca\nXYZ-9876', group: 'vehicle' },
            
            { id: 9, label: 'Pistola 9mm', group: 'weapon' }
        ]);

        const edges = new vis.DataSet([
            // Connections for Case 1
            { from: 1, to: 3, label: 'Suspeito Principal' },
            { from: 1, to: 6, label: 'Local do Crime' },
            { from: 1, to: 9, label: 'Arma Usada' },
            
            // Connections for Case 2
            { from: 2, to: 4, label: 'Suspeito' },
            { from: 2, to: 5, label: 'Cúmplice' },
            { from: 2, to: 7, label: 'Local do Crime' },
            { from: 2, to: 8, label: 'Veículo de Fuga' },
            
            // Connections for Case 3
            { from: 10, to: 11, label: 'Líder' },
            { from: 10, to: 5, label: 'Distribuidora' },
            { from: 10, to: 12, label: 'Base de Operação' },
            { from: 10, to: 13, label: 'Transporte' },
            
            // Cross connections
            { from: 3, to: 5, label: 'Associados', dashes: true },
            { from: 3, to: 11, label: 'Parentesco', dashes: true }
        ]);

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
                if (!document.getElementById('local-id').value) isValid = false;
                if (!document.getElementById('local-nome').value) isValid = false;
            } else if (step === 2) {
                if (!document.getElementById('crime-id').value) isValid = false;
                if (!document.getElementById('crime-id_crime').value) isValid = false;
                if (!document.getElementById('crime-titulo').value) isValid = false;
            } else if (step === 3) {
                if (!document.getElementById('pessoa-id').value) isValid = false;
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

            // Gather all data
            const localData = {
                id: parseInt(document.getElementById('local-id').value),
                nome: document.getElementById('local-nome').value,
                endereco: document.getElementById('local-endereco').value,
                tipo: document.getElementById('local-tipo').value
            };

            const crimeData = {
                id: parseInt(document.getElementById('crime-id').value),
                id_crime: document.getElementById('crime-id_crime').value,
                titulo: document.getElementById('crime-titulo').value,
                data: document.getElementById('crime-data').value,
                tipo: document.getElementById('crime-tipo').value
            };

            const pessoaData = {
                id: parseInt(document.getElementById('pessoa-id').value),
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
            /* 
            TODO: FUTURE BACKEND FETCH
            fetch('YOUR_DJANGO_API_URL', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(response => response.json())
              .then(data => console.log('Salvo no backend!', data));
            */

            closeModal();
        });
    }
});
