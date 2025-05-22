(function () {
    const API_BASE = "https://localhost:7245/api/Invitacion";
    const token = localStorage.getItem("token");

    function getUserId() {
        try {
            const payload = token.split('.')[1];
            return parseInt(JSON.parse(atob(payload))['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'], 10);
        } catch {
            return null;
        }
    }

    async function cargarPendientes() {
        const userId = getUserId();
        const cont = document.getElementById("invitaciones-lista");
        cont.innerHTML = "";

        if (!userId) {
            Swal.fire({ icon: 'error', title: 'Usuario no autenticado' });
            return;
        }

        try {
            const resp = await fetch(`${API_BASE}/pendientes/invitado/${userId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (resp.status !== 200) {
                cont.innerHTML = "<p>No tienes invitaciones pendientes.</p>";
                return;
            }

            const list = await resp.json();
            if (!Array.isArray(list) || list.length === 0) {
                cont.innerHTML = "<p>No tienes invitaciones pendientes.</p>";
                return;
            }

            list.forEach(inv => {
                const card = document.createElement("div");
                card.className = "card";

                card.innerHTML = `
                    <p>Hogar: ${inv.nombreHogar}</p>
                    <p>Invitado por: ${inv.nombreInvitador}</p>
                    <p>Fecha: ${new Date(inv.fechaInvitacion).toLocaleString()}</p>
                    <div class="btn-group">
                        <button class="btn-accion btn-aceptar">Aceptar</button>
                        <button class="btn-accion btn-rechazar">Rechazar</button>
                    </div>
                `;

                const [btnOk, btnNo] = card.querySelectorAll("button");
                btnOk.addEventListener("click", () => procesar(inv.idInvitacion, true));
                btnNo.addEventListener("click", () => procesar(inv.idInvitacion, false));

                cont.appendChild(card);
            });
        } catch (err) {
            console.error("Error al cargar invitaciones:", err);
            cont.innerHTML = "<p>No tienes invitaciones pendientes.</p>";
        }
    }

    function procesar(idInvitacion, aceptar) {
        Swal.fire({
            icon: 'question',
            title: aceptar ? '¿Aceptar invitación?' : '¿Rechazar invitación?',
            showCancelButton: true,
            confirmButtonText: aceptar ? 'Aceptar' : 'Rechazar'
        }).then(async res => {
            if (!res.isConfirmed) return;
            try {
                const ruta = aceptar ? "aceptar" : "rechazar";
                const resp = await fetch(`${API_BASE}/${ruta}`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ idInvitacion })
                });
                const body = await resp.json().catch(() => ({}));
                if (resp.ok) {
                    Swal.fire({ icon: 'success', title: body.mensaje });
                    cargarPendientes();
                } else {
                    Swal.fire({ icon: 'error', title: body.error || body.mensaje });
                }
            } catch (err) {
                console.error("Error al procesar invitación:", err);
                Swal.fire({ icon: 'error', title: 'Error interno al procesar invitación' });
            }
        });
    }

    document.addEventListener("DOMContentLoaded", cargarPendientes);
})();