document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idUsuario = urlParams.get("idUsuario");
    const idEvaluacion = urlParams.get("idEvaluacion");

    if (!idUsuario || !idEvaluacion) {
        document.getElementById("mensaje").textContent = "No se encontraron datos de evaluación.";
        return;
    }

    try {
        const response = await fetch(`/evaluaciones/resultado/${idUsuario}/${idEvaluacion}`);
        const data = await response.json();

        if (data.puntaje !== undefined) {
            document.getElementById("mensaje").innerHTML = `Tu puntaje es: <strong>${data.puntaje}</strong>`;
        } else {
            document.getElementById("mensaje").textContent = "No se encontró un puntaje.";
        }
    } catch (error) {
        document.getElementById("mensaje").textContent = "Error al obtener el puntaje.";
        console.error("Error:", error);
    }
});

// Botón para reintentar
document.getElementById("reintentar").addEventListener("click", () => {
    window.location.href = "evaluacion.html"; // Redirige a la evaluación
});
