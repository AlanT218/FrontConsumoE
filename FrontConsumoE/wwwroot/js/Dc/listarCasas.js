const API_URL = "https://localhost:7245/api/DuenioCasa/Hogares";
const token = localStorage.getItem("token");

// Verificar si el token está presente
if (!token) {
    window.location.href = "/User/Login"; // Si no hay token, redirige al login.
}

// Función para listar las casas desde la API
async function listarCasas() {
    const btn = document.getElementById("btn-obtener-casas");
    try {
        // Desactivar botón mientras carga
        btn.disabled = true;
        btn.innerText = "Cargando...";

        const response = await fetch(API_URL, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            console.error("Error al obtener las casas:", response.statusText);
            mostrarPopup("❌ Error al cargar las casas.", "error");
            return;
        }

        const casas = await response.json();
        mostrarCasas(casas);

    } catch (error) {
        console.error("Error en red al cargar casas:", error);
        const mensaje = encodeURIComponent(error.message);
        window.location.href = `/Home/Error?mensaje=${mensaje}`;
    } finally {
        // Reactivar el botón
        btn.disabled = false;
        btn.innerText = "Obtener Casas";
    }
}

// Función para mostrar las casas en la vista
function mostrarCasas(casas) {
    const listaCasasDiv = document.getElementById("casas-lista");
    listaCasasDiv.innerHTML = ""; // limpiar

    if (!Array.isArray(casas) || casas.length === 0) {
        listaCasasDiv.innerHTML = "<p>No hay casas registradas.</p>";
        return;
    }

    casas.forEach(casa => {
        const imagen = casa.nombreTipo === "Casa" ? "casa.jpg" :
            casa.nombreTipo === "Apartamento" ? "apartamento.jpg" :
                casa.nombreTipo === "Finca" ? "Finca.png" :
                    "default.jpg";

        const tipoFriendly = {
            "Casa": "🏠 Casa",
            "Apartamento": "🏢 Apartamento",
            "Finca": "🌳 Finca"
        };

        const infoRol = (casa.idRol == 2 || casa.idRol == 3)
            ? `<p><strong>Tu rol en esta casa:</strong> ${casa.nombreRol}</p>`
            : "";

        const card = document.createElement("div");
        card.className = "card mb-3 p-3";
        card.innerHTML = `
            <img src="/img/${imagen}" alt="${casa.nombreTipo}" style="max-width:100%;height:auto;">
            <p><strong>Nombre de la Casa:</strong> ${casa.nombre}</p>
            <p><strong>Categoría:</strong> ${tipoFriendly[casa.nombreTipo] || casa.nombreTipo}</p>
            ${infoRol}
            <button class="btn-detalles seleccionar-btn">Seleccionar</button>
        `;

        const btn = card.querySelector(".seleccionar-btn");
        btn.addEventListener("click", () => seleccionarCasa(casa.id, casa.idRol));

        listaCasasDiv.appendChild(card);
    });
}

// Función para guardar el ID del hogar seleccionado y redirigir según rol
function seleccionarCasa(idHogar, idRol) {
    localStorage.setItem("id_hogar", idHogar);

    if (idRol === 1) {
        window.location.href = "/Dueniocasa/Menu";
    } else {
        window.location.href = "/Invitacion/Invitado";
    }
}

// Agregar el evento de clic al botón
document.getElementById("btn-obtener-casas").addEventListener("click", listarCasas);
