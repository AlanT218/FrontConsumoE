(() => {
    // —————— Configuración global ——————
    const API_BASE_URL = "https://localhost:7245";
    const token = localStorage.getItem("token");
    const idHogar = localStorage.getItem("id_hogar");
    const idUsuario = obtenerIdUsuarioDesdeToken(token);
    let zonaElectSeleccionado = null;

    // —————— Helpers ——————
    function obtenerIdUsuarioDesdeToken(token) {
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.id_usuario || payload.Id || payload.id;
        } catch {
            return null;
        }
    }

    function mostrarPopup(titulo, mensaje) {
        const modal = document.getElementById("confirmacionModal");
        const mensajeEl = document.getElementById("modalMensaje");

        mensajeEl.innerText = `${titulo}: ${mensaje}`;
        modal.style.display = "flex";

        const btnOk = document.getElementById("btnConfirmar");
        const btnNo = document.getElementById("btnCancelar");

        btnOk.onclick = () => {
            modal.style.display = "none";
        };

        btnNo.onclick = () => {
            modal.style.display = "none";
        };
    }

    function mostrarModal(mensaje) {
        const modal = document.getElementById("confirmacionModal");
        const mensajeEl = document.getElementById("modalMensaje");
        mensajeEl.innerText = mensaje;
        modal.style.display = "flex";
    }

    // —————— Fetch con JWT y control de errores ——————
    async function fetchJSON(url, opts = {}) {
        opts.headers = {
            ...opts.headers,
            "Authorization": `Bearer ${token}`
        };
        const resp = await fetch(url, opts);
        if (!resp.ok) {
            const text = await resp.text();
            throw new Error(`HTTP ${resp.status}: ${text}`);
        }
        return resp.json();
    }

    // —————— Carga y pinta zonas/electros ——————
    async function obtenerZonasElectrodomesticos() {
        try {
            const datos = await fetchJSON(
                `${API_BASE_URL}/api/DuenioCasa/zona-electro/hogar/${idHogar}`
            );
            // pedir estado en paralelo
            const datosConEstado = await Promise.all(
                datos.map(async item => {
                    try {
                        const js = await fetchJSON(
                            `${API_BASE_URL}/api/DuenioCasa/estado-actual/${item.idZonaElect}`
                        );
                        item.estado = js.estado;
                    } catch {
                        item.estado = false;
                    }
                    return item;
                })
            );
            // agrupar por zona
            const agrup = {};
            datosConEstado.forEach(item => {
                (agrup[item.nombreZona] ||= []).push(item);
            });
            renderZonas(agrup);
        } catch (err) {
            console.error("Error al cargar zonas:", err);
            mostrarPopup("❌ Error", "No se pudieron cargar las zonas.");
        }
    }

    function renderZonas(agrup) {
        const cont = document.getElementById("contenedor-zonas");
        cont.innerHTML = "";
        for (const zona in agrup) {
            const zonaBox = document.createElement("div");
            zonaBox.className = "zona-box";
            zonaBox.innerHTML = `<h3>${zona}</h3>`;
            agrup[zona].forEach(e => {
                const box = document.createElement("div");
                box.className = "electro-box";
                box.dataset.id = e.idZonaElect;
                const on = e.estado === true || e.estado === "true" || e.estado === 1;
                box.classList.add(on ? "encendido" : "apagado");
                box.innerText = e.nombreElectrodomestico;
                box.onclick = () => mostrarModalConfirmacion(e);
                zonaBox.appendChild(box);
            });
            cont.appendChild(zonaBox);
        }
    }

    // —————— Modal de confirmación de on/off ——————
    async function mostrarModalConfirmacion(e) {
        mostrarModal(`¿Deseas ${e.estado ? "APAGAR" : "ENCENDER"} "${e.nombreElectrodomestico}"?`);
        document.getElementById("btnConfirmar").onclick = () => confirmarCambio(e);
        document.getElementById("btnCancelar").onclick = () => {
            document.getElementById("confirmacionModal").style.display = "none";
        };
    }

    async function confirmarCambio(e) {
        try {
            await fetchJSON(
                `${API_BASE_URL}/api/DuenioCasa/cambiar-estado`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        idZonaElect: e.idZonaElect,
                        nuevoEstado: !e.estado,
                        idUsuario
                    })
                }
            );
            mostrarPopup("✅ Éxito", "Estado actualizado.");
            document.getElementById("confirmacionModal").style.display = "none";
            // refrescar vista
            obtenerZonasElectrodomesticos();
        } catch (err) {
            console.error("Error al cambiar estado:", err);
            mostrarPopup("❌ Error", "No se pudo cambiar el estado.");
        }
    }

    // —————— Generar y descargar PDF ——————
    async function generarPdf() {
        try {
            const resp = await fetch(
                `${API_BASE_URL}/api/DuenioCasa/generar-reporte-pdf/${idHogar}`,
                { method: "GET", headers: { "Authorization": `Bearer ${token}` } }
            );
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const blob = await resp.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ReporteConsumo_${idHogar}_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error al generar PDF:", err);
            mostrarPopup("❌ Error", "No se pudo generar el PDF.");
        }
    }

    // —————— Eventos iniciales ——————
    document.addEventListener("DOMContentLoaded", () => {
        obtenerZonasElectrodomesticos();
        document.getElementById("btnGenerarPdf").addEventListener("click", generarPdf);
    });

})();
