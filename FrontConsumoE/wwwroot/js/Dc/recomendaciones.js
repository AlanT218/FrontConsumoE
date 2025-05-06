(function () {
    const API = '/api/DuenioCasa/recomendaciones';
    const tblBody = document.querySelector('#tblRecomendaciones tbody');
    const msgDiv = document.getElementById('mensaje');

    document.addEventListener('DOMContentLoaded', cargar);

    async function cargar() {
        try {
            const resp = await fetch(API);
            if (!resp.ok) throw new Error('Error cargando recomendaciones');

            const datos = await resp.json();
            if (!datos.length) {
                msgDiv.textContent = 'No hay recomendaciones disponibles.';
                return;
            }

            datos.forEach(r => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${r.nombreElectro}</td><td>${r.texto}</td>`;
                tblBody.appendChild(tr);
            });
        } catch (e) {
            msgDiv.textContent = `Error: ${e.message}`;
        }
    }
})();