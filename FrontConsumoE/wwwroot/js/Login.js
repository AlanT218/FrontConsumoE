const API_BASE_URL = "https://localhost:7245";

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");

    // Validación de existencia del formulario
    if (!form) {
        console.error("Formulario de inicio de sesión no encontrado.");
        return;
    }

    // Evento de envío del formulario
    form.addEventListener("submit", async function (e) {
        e.preventDefault(); // Previene el envío estándar del formulario

        // Obtención de valores del formulario
        const correo = document.getElementById("username").value.trim();
        const contra = document.getElementById("password").value.trim();

        if (!correo || !contra) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        const loginData = { correo, contra };

        try {
            const response = await fetch(`${API_BASE_URL}/api/User/InicioSesion`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (response.ok && result.respuesta === 1 && result.token) {
                // Almacenar el token en localStorage
                localStorage.setItem("token", result.token);
                alert(result.mensaje);

                // Redirigir a la vista de Gestión de Hogares
                window.location.href = "/DuenioCasa/GestionHogares";

            } else {
                // Mensaje de error para credenciales incorrectas
                alert(result.mensaje || "Correo o contraseña incorrectos");
            }
        } catch (error) {
            // Redirección a la página de error
            const mensaje = encodeURIComponent(error.message);
            window.location.href = `/Home/Error?mensaje=${mensaje}`;
        }
    });
});

