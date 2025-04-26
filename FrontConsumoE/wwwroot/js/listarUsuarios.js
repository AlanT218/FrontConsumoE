// Este archivo se encargará de listar los usuarios.

const API_URL = "https://localhost:7245/api/User/ObtenerUsuarios";
const token = localStorage.getItem("token");

// Verificar si el token está presente
if (!token) {
    window.location.href = "/User/Login"; // Si no hay token, redirige al login.
}

// Función para listar los usuarios de la API
async function listarUsuarios() {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const usuarios = await response.json();
            mostrarUsuarios(usuarios);
        } else {
            console.error("Error al obtener los usuarios:", response.statusText);
            document.getElementById("usuarios-lista").innerHTML = "<p>Error al cargar los usuarios.</p>";
        }
    } catch (error) {
        const mensaje = encodeURIComponent(error.message);
        window.location.href = `/Home/Error?mensaje=${mensaje}`;
    }
}

// Función para mostrar los usuarios en la vista
function mostrarUsuarios(usuarios) {
    const listaUsuariosDiv = document.getElementById("usuarios-lista");

    if (usuarios.length === 0) {
        listaUsuariosDiv.innerHTML = "<p>No hay usuarios disponibles.</p>";
        return;
    }

    const usuariosHtml = usuarios.map(usuario => `
        <div class="card mb-3 p-3">
            <p><strong>Nombre:</strong> ${usuario.nombre} ${usuario.apellido}</p>
            <p><strong>Correo:</strong> ${usuario.correo}</p>
            <p><strong>Rol:</strong> ${usuario.rolNombre}</p>
        </div>
    `).join("");

    listaUsuariosDiv.innerHTML = usuariosHtml;
}

// Agregar el evento de clic al botón
document.getElementById("btn-obtener-usuarios").addEventListener("click", listarUsuarios);
