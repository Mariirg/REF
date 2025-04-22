document.getElementById("btn-solicitar-codigo").addEventListener("click", function(event) {
    event.preventDefault();
    const correo = document.getElementById("correo").value;

    if (!correo) {
        alert("Por favor ingresa tu correo.");
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
            console.log("Código enviado con éxito, redirigiendo...");
            window.location.href = '/verificar';  
        } else {
            alert(data.mensaje);
        }
    })
    .catch(error => alert("Hubo un problema con la solicitud."));
});
