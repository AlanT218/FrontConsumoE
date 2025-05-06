const token = localStorage.getItem("token");
const idZonaElect = localStorage.getItem("id_zona_elect");

document.addEventListener("DOMContentLoaded", () => {
    cargarElectrodomesticos();
    cargarZonas();

    const consumo = localStorage.getItem("consumo");
    if (consumo) document.getElementById("consumo").value = consumo;

    document.getElementById("form-actualizar").addEventListener("submit", async (event) => {
        event.preventDefault();
        await actualizarZonaElectro();
    });
});

// Función para cargar los electrodomésticos desde la API
async function cargarElectrodomesticos() {
    const electroSelect = document.getElementById("electrodomestico");

    try {
        const response = await fetch("https://localhost:7245/api/DuenioCasa/electrodomesticos", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Error al obtener los electrodomésticos.");

        const electrodomesticos = await response.json();

        const opciones = ['<option value="">Seleccione un electrodoméstico</option>'];

        opciones.push(...electrodomesticos.map(electro =>
            `<option value="${electro.Value || electro.value || electro.IdElectro}">
                ${electro.Text || electro.text || electro.Nombre}
            </option>`
        ));

        electroSelect.innerHTML = opciones.join("");
    } catch (error) {
        console.error("Error al cargar electrodomésticos:", error);
        mostrarPopup("❌ Error al cargar electrodomésticos.");
    }
}

// Función para cargar las zonas desde la API
async function cargarZonas() {
    const zonaSelect = document.getElementById("zona");

    try {
        const response = await fetch("https://localhost:7245/api/DuenioCasa/zonas", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Error al obtener las zonas.");

        const zonas = await response.json();

        const opciones = ['<option value="">Seleccione una zona</option>'];

        opciones.push(...zonas.map(zona =>
            `<option value="${zona.Value || zona.value || zona.IdZona}">
                ${zona.Text || zona.text || zona.Nombre}
            </option>`
        ));

        zonaSelect.innerHTML = opciones.join("");
    } catch (error) {
        console.error("Error al cargar zonas:", error);
        mostrarPopup("❌ Error al cargar zonas.");
    }
}

async function actualizarZonaElectro() {
    const zona = document.getElementById("zona").value;
    const electro = document.getElementById("electrodomestico").value;
    const consumo = parseFloat(document.getElementById("consumo").value);

    if (!zona || !electro || isNaN(consumo) || consumo <= 0) {
        mostrarPopup("⚠️ Completa todos los campos correctamente.");
        return;
    }

    const data = {
        idZona: zona,
        idElectro: electro,
        consumo: consumo
    };

    try {
        const response = await fetch(`https://localhost:7245/api/DuenioCasa/zona-electro/${idZonaElect}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error al actualizar:", response.status, "-", errorText);
            throw new Error("Error al actualizar");
        }

        mostrarPopup("✅ Zona - Electrodoméstico actualizado correctamente.");
        localStorage.removeItem("id_zona_elect");
        localStorage.removeItem("nombre_zona");
        localStorage.removeItem("nombre_electro");
        localStorage.removeItem("consumo");
        window.location.href = "/DuenioCasa/ActuElimiElec";

    } catch (error) {
        console.error("Error al actualizar:", error);
        mostrarPopup("❌ Error al actualizar. Revisa la consola.");
    }
}
