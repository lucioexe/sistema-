// caseManager.js

const CaseManager = (function() {
    let onCaseClickCallback = null;

    function renderCards(meusCasos) {
        const container = document.getElementById('cases-grid-container');
        if (!container) return;

        container.innerHTML = '';

        if (meusCasos.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="ph ph-folder-open"></i>
                    <h2>Bem-vindo à Gestão de Casos</h2>
                    <p style="margin-top: 8px;">Nenhum caso registrado até o momento.<br>Clique em "Novo Caso" para iniciar uma investigação.</p>
                </div>
            `;
            return;
        }

        meusCasos.forEach((caso, index) => {
            const card = document.createElement('div');
            card.className = 'case-card';
            
            card.innerHTML = `
                <div class="case-card-header">
                    <span class="case-card-id">#${caso.crime.id_crime}</span>
                    <span class="case-card-date"><i class="ph ph-calendar"></i> ${caso.crime.data || 'Sem data'}</span>
                </div>
                <h3 class="case-card-title">${caso.crime.titulo}</h3>
                <div class="case-card-info">
                    <div><i class="ph ph-warning-circle"></i> Tipo: ${caso.crime.tipo || 'Não especificado'}</div>
                    <div><i class="ph ph-map-pin"></i> Local: ${caso.local.nome}</div>
                    <div><i class="ph ph-user"></i> Suspeito: ${caso.pessoa.nome}</div>
                </div>
            `;

            card.addEventListener('click', () => {
                if (onCaseClickCallback) {
                    onCaseClickCallback(caso);
                }
            });

            container.appendChild(card);
        });
    }

    function onCaseClick(callback) {
        onCaseClickCallback = callback;
    }

    return {
        renderCards,
        onCaseClick
    };
})();
