const API_BASE_URL = "https://localhost:7245";
const token = localStorage.getItem("token");
const idHogar = localStorage.getItem("id_hogar");

function obtenerIdUsuarioDesdeToken(token) {
    if (!token) return null;
    const payload = token.split('.')[1];
    try {
        const decoded = JSON.parse(atob(payload));
        return decoded.id_usuario || decoded.Id || decoded.id;
    } catch (e) {
        console.error("Error al decodificar el token:", e);
        return null;
    }
}

const idUsuario = obtenerIdUsuarioDesdeToken(token);
let zonaElectSeleccionado = null;

async function obtenerZonasElectrodomesticos() {
    const contenedor = document.getElementById("contenedor-zonas");
    contenedor.innerHTML = "";

    try {
        const response = await fetch(`${API_BASE_URL}/api/DuenioCasa/zona-electro/hogar/${idHogar}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Error al obtener zonas");

        const datos = await response.json();

        const zonasAgrupadas = {};
        datos.forEach(item => {
            const zona = item.nombreZona;
            if (!zonasAgrupadas[zona]) zonasAgrupadas[zona] = [];
            zonasAgrupadas[zona].push(item);
        });

        for (const zona in zonasAgrupadas) {
            const zonaBox = document.createElement("div");
            zonaBox.className = "zona-box";
            zonaBox.innerHTML = `<h3>${zona}</h3>`;

            zonasAgrupadas[zona].forEach(electro => {
                const electroBox = document.createElement("div");
                electroBox.className = "electro-box";
                electroBox.setAttribute("data-id", electro.idZonaElect);

                const estaEncendido = electro.estado === true || electro.estado === "true" || electro.estado === 1;
                electroBox.classList.add(estaEncendido ? "encendido" : "apagado");

                electroBox.innerText = electro.nombreElectrodomestico;
                electroBox.onclick = () => mostrarModalConfirmacion(electro);

                zonaBox.appendChild(electroBox);
            });

            contenedor.appendChild(zonaBox);
        }

    } catch (error) {
        console.error("Error al cargar zonas:", error);
    }
}

async function mostrarModalConfirmacion(electro) {
    const modal = document.getElementById("confirmacionModal");
    const mensaje = document.getElementById("modalMensaje");
    const btnConfirmar = document.getElementById("btnConfirmar");
    const btnCancelar = document.getElementById("btnCancelar");

    try {
        const estadoResponse = await fetch(`${API_BASE_URL}/api/DuenioCasa/estado-actual/${electro.idZonaElect}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!estadoResponse.ok) throw new Error("No se pudo obtener el estado actual.");

        const estadoData = await estadoResponse.json();
        const estadoActual = estadoData.estado === true || estadoData.estado === "true" || estadoData.estado === 1;
        const nuevoEstado = !estadoActual;

        zonaElectSeleccionado = {
            idZonaElect: electro.idZonaElect,
            estadoNuevo: nuevoEstado,
            nombre: electro.nombreElectrodomestico
        };

        mensaje.innerText = `¿Deseas ${nuevoEstado ? "ENCENDER" : "APAGAR"} el electrodoméstico "${zonaElectSeleccionado.nombre}"?`;
        modal.style.display = "flex";

        btnConfirmar.onclick = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/DuenioCasa/cambiar-estado`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        idZonaElect: zonaElectSeleccionado.idZonaElect,
                        nuevoEstado: zonaElectSeleccionado.estadoNuevo,
                        idUsuario: idUsuario
                    })
                });

                const result = await response.json();

                if (!response.ok) {
                    alert("Error al cambiar el estado: " + (result.mensaje || "Error desconocido"));
                    return;
                }

                alert(result.mensaje || "Estado actualizado correctamente");
                modal.style.display = "none";

                // Actualizar el color del electrodoméstico en la vista
                const electroBox = document.querySelector(`.electro-box[data-id="${zonaElectSeleccionado.idZonaElect}"]`);
                if (electroBox) {
                    electroBox.classList.remove("encendido", "apagado");
                    electroBox.classList.add(zonaElectSeleccionado.estadoNuevo ? "encendido" : "apagado");
                }

            } catch (error) {
                console.error("Error en confirmación:", error);
                alert("Ocurrió un error al cambiar el estado.");
            }
        };

        btnCancelar.onclick = () => {
            modal.style.display = "none";
        };

    } catch (error) {
        console.error("Error al obtener estado actual:", error);
        alert("No se pudo obtener el estado actual del electrodoméstico.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    obtenerZonasElectrodomesticos();
});
