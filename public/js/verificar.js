document.addEventListener('DOMContentLoaded', function () {
    const boton = document.getElementById('btn-verificar');
  
    if (boton) {
        boton.addEventListener('click', function (e) {
            e.preventDefault(); // Evita el envío tradicional del formulario
  
            const correo = document.getElementById('correo').value;
            const codigo = document.getElementById('codigo').value;
  
            fetch('/api/auth/verificar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    correo: correo,
                    codigo: codigo
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.mensaje === 'Código válido') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Código verificado correctamente',
                        showConfirmButton: false,
                        timer: 2000
                    }).then(() => {
                        // Redirigir a la página de cambiar contraseña
                        window.location.href = '/nuevaContrasena'; // Asegúrate de que esta ruta sea la correcta
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message || 'Hubo un problema con la verificación',
                        background: '#fff',
                        color: '#8b5cf6'
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error verificando el código',
                    background: '#fff',
                    color: '#8b5cf6'
                });
            });
        });
    }
});
