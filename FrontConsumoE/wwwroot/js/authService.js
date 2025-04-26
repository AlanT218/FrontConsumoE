const API_URL = "https://localhost:7245/api"; // URL de backend

export async function loginUser(correo, contra) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ correo, contra }) // DTO
    });

    if (!response.ok) {
        throw new Error("Login fallido");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token); // guarda el JWT
    return data;
}


export async function registerUser(nombre, email, password) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ nombre, email, password })
    });

    if (!response.ok) {
        throw new Error("Registro fallido");
    }

    return await response.json();
}
