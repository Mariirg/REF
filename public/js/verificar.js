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
                    alert('Código verificado correctamente');
                    // Redirigir a la página de cambiar contraseña
                    window.location.href = '/nuevaContrasena'; // Asegúrate de que esta ruta sea la correcta
                } else {
                    alert(data.message || 'Hubo un problema con la verificación');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error verificando el código');
            });
        });
    }
}); 
