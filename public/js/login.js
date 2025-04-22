// Obtener los elementos
const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

// Formularios
const loginForm = document.querySelector('.form-box.login form');
const registerForm = document.querySelector('.form-box.register form');

// Función para obtener valores de los inputs
function getInputValue(form, selector) {
    const input = form.querySelector(selector);
    return input ? input.value.trim() : "";
}

// Botones de cambio de pantalla
if (registerBtn) registerBtn.addEventListener('click', () => container?.classList.add('active'));
if (loginBtn) loginBtn.addEventListener('click', () => container?.classList.remove('active'));

// Validación de formulario de login
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const NombreUsuario = getInputValue(loginForm, 'input[name="NombreUsuario"]');
        const contrasena = getInputValue(loginForm, 'input[name="contrasena"]');

        if (!NombreUsuario || !contrasena) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ NombreUsuario, contrasena })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.mensaje || "Error al iniciar sesión.");

            alert("Inicio de sesión exitoso");
            localStorage.setItem("token", data.token);
            localStorage.setItem("rol", data.rol);
            localStorage.setItem("idCurso", data.idCurso);


            console.log("Respuesta del servidor:", data);
            console.log("Rol recibido:", data.rol);
            console.log("Usuario recibido:", data.idUsuario);

            if (data.rol === "admin") {
                window.location.href = "indexAdmin.html";
            } else {
                window.location.href = "indexCursos.html";
            }            

        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            alert(error.message);
        }
    });
}

// Validación de formulario de registro
if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const NombreUsuario = getInputValue(registerForm, 'input[name="NombreUsuario"]');
        const correo = getInputValue(registerForm, 'input[name="correo"]');
        const contrasena = getInputValue(registerForm, 'input[name="contrasena"]');
        const rol = "usuario";

        if (!NombreUsuario || !correo || !contrasena) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ NombreUsuario, correo, contrasena, rol })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.mensaje || "Error en el registro.");

            alert("Registro exitoso");
            
            if (data.rol === "admin") {
                window.location.href = "indexAdmin.html"; // Redirige a la vista de admin
            } else {
                window.location.href = "indexCursos.html"; // Redirige a la vista normal
            }
            
        } catch (error) {
            console.error("Error al registrar usuario:", error);
            alert(error.message);
        }
    });
}
