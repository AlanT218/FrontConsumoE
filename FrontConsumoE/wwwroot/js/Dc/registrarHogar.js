(function () {
    const API_BASE_URL = "https://localhost:7245";
    const token = localStorage.getItem("token");

    document.addEventListener("DOMContentLoaded", () => {
        const form = document.getElementById("formAgregarHogar");
        const selectTipo = document.getElementById("tipo");

        cargarTiposHogar();

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nombre = document.getElementById("nombre").value.trim();
            const idTipo = parseInt(selectTipo.value, 10);
            const nombreTipo = selectTipo.selectedOptions[0]?.text || "";

            if (!nombre || !idTipo) {
                mostrarPopup("❌ Todos los campos son obligatorios.", "error");
                return;
            }

            try {
                const payload = {
                    Nombre: nombre,
                    IdTipo: idTipo,
                    NombreTipo: nombreTipo,
                    NombreRol: "Dueño"
                };
                console.log("Payload a enviar:", payload);

                const response = await fetch(
                    `${API_BASE_URL}/api/DuenioCasa/registrar-hogar`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                let result = {};
                try { result = await response.json() } catch { }

                console.log("Respuesta del servidor:", response.status, result);

                if (!response.ok) {
                    const msg = result.mensaje || result.error || `Error ${response.status}`;
                    throw new Error(msg);
                }

                mostrarPopup(`✅ ${result.mensaje}`, "success", 2500);
                form.reset();
            }
            catch (err) {
                console.error("Error al registrar hogar:", err);
                mostrarPopup(`❌ ${err.message}`, "error");
            }
        });
    });

    async function cargarTiposHogar() {
        const select = document.getElementById("tipo");
        try {
            const resp = await fetch(
                `${API_BASE_URL}/api/DuenioCasa/tipos-hogar`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const tipos = await resp.json();
            tipos.forEach(t => {
                const opt = document.createElement("option");
                opt.value = t.idTipo;
                opt.textContent = t.nombreTipo;
                select.appendChild(opt);
            });
        } catch (err) {
            console.error("Error al cargar tipos de hogar:", err);
            mostrarPopup("⚠️ No se pudieron cargar los tipos de hogar.", "warning");
        }
    }

})();
