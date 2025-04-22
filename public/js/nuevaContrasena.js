document.getElementById("btn-cambiar").addEventListener("click", function(event) {
    event.preventDefault();

    // Obtener los valores de los inputs
    const correo = document.getElementById("correo").value;
    const nuevaContrasena = document.getElementById("nuevaContrasena").value;

    // Validar si los campos están vacíos
    if (!correo || !nuevaContrasena) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    // Enviar los datos al servidor
    fetch('/api/auth/cambiar-contrasena', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            correo: correo,
            nuevaContrasena: nuevaContrasena,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.mensaje === "Contraseña actualizada exitosamente") {
            alert("Contraseña cambiada con éxito.");
            // Redirigir al login después de cambiar la contraseña
            window.location.href = '/login'; // Aquí puedes poner la ruta correcta de tu login
        } else {
            alert(data.mensaje);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Hubo un problema con la solicitud.");
    });
});
