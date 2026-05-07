// elementModal.js

const ElementModal = (function() {
    let onSaveCallback = null;

    function init() {
        const modal = document.getElementById('modal-add-elemento');
        const btnClose = document.getElementById('close-add-elemento');
        const btnCancelar = document.getElementById('btn-cancelar-elemento');
        const btnSalvar = document.getElementById('btn-salvar-elemento');

        if (!modal) return;

        ElementModal.open = () => {
            modal.classList.add('active');
            document.querySelectorAll('#modal-add-elemento .form-control').forEach(input => input.value = '');
            document.getElementById('select-tipo-elemento').value = 'pessoa';
        };

        const closeModal = () => {
            modal.classList.remove('active');
        };

        btnClose.addEventListener('click', closeModal);
        btnCancelar.addEventListener('click', closeModal);

        btnSalvar.addEventListener('click', () => {
            const tipo = document.getElementById('select-tipo-elemento').value;
            const nome = document.getElementById('add-elemento-nome').value;
            let id = document.getElementById('add-elemento-id').value;
            const extra = document.getElementById('add-elemento-extra').value;

            if (!nome) {
                alert('Preencha o Nome/Placa obrigatório.');
                return;
            }

            if (!id) {
                id = Date.now() + Math.floor(Math.random() * 1000);
            } else {
                id = parseInt(id);
            }

            const elemento = {
                id: id,
                tipo: tipo,
                nome: nome,
                extra: extra
            };

            if (onSaveCallback) {
                onSaveCallback(elemento);
            }

            closeModal();
        });
    }

    function onSave(callback) {
        onSaveCallback = callback;
    }

    return {
        init,
        onSave
    };
})();
