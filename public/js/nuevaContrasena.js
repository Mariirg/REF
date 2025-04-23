document.getElementById("btn-cambiar").addEventListener("click", function(event) {
    event.preventDefault();

    // Obtener los valores de los inputs
    const correo = document.getElementById("correo").value;
    const nuevaContrasena = document.getElementById("nuevaContrasena").value;

    // Validar si los campos están vacíos
    if (!correo || !nuevaContrasena) {
        Swal.fire({
            icon: 'warning',
            title: 'Por favor, complete todos los campos.',
            showConfirmButton: false,
            timer: 2000,
            background: '#fff',
            color: '#8b5cf6'
        });
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
            Swal.fire({
                icon: 'success',
                title: 'Contraseña cambiada con éxito.',
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                // Redirigir al login después de cambiar la contraseña
                window.location.href = '/login'; // Aquí puedes poner la ruta correcta de tu login
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.mensaje,
                background: '#fff',
                color: '#8b5cf6'
            });
        }
    })
    .catch(error => {
        console.error("Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Hubo un problema con la solicitud.',
            background: '#fff',
            color: '#8b5cf6'
        });
    });
});
