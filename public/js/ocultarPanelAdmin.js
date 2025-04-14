document.addEventListener("DOMContentLoaded", () => {
    const rol = localStorage.getItem("rol");
    const adminPanelLink = document.getElementById("adminPanelLink");

    if (rol !== "Administrador" && adminPanelLink) {
        adminPanelLink.style.display = "none";
    }
});
