document.addEventListener("DOMContentLoaded", function () {
    const navbarLinks = document.querySelectorAll(".navbar a");

    navbarLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            const href = this.getAttribute("href");

            // Permitir navegación normal si es un archivo HTML externo
            if (href.includes(".html")) {
                return;
            }

            // Evita el comportamiento por defecto
            event.preventDefault();
            const targetSection = document.querySelector(href);

            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 50,
                    behavior: "smooth"
                });
            }
        });
    });
});
