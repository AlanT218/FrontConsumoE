(() => {
        const API_BASE_URL = 'https://localhost:7245';
        const API_URL = `${API_BASE_URL}/api/DuenioCasa/recomendaciones`;
        const token = localStorage.getItem('token');
        const tbody = document.querySelector('#tblRecomendaciones tbody');
        const mensajeDiv = document.getElementById('mensaje');

        document.addEventListener('DOMContentLoaded', () => {
            if (!token) {
                // Si no hay token, redirigir a login
                window.location.href = '/User/Login';
                return;
            }
            fetchRecomendaciones();
        });

        async function fetchRecomendaciones() {
            try {
                const response = await fetch(API_URL, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401) {
                    mensajeDiv.textContent = 'No autorizado. Por favor, inicie sesión.';
                    // opcional: redirigir a login
                    setTimeout(() => window.location.href = '/User/Login', 2000);
                    return;
                }
                if (!response.ok) {
                    throw new Error(`Error ${response.status}`);
                }

                const contentType = response.headers.get('content-type') || '';
                if (!contentType.includes('application/json')) {
                    mensajeDiv.textContent = 'Respuesta inválida del servidor.';
                    return;
                }

                const data = await response.json();
                if (!Array.isArray(data) || data.length === 0) {
                    mensajeDiv.textContent = 'No hay recomendaciones disponibles.';
                    return;
                }

                data.forEach(item => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${item.nombreElectro}</td><td>${item.texto}</td>`;
                    tbody.appendChild(tr);
                });
            } catch (error) {
                console.error('Error al cargar recomendaciones:', error);
                mensajeDiv.textContent = `Error cargando recomendaciones: ${error.message}`;
            }
        }
    })();