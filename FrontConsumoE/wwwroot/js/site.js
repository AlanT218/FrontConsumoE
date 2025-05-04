// — POPUP GLOBAL —
function mostrarPopup(mensaje) {
    const popup = document.getElementById("popup");
    const mensajeElem = document.getElementById("popup-mensaje");

    mensajeElem.textContent = mensaje;
    popup.classList.remove("popup-hidden");
}

function cerrarPopup() {
    const popup = document.getElementById("popup");
    popup.classList.add("popup-hidden");
}

function mostrarConfirmacion(mensaje, callbackConfirmar) {
    const modal = document.getElementById("modalConfirmacion");
    const texto = document.getElementById("modalTexto");
    const btnSi = document.getElementById("btnConfirmarSi");
    const btnNo = document.getElementById("btnConfirmarNo");

    texto.textContent = mensaje;
    modal.classList.remove("popup-hidden");

    btnSi.onclick = () => {
        modal.classList.add("popup-hidden");
        callbackConfirmar();
    };

    btnNo.onclick = () => {
        modal.classList.add("popup-hidden");
    };
}
