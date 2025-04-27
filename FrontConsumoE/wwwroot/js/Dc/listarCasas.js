const API_URL = "https://localhost:7245/api/DuenioCasa/Hogares";
const token = localStorage.getItem("token");

// Verificar si el token está presente
if (!token) {
    window.location.href = "/User/Login"; // Si no hay token, redirige al login.
}

// Función para listar las casas desde la API
async function listarCasas() {
    try {
        // Desactivar botón mientras carga
        const btn = document.getElementById("btn-obtener-casas");
        btn.disabled = true;
        btn.innerText = "Cargando...";

        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const casas = await response.json();
            mostrarCasas(casas);
        } else {
            console.error("Error al obtener las casas:", response.statusText);
            document.getElementById("casas-lista").innerHTML = "<p>Error al cargar las casas.</p>";
        }
    } catch (error) {
        const mensaje = encodeURIComponent(error.message);
        window.location.href = `/Home/Error?mensaje=${mensaje}`;
    } finally {
        // Reactivar el botón
        const btn = document.getElementById("btn-obtener-casas");
        btn.disabled = false;
        btn.innerText = "Obtener Casas";
    }
}

// Función para mostrar las casas en la vista
function mostrarCasas(casas) {
    const listaCasasDiv = document.getElementById("casas-lista");

    if (casas.length === 0) {
        listaCasasDiv.innerHTML = "<p>No hay casas registradas.</p>";
        return;
    }

    const casasHtml = casas.map(casa => {
        const imagen = casa.categoria === "Casa" ? "casa.jpg" :
            casa.categoria === "Apartamento" ? "apartamento.jpg" :
                "default.jpg"; // Imagen por defecto

        return `
            <div class="card mb-3 p-3">
                <img src="/img/${imagen}" alt="${casa.categoria}">
                <p><strong>Nombre de la Casa:</strong> ${casa.nombre}</p>
                <p><strong>Categoría:</strong> ${casa.categoria}</p>
                <p><strong>ID Hogar:</strong> ${casa.id}</p>
                <button class="btn-detalles" onclick="seleccionarCasa(${casa.id})">Detalles</button>
            </div>
        `;
    }).join("");

    listaCasasDiv.innerHTML = casasHtml;
}

// Función para guardar el ID del hogar seleccionado
function seleccionarCasa(idHogar) {
    localStorage.setItem("id_hogar", idHogar);
    // Puedes quitar el alert si quieres que se vea más fluido
    // alert(`Hogar seleccionado con ID: ${idHogar}`);
    window.location.href = "/DuenioCasa/GestionElec";
}

// Agregar el evento de clic al botón
document.getElementById("btn-obtener-casas").addEventListener("click", listarCasas);
