// ~/js/inicios.js

const API_BASE_URL = "https://localhost:7245";

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");
    if (!form) {
        console.error("Formulario de inicio de sesión no encontrado.");
        return;
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const correo = document.getElementById("username").value.trim();
        const contra = document.getElementById("password").value.trim();

        if (!correo || !contra) {
            mostrarPopup("Por favor, completa todos los campos.", "warning");
            return;
        }

        const loginData = { correo, contra };

        try {
            const response = await fetch(`${API_BASE_URL}/api/User/InicioSesion`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (response.ok && result.respuesta === 1 && result.token) {
                localStorage.setItem("token", result.token);
                // popup success y redirección tras 1.5 s
                mostrarPopup(result.mensaje || "Inicio de sesión exitoso.", "success", 1500);
                setTimeout(() => {
                    window.location.href = "/DuenioCasa/MenuIndex";
                }, 1500);

            } else {
                mostrarPopup(result.mensaje || "Correo o contraseña incorrectos.", "error");
            }
        } catch (error) {
            mostrarPopup("Error de conexión. Intenta más tarde.", "error");
            console.error(error);
        }
    });
});
