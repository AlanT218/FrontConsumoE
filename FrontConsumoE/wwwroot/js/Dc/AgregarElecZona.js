const token = localStorage.getItem("token");

// Al cargar la página, inicializa las funciones para cargar electrodomésticos y zonas
document.addEventListener("DOMContentLoaded", () => {
    cargarElectrodomesticos();
    cargarZonas();
});

// Función para cargar los electrodomésticos desde la API
async function cargarElectrodomesticos() {
    const electroSelect = document.getElementById("electro");

    try {
        const response = await fetch("https://localhost:7245/api/DuenioCasa/electrodomesticos", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Error al obtener los electrodomésticos.");

        const electrodomesticos = await response.json();

        const html = electrodomesticos.map(electro =>
            `<option value="${electro.Value || electro.value || electro.IdElectro}">${electro.Text || electro.text || electro.Nombre}</option>`
        ).join("");

        electroSelect.innerHTML = html;
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

        const html = zonas.map(zona =>
            `<option value="${zona.Value || zona.value || zona.IdZona}">${zona.Text || zona.text || zona.Nombre}</option>`
        ).join("");

        zonaSelect.innerHTML = html;
    } catch (error) {
        console.error("Error al cargar zonas:", error);
        mostrarPopup("❌ Error al cargar zonas.");
    }
}

// Función para agregar un electrodoméstico a una zona
async function agregarZonaElectrodomestico() {
    const electro = document.getElementById("electro").value;
    const zona = document.getElementById("zona").value;
    const consumo = parseFloat(document.getElementById("consumo").value);

    // Obtener el ID del hogar seleccionado desde localStorage
    const idHogar = localStorage.getItem("id_hogar");

    if (!idHogar) {
        mostrarPopup("⚠️ Por favor selecciona un hogar antes de agregar un electrodoméstico.");
        return;
    }

    if (!electro || !zona || isNaN(consumo) || consumo <= 0) {
        mostrarPopup("⚠️ Por favor completa todos los campos correctamente.");
        return;
    }

    const data = {
        idZona: parseInt(zona),
        idElectro: parseInt(electro),
        idHogar: parseInt(idHogar), // Usar el ID del hogar seleccionado
        consumo: consumo,
        estado: false // Estado siempre es falso
    };

    try {
        const response = await fetch("https://localhost:7245/api/DuenioCasa/zona-electro", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            mostrarPopup("✅ Electrodoméstico agregado correctamente.");
            // Opción: limpiar formulario después de agregar
            document.getElementById("gestion-form").reset();
        } else {
            mostrarPopup("❌ Error al agregar el electrodoméstico.");
        }
    } catch (error) {
        console.error("Error al agregar el electrodoméstico:", error);
        mostrarPopup("❌ Error al agregar el electrodoméstico. Revisa la consola.");
    }
}

// Evento para el botón "Agregar"
document.getElementById("agregar-boton").addEventListener("click", agregarZonaElectrodomestico);
