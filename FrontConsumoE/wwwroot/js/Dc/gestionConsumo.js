const API_BASE_URL = "https://localhost:7245";
const token = localStorage.getItem("token");
const idHogar = localStorage.getItem("id_hogar");

function obtenerIdUsuarioDesdeToken(token) {
    if (!token) return null;
    const payload = token.split('.')[1];
    try {
        const decoded = JSON.parse(atob(payload));
        return decoded.id_usuario || decoded.Id || decoded.id;
    } catch {
        return null;
    }
}
const idUsuario = obtenerIdUsuarioDesdeToken(token);
let zonaElectSeleccionado = null;

async function obtenerZonasElectrodomesticos() {
    const contenedor = document.getElementById("contenedor-zonas");
    contenedor.innerHTML = "";

    try {
        // 1) traemos la lista de zonas (sin estado)
        const resp = await fetch(
            `${API_BASE_URL}/api/DuenioCasa/zona-electro/hogar/${idHogar}`,
            { headers: { "Authorization": `Bearer ${token}` } }
        );
        if (!resp.ok) throw new Error("Error al obtener zonas");
        const datos = await resp.json();

        // 2) para cada elemento pedimos su estado actual
        const datosConEstado = await Promise.all(
            datos.map(async item => {
                try {
                    const r2 = await fetch(
                        `${API_BASE_URL}/api/DuenioCasa/estado-actual/${item.idZonaElect}`,
                        { headers: { "Authorization": `Bearer ${token}` } }
                    );
                    if (r2.ok) {
                        const js = await r2.json();
                        item.estado = js.estado;
                    } else {
                        item.estado = false;
                    }
                } catch {
                    item.estado = false;
                }
                return item;
            })
        );

        // 3) agrupamos por zona y pintamos con el estado real
        const zonasAgrupadas = {};
        datosConEstado.forEach(item => {
            const zona = item.nombreZona;
            (zonasAgrupadas[zona] ||= []).push(item);
        });

        for (const zona in zonasAgrupadas) {
            const zonaBox = document.createElement("div");
            zonaBox.className = "zona-box";
            zonaBox.innerHTML = `<h3>${zona}</h3>`;

            zonasAgrupadas[zona].forEach(electro => {
                const box = document.createElement("div");
                box.className = "electro-box";
                box.dataset.id = electro.idZonaElect;

                const on = electro.estado === true || electro.estado === "true" || electro.estado === 1;
                box.classList.add(on ? "encendido" : "apagado");
                box.innerText = electro.nombreElectrodomestico;
                box.onclick = () => mostrarModalConfirmacion(electro);

                zonaBox.appendChild(box);
            });

            contenedor.appendChild(zonaBox);
        }
    } catch (error) {
        console.error("Error al cargar zonas:", error);
        mostrarPopup("❌ Error", "No se pudieron cargar las zonas y electrodomésticos.");
    }
}

async function mostrarModalConfirmacion(electro) {
    const modal = document.getElementById("confirmacionModal");
    const mensajeEl = document.getElementById("modalMensaje");
    const btnOk = document.getElementById("btnConfirmar");
    const btnNo = document.getElementById("btnCancelar");

    try {
        // volvemos a verificar el estado actual
        const r = await fetch(
            `${API_BASE_URL}/api/DuenioCasa/estado-actual/${electro.idZonaElect}`,
            { headers: { "Authorization": `Bearer ${token}` } }
        );
        if (!r.ok) throw new Error();
        const js = await r.json();
        const estadoAct = js.estado === true || js.estado === "true" || js.estado === 1;
        const nuevoEst = !estadoAct;

        zonaElectSeleccionado = {
            idZonaElect: electro.idZonaElect,
            estadoNuevo: nuevoEst,
            nombre: electro.nombreElectrodomestico
        };

        mensajeEl.innerText = `¿Deseas ${nuevoEst ? "ENCENDER" : "APAGAR"} "${zonaElectSeleccionado.nombre}"?`;
        modal.style.display = "flex";

        btnOk.onclick = async () => {
            try {
                const resp = await fetch(
                    `${API_BASE_URL}/api/DuenioCasa/cambiar-estado`,
                    {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            idZonaElect: zonaElectSeleccionado.idZonaElect,
                            nuevoEstado: zonaElectSeleccionado.estadoNuevo,
                            idUsuario
                        })
                    }
                );
                const resJson = await resp.json();
                if (!resp.ok) {
                    mostrarPopup("❌ Error", resJson.mensaje || "No se pudo cambiar el estado.");
                    return;
                }
                mostrarPopup("✅ Éxito", resJson.mensaje || "Estado actualizado.");
                modal.style.display = "none";

                // actualizamos la clase de la caja
                const box = document.querySelector(
                    `.electro-box[data-id="${zonaElectSeleccionado.idZonaElect}"]`
                );
                if (box) {
                    box.classList.toggle("encendido", zonaElectSeleccionado.estadoNuevo);
                    box.classList.toggle("apagado", !zonaElectSeleccionado.estadoNuevo);
                }
            } catch (e) {
                console.error("Error en confirmación:", e);
                mostrarPopup("❌ Error", "Ocurrió un error al cambiar el estado.");
            }
        };

        btnNo.onclick = () => (modal.style.display = "none");
    } catch {
        mostrarPopup("❌ Error", "No se pudo obtener el estado actual.");
    }
}

function mostrarPopup(titulo, mensaje) {
    document.getElementById("popupModalLabel").innerText = titulo;
    document.getElementById("popupModalMensaje").innerText = mensaje;
    new bootstrap.Modal(document.getElementById("popupModal")).show();
}

document.addEventListener("DOMContentLoaded", obtenerZonasElectrodomesticos);
