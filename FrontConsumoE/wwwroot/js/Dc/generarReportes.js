const API_BASE_URL = "https://localhost:7245";
const token = localStorage.getItem("token");
const idHogar = localStorage.getItem("id_hogar");

document.addEventListener('DOMContentLoaded', function () {
    const btnGenerarPdf = document.getElementById('btnGenerarPdf');
    btnGenerarPdf.addEventListener('click', generarReporteConsumoPdf);
});

async function generarReporteConsumoPdf() {
    const idHogar = localStorage.getItem('idHogar'); // Asegúrate de tenerlo almacenado
    if (!idHogar) {
        mostrarModal("No se ha identificado el hogar.");
        return;
    }

    try {
        const response = await fetch(`https://localhost:7284/api/DuenioCasa/generar-reporte-pdf/{idHogar}`);
        if (!response.ok) {
            throw new Error("Error al obtener datos de consumo");
        }

        const datos = await response.json();
        if (datos.length === 0) {
            mostrarModal("No hay datos de consumo disponibles.");
            return;
        }

        generarPdfDesdeDatos(datos);
    } catch (error) {
        console.error("Error al generar el PDF:", error);
        mostrarModal("Error al generar el PDF. Intenta nuevamente.");
    }
}

function generarPdfDesdeDatos(data) {
    const doc = new window.jspdf.jsPDF();
    doc.setFontSize(16);
    doc.text("Reporte de Consumo por Hogar", 20, 20);

    const headers = ["Zona", "Electrodoméstico", "Consumo", "Consumo (Wh)"];
    const rows = data.map(d => [
        d.nombreZona,
        d.nombreElectrodomestico,
        d.consumo.toFixed(2),
        d.consumoWh.toFixed(2)
    ]);

    doc.autoTable({
        startY: 30,
        head: [headers],
        body: rows,
        theme: "grid",
        styles: { fontSize: 12 }
    });

    doc.save("reporte_consumo.pdf");
}

function mostrarModal(mensaje) {
    const modal = document.getElementById("confirmacionModal");
    const mensajeElem = document.getElementById("modalMensaje");

    mensajeElem.textContent = mensaje;
    modal.style.display = "flex";

    const btnConfirmar = document.getElementById("btnConfirmar");
    const btnCancelar = document.getElementById("btnCancelar");

    // Cerrar modal con cualquiera de los dos botones
    btnConfirmar.onclick = btnCancelar.onclick = () => {
        modal.style.display = "none";
    };
}
