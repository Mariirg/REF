document.getElementById("btn-solicitar-codigo").addEventListener("click", function(event) {
    event.preventDefault();
    const correo = document.getElementById("correo").value;

    if (!correo) {
        Swal.fire({
            icon: 'warning',
            title: 'Por favor ingresa tu correo.',
            showConfirmButton: false,
            timer: 2000,
            background: '#fff',
            color: '#8b5cf6'
        });
        return;
    }

    fetch('/api/auth/recuperar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: correo })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);  // Verifica qué estamos recibiendo del servidor
        if (data.mensaje === "Código enviado al correo") {
            Swal.fire({
                icon: 'success',
                title: 'Código enviado con éxito.',
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                window.location.href = '/verificar';  
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
        Swal.fire({
            icon: 'error',
            title: 'Hubo un problema con la solicitud.',
            background: '#fff',
            color: '#8b5cf6'
        });
    });
});
