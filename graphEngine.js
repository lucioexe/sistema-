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
            }
        };

        network = new vis.Network(container, data, options);
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

        // Adicionar Arestas
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

        // Redesenhar e focar
        setTimeout(() => {
            network.redraw();
            network.fit({ animation: { duration: 1000, easingFunction: 'easeInOutQuad' } });
        }, 100);
    }

    return {
        init,
        renderGraphForCase
    };
})();
