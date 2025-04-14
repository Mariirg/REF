document.addEventListener("DOMContentLoaded", function () {
    console.log("El script se ha cargado correctamente");

    const showProfileBtn = document.getElementById('showProfileBtn');
    const perfilSection = document.getElementById('perfilSection');
    const overlay = document.getElementById('overlay');
    const closeProfileBtn = document.getElementById('closeProfileBtn');
    const logoutBtn = document.querySelector('.logout-btn');

    // Mostrar el perfil
    showProfileBtn.addEventListener('click', function() {
        perfilSection.style.display = 'block';
        overlay.style.display = 'block';
    });

    // Cerrar el perfil
    function closeProfile() {
        perfilSection.style.display = 'none';
        overlay.style.display = 'none';
    }

    closeProfileBtn.addEventListener('click', closeProfile);
    overlay.addEventListener('click', closeProfile);

    // Obtener datos del perfil
    const userId = 1; // Cambiar por valor dinámico si es necesario
    fetch(`http://localhost:3000/perfil/${userId}`)
        .then(response => response.json())
        .then(data => {
            document.querySelector('.name').textContent = data.nombre;
            document.querySelector('.about-me').textContent = data.descripcion;
            document.querySelector('.progress-fill').style.width = `${data.progreso}%`;
        })
        .catch(error => console.error('Error al obtener el perfil:', error));
});
