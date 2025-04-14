async function cargarProgreso() {
    const IdUsuario = obtenerIdUsuario();
    console.log("ID Usuario:", IdUsuario); // Verifica si el ID se obtiene

    if (!IdUsuario) return console.error("No se encontró el IdUsuario.");

    const respuesta = await fetch(`/api/progreso/${IdUsuario}`);
    const progreso = await respuesta.json();
    console.log("Progreso recibido:", progreso); // Revisa si el backend envía algo

    document.querySelectorAll(".leccion").forEach(leccion => {
        const idLeccion = parseInt(leccion.dataset.id);
        
        if (progreso.includes(idLeccion)) {
            leccion.classList.remove("bloqueado");
            leccion.innerHTML = leccion.innerHTML.replace("🔒", "✅");
        }
    });
}

async function marcarLeccionCompletada(IdCurso, LeccionActual) {
    const IdUsuario = obtenerIdUsuario();
    if (!IdUsuario) return;

    const respuesta = await fetch("/api/progreso", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ IdUsuario, IdCurso, LeccionActual }),
    });

    const data = await respuesta.json();
    if (!respuesta.ok) return console.error("Error:", data.mensaje);

    cargarProgreso(); // Recarga las lecciones desbloqueadas
}

// Llamar a la función cuando se haga clic en una lección
document.querySelectorAll(".leccion").forEach(leccion => {
    leccion.addEventListener("click", () => {
        if (!leccion.classList.contains("bloqueado")) {
            const idLeccion = leccion.dataset.id;
            marcarLeccionCompletada("curso1", idLeccion);
        }
    });
});

// Esta función obtiene el ID del usuario (ajústala según tu autenticación)
function obtenerIdUsuario() {
    return localStorage.getItem("IdUsuario") || null;
}

// Cargar progreso al cargar la página
window.addEventListener("DOMContentLoaded", cargarProgreso);
