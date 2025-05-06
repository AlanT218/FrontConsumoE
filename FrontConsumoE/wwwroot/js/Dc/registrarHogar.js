(function () {
    const API_BASE_URL = "https://localhost:7245";
    const token = localStorage.getItem("token");

    document.addEventListener("DOMContentLoaded", () => {
        const form = document.getElementById("formAgregarHogar");
        const selectTipo = document.getElementById("tipo");
        const mensajeDiv = document.getElementById("mensaje");
        // oculta la caja de mensaje estática
        if (mensajeDiv) mensajeDiv.style.display = "none";

        // Cargar tipos de hogar al iniciar
        cargarTiposHogar();

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nombre = document.getElementById("nombre").value.trim();
            const idTipo = parseInt(selectTipo.value, 10);

            if (!nombre || !idTipo) {
                mostrarPopup("❌ Todos los campos son obligatorios.");
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/DuenioCasa/registrar-hogar`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ nombre, idTipo })
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.mensaje || JSON.stringify(result));

                mostrarPopup(`✅ ${result.mensaje}`);
                form.reset();
            } catch (err) {
                console.error("Error al registrar hogar:", err);
                mostrarPopup(`❌ Error: ${err.message}`);
            }
        });
    });

    async function cargarTiposHogar() {
        const select = document.getElementById("tipo");
        try {
            const resp = await fetch(`${API_BASE_URL}/api/DuenioCasa/tipos-hogar`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!resp.ok) throw new Error(`Status ${resp.status}`);
            const tipos = await resp.json();
            tipos.forEach(t => {
                const opt = document.createElement("option");
                opt.value = t.idTipo;
                opt.textContent = t.nombreTipo;
                select.appendChild(opt);
            });
        } catch (err) {
            console.error("Error al cargar tipos de hogar:", err);
            mostrarPopup("⚠️ No se pudieron cargar los tipos de hogar.");
        }
    }
})();