const token = localStorage.getItem("token");
const idHogar = localStorage.getItem("id_hogar");

document.addEventListener("DOMContentLoaded", () => {
    listarZonaElectPorHogar();
});

async function listarZonaElectPorHogar() {
    const tabla = document.getElementById("tabla-zonas-electro").querySelector("tbody");
    tabla.innerHTML = "";

    try {
        const response = await fetch(`https://localhost:7245/api/DuenioCasa/zona-electro/hogar/${idHogar}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Error al obtener datos");

        const datos = await response.json();

        if (datos.length === 0) {
            tabla.innerHTML = "<tr><td colspan='4'>No hay datos registrados.</td></tr>";
            return;
        }

        datos.forEach(item => {
            const id = item.IdZonaElect || item.idZonaElect;
            const nombreZona = item.NombreZona || item.nombreZona;
            const nombreElectro = item.NombreElectrodomestico || item.nombreElectrodomestico;
            const consumo = item.Consumo || item.consumo;

            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${nombreZona}</td>
                <td>${nombreElectro}</td>
                <td>${consumo} W</td>
                <td>
                    <button class="actualizar" onclick="redirigirActualizar(${id}, '${encodeURIComponent(nombreZona)}', '${encodeURIComponent(nombreElectro)}', ${consumo})">Actualizar</button>
                    <button class="eliminar" onclick="confirmarEliminacion(${id}, '${nombreZona}', '${nombreElectro}')">Eliminar</button>
                </td>
            `;
            tabla.appendChild(fila);
        });

    } catch (error) {
        mostrarPopup("❌ Error al obtener datos.");
        console.error("Error:", error);
    }
}

function redirigirActualizar(idZonaElect, nombreZona, nombreElectrodomestico, consumo) {
    localStorage.setItem("id_zona_elect", idZonaElect);
    localStorage.setItem("nombre_zona", decodeURIComponent(nombreZona));
    localStorage.setItem("nombre_electro", decodeURIComponent(nombreElectrodomestico));
    localStorage.setItem("consumo", consumo);
    window.location.href = "/DuenioCasa/ActualizarVista";
}

async function confirmarEliminacion(idZonaElect, nombreZona, nombreElectro) {
    mostrarPopup(`
        ¿Deseas eliminar <strong>${nombreElectro}</strong> de la zona <strong>${nombreZona}</strong>?
        <br><br>
        <button id="confirmarBtn">Sí, eliminar</button>
    `);

    document.getElementById("confirmarBtn").addEventListener("click", async () => {
        try {
            const response = await fetch(`https://localhost:7245/api/DuenioCasa/zona-electro/${idZonaElect}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("No se pudo eliminar.");

            mostrarPopup("✅ Eliminación exitosa.");
            listarZonaElectPorHogar();
        } catch (error) {
            mostrarPopup("❌ Error al eliminar.");
            console.error(error);
        }
    });
}
