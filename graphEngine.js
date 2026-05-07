// graphEngine.js

const GraphEngine = (function() {
    let network = null;
    let nodesDataset = new vis.DataSet([]);
    let edgesDataset = new vis.DataSet([]);

    function init() {
        const container = document.getElementById('network-graph');
        if (!container || typeof vis === 'undefined') return;

        const data = {
            nodes: nodesDataset,
            edges: edgesDataset
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
            },
            manipulation: {
                enabled: false, // Inicia desligado, será ativado pelo botão
                addNode: false,
                addEdge: function(data, callback) {
                    if (data.from == data.to) {
                        alert('Não é possível conectar um nó a ele mesmo.');
                        callback(null);
                    } else {
                        const label = prompt('Digite o tipo de relação:');
                        if (label) {
                            data.label = label;
                            callback(data); // Salva visualmente
                            
                            // Emite evento para persistência
                            if (onManualEdgeAddedCallback) {
                                onManualEdgeAddedCallback(data);
                            }
                        } else {
                            callback(null);
                        }
                        
                        // Desativa o modo após tentar (opcional, para forçar clique duplo)
                        network.disableEditMode();
                        // Reset button state if needed via UI logic
                    }
                }
            }
        };

        network = new vis.Network(container, data, options);

        // Click Event listener
        network.on('click', function(params) {
            if (params.nodes.length > 0) {
                if (onNodeClickCallback) onNodeClickCallback(params.nodes[0]);
            } else {
                if (onNodeClickCallback) onNodeClickCallback(null);
            }
        });
    }

    let onManualEdgeAddedCallback = null;
    let onNodeClickCallback = null;

    function onNodeClick(callback) {
        onNodeClickCallback = callback;
    }

    function onManualEdgeAdded(callback) {
        onManualEdgeAddedCallback = callback;
    }

    function enableEdgeMode() {
        if (network) {
            network.addEdgeMode();
        }
    }

    function renderGraphForCase(caso) {
        if (!network) return;

        // Limpar dados atuais
        nodesDataset.clear();
        edgesDataset.clear();

        // Extrair dados do caso
        const { local, crime, pessoa } = caso;

        // Adicionar Nós
        nodesDataset.add([
            {
                id: local.id,
                label: local.endereco ? `${local.nome}\n${local.endereco}` : local.nome,
                group: 'location'
            },
            {
                id: crime.id,
                label: `Caso #${crime.id_crime}\n${crime.titulo}`,
                group: 'case'
            },
            {
                id: pessoa.id,
                label: pessoa.nome,
                group: 'suspect'
            }
        ]);

        // Adicionar Arestas da cena principal
        edgesDataset.add([
            {
                from: pessoa.id,
                to: crime.id,
                label: pessoa.funcao || 'Envolvido em'
            },
            {
                from: crime.id,
                to: local.id,
                label: 'Ocorreu em'
            }
        ]);

        // Adicionar nós e arestas extras
        if (caso.elementosExtras && caso.elementosExtras.length > 0) {
            caso.elementosExtras.forEach(elemento => {
                let nodeGroup = '';
                let edgeLabel = '';

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

                nodesDataset.add({
                    id: elemento.id,
                    label: elemento.nome,
                    group: nodeGroup
                });

                edgesDataset.add({
                    from: elemento.tipo === 'pessoa' || elemento.tipo === 'veiculo' || elemento.tipo === 'arma' ? elemento.id : crime.id,
                    to: elemento.tipo === 'pessoa' || elemento.tipo === 'veiculo' || elemento.tipo === 'arma' ? crime.id : elemento.id,
                    label: edgeLabel
                });
            });
        }

        // Desenhar Conexões Manuais
        if (caso.conexoesManuais && caso.conexoesManuais.length > 0) {
            edgesDataset.add(caso.conexoesManuais);
        }

        // Redesenhar e focar
        setTimeout(() => {
            network.redraw();
            network.fit({ animation: { duration: 1000, easingFunction: 'easeInOutQuad' } });
        }, 100);
    }

    function addExtraNode(nodeData, edgeData) {
        if (!network) return;

        nodesDataset.add(nodeData);
        edgesDataset.add(edgeData);

        // Focar no novo nó
        network.focus(nodeData.id, {
            scale: 1.2,
            animation: {
                duration: 1000,
                easingFunction: 'easeInOutQuad'
            }
        });
    }

    return {
        init,
        renderGraphForCase,
        addExtraNode,
        enableEdgeMode,
        onManualEdgeAdded,
        onNodeClick
    };
})();
