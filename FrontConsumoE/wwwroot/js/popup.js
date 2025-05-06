// ~/Scripts/popup.js

/**
 * Muestra un popup con SweetAlert2.
 * @param {string} mensaje  — Texto a mostrar.
 * @param {'success'|'error'|'warning'|'info'} [icon='info'] — Icono.
 * @param {number} [timer=null] — Tiempo en ms para autocerrar (null = requiere click).
 */
function mostrarPopup(mensaje, icon = 'info', timer = null) {
    const options = {
        icon,
        title: mensaje,
        confirmButtonText: 'OK'
    };
    if (timer) {
        options.timer = timer;
        options.showConfirmButton = false;
    }
    Swal.fire(options);
}
