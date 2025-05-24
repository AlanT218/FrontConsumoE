(function () {
    const API_BASE_URL = "https://localhost:7245";
    const token = localStorage.getItem("token");

    // Extrae el userId del JWT (claim nameidentifier)
    function getUserIdFromToken(tkn) {
        try {
            const payload = tkn.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            return parseInt(decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'], 10);
        } catch {
            return null;
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        const inputCorreo = document.getElementById("correo");
        const selectRol = document.getElementById("rol");
        const btnInvitar = document.getElementById("btnInvitar");

        const idHogar = parseInt(localStorage.getItem("id_hogar"), 10);
        const idInvitador = getUserIdFromToken(token);

        if (!idHogar) {
            mostrarPopup("❌ No se ha seleccionado un hogar.", "error");
            btnInvitar.disabled = true;
            return;
        }
        if (!idInvitador) {
            mostrarPopup("❌ No se pudo identificar al invitador.", "error");
            btnInvitar.disabled = true;
            return;
        }

        // Carga el nombre y tipo de hogar en la vista
        cargarInfoHogar(idHogar);

        btnInvitar.addEventListener("click", async () => {
            const correo = inputCorreo.value.trim();
            const rolStr = selectRol.value;

            if (!correo) {
                mostrarPopup("❌ Debe ingresar un correo.", "warning");
                return;
            }
            if (!rolStr) {
                mostrarPopup("❌ Debe seleccionar un rol.", "warning");
                return;
            }

            // 1) Obtener ID de usuario invitado por correo
            let idInvitado;
            try {
                const respUser = await fetch(
                    `${API_BASE_URL}/api/Invitacion/usuario/por-correo/${encodeURIComponent(correo)}`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                }
                );
                if (respUser.status === 404) {
                    mostrarPopup("❌ No existe ningún usuario con ese correo.", "error");
                    return;
                }
                if (!respUser.ok) throw new Error(`HTTP ${respUser.status}`);

                const bodyUser = await respUser.json();
                idInvitado = bodyUser.idUsuario;
            } catch (err) {
                console.error("Error obteniendo usuario por correo:", err);
                mostrarPopup("❌ Error al buscar usuario. Revise consola.", "error");
                return;
            }

            // 2) Convertir rol a IdRol
            const idRol = rolStr === "Invitado" ? 3 : (rolStr === "Familiar" ? 2 : 0);
            if (!idRol) {
                mostrarPopup("❌ Rol inválido.", "error");
                return;
            }

            // 3) Enviar invitación
            const dto = {
                IdInvitador: idInvitador,
                IdInvitado: idInvitado,
                IdHogar: idHogar,
                IdRol: idRol
            };

            try {
                const respInv = await fetch(
                    `${API_BASE_URL}/api/Invitacion/enviar`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(dto)
                }
                );
                const bodyInv = await respInv.json().catch(() => ({}));
                console.log("Invitación respuesta:", respInv.status, bodyInv);

                if (respInv.status === 200) {
                    mostrarPopup(`✅ ${bodyInv.mensaje}`, "success", 2500);
                    inputCorreo.value = "";
                    selectRol.value = "";
                }
                else if (respInv.status === 409) {
                    mostrarPopup(`⚠️ ${bodyInv.error}`, "warning");
                }
                else if (respInv.status === 400) {
                    mostrarPopup(`❌ ${bodyInv.error}`, "error");
                }
                else {
                    throw new Error(`Error ${respInv.status}`);
                }
            } catch (err) {
                console.error("Error al enviar invitación:", err);
                mostrarPopup("❌ Error interno al enviar invitación.", "error");
            }
        });
    });

    /**
     * Carga los datos del hogar (nombre y tipo) para el id dado
     * y los escribe en los <span id="nombreHogar"> y <span id="tipoHogar">.
     */
    async function cargarInfoHogar(idHogar) {
        try {
            const resp = await fetch(`${API_BASE_URL}/api/DuenioCasa/Hogares`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const hogares = await resp.json();
            const hogar = hogares.find(h => h.id === idHogar);
            if (!hogar) throw new Error("Hogar no encontrado.");

            document.getElementById("nombreHogar").innerText = hogar.nombre;
            document.getElementById("tipoHogar").innerText = hogar.nombreTipo;
        } catch (err) {
            console.error("Error cargando info de hogar:", err);
            mostrarPopup("⚠️ No se pudo cargar la información del hogar.", "warning");
        }
    }
})();
