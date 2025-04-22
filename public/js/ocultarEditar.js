document.addEventListener("DOMContentLoaded", () => {
    const rol = localStorage.getItem("rol");

    // Verificar si el rol es "admin"
    const botonEditarLeccion = document.querySelector(".btn-editar");

    // Si el rol es "admin", quitar la clase hidden para mostrar el botón
    if (rol === "admin" && botonEditarLeccion) {
        botonEditarLeccion.classList.remove("hidden");
    } else {
        // Si no es admin, asegurarse de que esté oculto
        botonEditarLeccion.classList.add("hidden");
    }
});
