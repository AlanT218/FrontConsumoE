const API_BASE_URL = "https://localhost:7245";

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");

    if (!form) {
        console.error("Formulario no encontrado");
        return;
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const correo = document.getElementById("username").value;
        const contra = document.getElementById("password").value;

        if (!correo || !contra) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        const loginData = {
            correo: correo,
            contra: contra
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/User/InicioSesion`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (result.respuesta === 1 && result.token) {
                localStorage.setItem("token", result.token);
                alert(result.mensaje);

                // Redirige a otra vista:
                window.location.href = "/User/HomeUser";

            } else {
                alert(result.mensaje || "Correo o contraseña incorrectos");
            }

        } catch (error) {
            const mensaje = encodeURIComponent(error.message);
            window.location.href = `/Home/Error?mensaje=${mensaje}`;
        }
    });
});
