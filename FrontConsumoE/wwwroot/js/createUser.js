document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("register-form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const data = {
            nombre: document.getElementById("Nombre").value,
            apellido: document.getElementById("Apellido").value,
            correo: document.getElementById("Correo").value,
            contra: document.getElementById("Contra").value,
            idRol: parseInt(document.getElementById("IdRol").value),
            idEstado: parseInt(document.getElementById("IdEstado").value)
        };

        try {
            const response = await fetch("https://localhost:7245/api/User/CrearUsuario", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const text = await response.text(); // Siempre leemos como texto

            let result;
            try {
                result = JSON.parse(text);
            } catch {
                throw new Error("Respuesta inválida del servidor.");
            }

            if (response.ok) {
                mostrarPopup(result.mensaje || "✅ Usuario creado correctamente.");
                setTimeout(() => {
                    window.location.href = "/Home/Index";
                }, 2000); // Pequeño retraso para que el usuario vea el mensaje
            } else {
                throw new Error(result.message || "❌ Error desconocido al crear usuario.");
            }
        } catch (error) {
            mostrarPopup(`❌ Error: ${error.message}`, 'error');

        }
    });
});
