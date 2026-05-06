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

    // ---- 4. Modal de Cadastro ----
    const btnNovoCaso = document.getElementById('btn-novo-caso');
    const modal = document.getElementById('cadastro-modal');
    const btnClose = document.getElementById('close-modal');
    const btnCancel = document.getElementById('cancel-modal');
    const btnSave = document.getElementById('save-modal');
    const selectTipo = document.getElementById('tipo-cadastro');

    if (btnNovoCaso && modal) {
        btnNovoCaso.addEventListener('click', () => {
            modal.classList.add('active');
        });

        const closeModal = () => {
            modal.classList.remove('active');
        };

        btnClose.addEventListener('click', closeModal);
        btnCancel.addEventListener('click', closeModal);

        selectTipo.addEventListener('change', (e) => {
            document.getElementById('form-crime').style.display = 'none';
            document.getElementById('form-pessoa').style.display = 'none';
            document.getElementById('form-local').style.display = 'none';

            const tipo = e.target.value;
            document.getElementById(`form-${tipo}`).style.display = 'flex';
        });

        btnSave.addEventListener('click', () => {
            if (!window.graphNodes || !window.graphEdges) {
                alert('O grafo não está inicializado.');
                return;
            }

            const tipo = selectTipo.value;
            let idInput = document.getElementById('id-node').value;
            let id;
            
            if (!idInput) {
                // Auto generate ID
                const currentIds = window.graphNodes.getIds();
                id = currentIds.length > 0 ? Math.max(...currentIds) + 1 : 1;
            } else {
                id = parseInt(idInput);
            }

            let label = '';
            let group = '';

            if (tipo === 'crime') {
                const titulo = document.getElementById('crime-titulo').value || 'Sem título';
                const idCrime = document.getElementById('crime-id_crime').value || id;
                label = `Caso #${idCrime}\n${titulo}`;
                group = 'case';
            } else if (tipo === 'pessoa') {
                const nome = document.getElementById('pessoa-nome').value || 'Desconhecido';
                label = nome;
                group = 'suspect';
            } else if (tipo === 'local') {
                const nome = document.getElementById('local-nome').value || 'Local Desconhecido';
                const endereco = document.getElementById('local-endereco').value || '';
                label = endereco ? `${nome}\n${endereco}` : nome;
                group = 'location';
            }

            // Adiciona o nó no DataSet (o vis.js atualiza o grafo automaticamente)
            try {
                window.graphNodes.add({ id: id, label: label, group: group });
            } catch (err) {
                alert('Erro ao adicionar nó. O ID pode já existir.');
                return;
            }

            const connectId = document.getElementById('conexao-id').value;
            if (connectId) {
                try {
                    window.graphEdges.add({
                        from: parseInt(connectId),
                        to: id,
                        label: 'Conexão'
                    });
                } catch (err) {
                    console.error('Erro ao conectar', err);
                }
            }

            closeModal();
            // Reset forms
            document.querySelectorAll('.form-control').forEach(input => {
                if(input.id !== 'tipo-cadastro') input.value = '';
            });
            // Reset select to default
            selectTipo.value = 'crime';
            selectTipo.dispatchEvent(new Event('change'));
        });
    }
});
