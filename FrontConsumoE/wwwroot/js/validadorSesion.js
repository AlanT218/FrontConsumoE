(function () {
    const token = localStorage.getItem("token");

    if (!token) {
        // Si no hay token, redirige a Home/Error
        window.location.href = "/Home/Error?mensaje=Debe+iniciar+sesión+para+acceder+a+esta+vista";
        return;
    }

    try {
        const payloadBase64 = token.split('.')[1];
        const payload = JSON.parse(atob(payloadBase64));
        const exp = payload.exp;

        if (Date.now() >= exp * 1000) {
            // Token expirado, redirige a Home/Error
            window.location.href = "/Home/Error?mensaje=Su+sesión+ha+expirado,+por+favor+inicie+sesión+nuevamente";
        }
    } catch (error) {
        // Cualquier error inesperado redirige también a Home/Error
        const mensaje = encodeURIComponent(error.message);
        window.location.href = `/Home/Error?mensaje=${mensaje}`;
    }
})();
