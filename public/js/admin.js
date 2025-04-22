// add hovered class to selected list item
let list = document.querySelectorAll(".navigation li");
let cerrarSesionBtn = document.getElementById("cerrarSesion");
let cerrarSesionBtn2 = document.getElementById("cerrarSesion2");

function activeLink() {
    list.forEach((item) => {
        item.classList.remove("hovered");
    });
    this.classList.add("hovered");
}

list.forEach((item) => item.addEventListener("mouseover", activeLink));

// Menu Toggle
let toggle = document.querySelector(".toggle");
let navigation = document.querySelector(".navigation");
let main = document.querySelector(".main");

toggle.onclick = function () {
    navigation.classList.toggle("active");
    main.classList.toggle("active");
};
document.addEventListener("DOMContentLoaded", () => {
    const showProfileBtn = document.getElementById("showProfileBtn");
    const perfilSection = document.getElementById("perfilSection");
    const overlay = document.getElementById("overlay");
    const profilePic = document.querySelector(".profile-pic");
    const editButton = document.getElementById("editProfileBtn");
    const nameSpan = document.querySelector(".name");
    const aboutSpan = document.querySelector(".about-me");
    const cerrarSesionBtn = document.getElementById("cerrarSesion");

    let lastScroll = 0;

    showProfileBtn?.addEventListener("click", () => {
        perfilSection.style.display = "flex";
        overlay.style.display = "block";
        perfilSection.classList.add("fade-in");
        overlay.classList.add("fade-in");
    });

    overlay?.addEventListener("click", () => {
        perfilSection.classList.remove("fade-in");
        overlay.classList.remove("fade-in");
        setTimeout(() => {
            perfilSection.style.display = "none";
            overlay.style.display = "none";
        }, 300);
    });

    function getUserIdFromToken() {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.id;
        } catch (error) {
            console.error(" Error al obtener el ID del usuario desde el token:", error);
            return null;
        }
    }

    const IdUsuario = getUserIdFromToken();
    if (!IdUsuario) {
        alert("No se ha encontrado un usuario válido. Redirigiendo a la página de inicio...");
        window.location.href = "/index.html";
        return;
    }

    async function cargarPerfil() {
        try {
            const response = await fetch(`http://localhost:3000/api/usuarios/${IdUsuario}`);
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            const data = await response.json();

            const NombreUsuario = localStorage.getItem("perfilNombre") || data.NombreUsuario || "Nombre no disponible";
            const Descripcion = localStorage.getItem("perfilDescripcion") || data.Descripcion || "Descripción no disponible";
            const FotoPerfil = localStorage.getItem("perfilFoto") || data.FotoPerfil;

            nameSpan.textContent = NombreUsuario;
            aboutSpan.textContent = Descripcion;

            if (profilePic && FotoPerfil) {
                profilePic.style.backgroundImage = `url(${FotoPerfil})`;
            }

            console.log(" Perfil cargado:", { NombreUsuario, Descripcion, FotoPerfil });
        } catch (error) {
            console.error(" Error al cargar el perfil:", error);
        }
    }

    async function guardarCambiosEnBD(NombreUsuario, Descripcion, FotoPerfil) {
        if (!NombreUsuario?.trim() || !Descripcion?.trim()) {
            alert(" Nombre y descripción son obligatorios.");
            return;
        }

        const datosActualizados = {
            IdUsuario,
            NombreUsuario: NombreUsuario.trim(),
            Descripcion: Descripcion.trim(),
            imgUrl: FotoPerfil
        };

        console.log(" Guardando en BD:", datosActualizados);

        try {
            const response = await fetch(`http://localhost:3000/api/usuarios/${IdUsuario}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosActualizados)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error desconocido al guardar");
            }

            localStorage.setItem("perfilNombre", NombreUsuario);
            localStorage.setItem("perfilDescripcion", Descripcion);
            if (FotoPerfil) localStorage.setItem("perfilFoto", FotoPerfil);

            nameSpan.textContent = NombreUsuario;
            aboutSpan.textContent = Descripcion;
            if (profilePic) profilePic.style.backgroundImage = `url(${FotoPerfil})`;

            console.log(" Cambios guardados correctamente.");
            alert(" Los cambios se han guardado correctamente.");
        } catch (error) {
            console.error(" Error al guardar en la BD:", error.message);
            alert(` Error al guardar: ${error.message}`);
        }
    }

    editButton?.addEventListener("click", () => {
        const currentName = nameSpan.textContent;
        const currentAbout = aboutSpan.textContent;

        const newName = prompt("Ingrese su nombre:", currentName);
        const newAbout = prompt("Ingrese información sobre usted:", currentAbout);

        const fondo = profilePic.style.backgroundImage;
        const fondoLimpio = fondo.replace(/^url\(["']?/, "").replace(/["']?\)$/, "");

        if (newName?.trim() && newAbout?.trim()) {
            guardarCambiosEnBD(newName.trim(), newAbout.trim(), fondoLimpio);
        } else {
            alert(" Por favor, completa todos los campos correctamente.");
        }
    });


    profilePic?.addEventListener("click", () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";

        fileInput.addEventListener("change", async (event) => {
            const file = event.target.files[0];
            if (!file) {
                alert(" Por favor, selecciona una imagen válida.");
                return;
            }

            const formData = new FormData();
            formData.append("image", file);

            try {
                const uploadResponse = await fetch("http://localhost:3000/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    const errorData = await uploadResponse.json();
                    throw new Error(errorData.error || "Error al subir la imagen");
                }

                const { imageUrl } = await uploadResponse.json();
                // Actualizar visualmente la imagen
                profilePic.style.backgroundImage = `url(${imageUrl})`;
                // Guardar en la base de datos
                const currentName = nameSpan.textContent;
                const currentAbout = aboutSpan.textContent;
                await guardarCambiosEnBD(currentName, currentAbout, imageUrl);

            } catch (err) {
                console.error(" Error al subir imagen o guardar perfil:", err.message);
                alert(" Error al subir imagen o guardar perfil.");
            }
        });

        fileInput.click();
    });

    cerrarSesionBtn?.addEventListener("click", () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/index.html";
    });
    // Ocultar header en scroll hacia abajo y mostrarlo en scroll hacia arriba
    window.addEventListener("scroll", () => {
        let currentScroll = window.scrollY;
        if (currentScroll > lastScroll) {
            header.style.top = "-60px"; // Ocultar
        } else {
            header.style.top = "0"; // Mostrar
        }
        lastScroll = currentScroll;
    });
    cargarPerfil();
});

function closeDetails() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("detailBox").style.display = "none";
}

function closeUsers() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("userBox").style.display = "none";
}
// Función para agregar una nueva actividad
function addActivity() {
    let user = prompt("Ingrese el nombre del usuario:");
    let activity = prompt("Ingrese la actividad realizada:");
    let date = new Date().toLocaleDateString();

    if (user && activity) {
        let table = document.getElementById("activityTable");
        let row = table.insertRow(0);
        row.innerHTML = `<td>${user}</td><td>${activity}</td><td>${date}</td>`;
    } else {
        alert("Debe llenar todos los campos.");
    }
}

// Abrir y cerrar formulario de usuario
function openUserForm() {
    document.getElementById("userForm").style.display = "block";
}

function closeUserForm() {
    document.getElementById("userForm").style.display = "none";
}


// Mostrar y cerrar modal de Ayuda
function openHelp() {
    document.getElementById("helpModal").style.display = "block";
}

function closeHelp() {
    document.getElementById("helpModal").style.display = "none";
}

overlay.addEventListener("click", () => {
    userBox.style.display = "none";
    overlay.style.display = "none";
});


function openAddContent() {
    document.getElementById("addContentModal").style.display = "block";
}

function closeAddContent() {
    document.getElementById("addContentModal").style.display = "none";
}


function saveContent() {
    let title = document.getElementById("title").value;
    let content = document.getElementById("content").value;

    if (title.trim() === "" || content.trim() === "") {
        alert("Por favor, completa todos los campos.");
        return;
    }

    alert("Contenido guardado: " + title);
    closeAddContent();
}
// Abrir y cerrar el modal de "Agregar Contenido"
function openAddContent() {
    document.getElementById("addContentModal").style.display = "block";
}

function closeAddContent() {
    document.getElementById("addContentModal").style.display = "none";
}
// Función para abrir el modal
function openUserView() {
    document.getElementById("userModal").style.display = "block";
}

// Función para cerrar el modal
function closeUserView() {
    document.getElementById("userModal").style.display = "none";
}

// Cerrar el modal al hacer clic fuera de él
window.onclick = function (event) {
    let modal = document.getElementById("userModal");
    if (event.target === modal) {
        closeUserView();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("overlay");

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = "block";
            overlay.style.display = "block";
        } else {
            console.error("No se encontró el modal:", modalId);
        }
    }

    function closeModal() {
        overlay.style.display = "none";
        document.querySelectorAll(".modal").forEach(modal => {
            modal.style.display = "none";
        });
    }

    // Eventos para abrir los modales
    document.getElementById("openSettingsBtn")?.addEventListener("click", () => openModal("settingsModal"));
    document.getElementById("openAddContentBtn")?.addEventListener("click", () => openModal("addContentModal"));

    // Evento para cerrar el modal al hacer clic en el overlay
    overlay.addEventListener("click", closeModal);

    // Funciones globales para cerrar los modales
    window.closeAddContent = closeModal;
    window.closeSettings = closeModal;
});
function abrirInput(inputId) {
    document.getElementById(inputId).click();
}

function cambiarImagen(event, imgId) {
    let imagen = document.getElementById(imgId);
    let file = event.target.files[0];

    if (file) {
        let reader = new FileReader();
        reader.onload = function (e) {
            imagen.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}
cerrarSesionBtn.addEventListener("click", function () {
    localStorage.clear();
    sessionStorage.clear();
    alert("Sesión cerrada correctamente");
    setTimeout(() => {
        window.location.href = "/index.html";
    }, 1000); // Redirige después de 1 segundo
});

cerrarSesionBtn2.addEventListener("click", function () {
    localStorage.clear();
    sessionStorage.clear();
    alert("Sesión cerrada correctamente");
    setTimeout(() => {
        window.location.href = "/index.html";
    }, 1000); // Redirige después de 1 segundo
});

function showUsers() {
    fetch('/api/usuarios/activos')
        .then(res => res.json())
        .then(data => {
            const userList = document.getElementById('userList');
            userList.innerHTML = '';

            if (data.length === 0) {
                userList.innerHTML = '<li>No hay usuarios disponibles</li>';
                return;
            }

            data.forEach(user => {
                const estadoTexto = user.estado ? 'Activo' : 'Inactivo';
                const estadoColor = user.estado ? 'green' : 'red';

                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${user.nombre}</span> 
                    - <span style="color: ${estadoColor}; font-weight: bold;">${estadoTexto}</span>
                `;
                userList.appendChild(li);
            });

            document.getElementById('userBox').style.display = 'block';
            document.getElementById('overlay').style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

const formCurso = document.getElementById('formCurso');
const formLeccion = document.getElementById('formLeccion');

async function obtenerTotalUsuariosActivos() {
    try {
        const response = await fetch('/api/usuarios/activos'); // ← asegúrate que esta es la ruta correcta
        const usuarios = await response.json();
        const total = usuarios.length;

        // Mostrar el número en el HTML
        document.getElementById('totalUsuariosActivos').textContent = total;
    } catch (error) {
        console.error('❌ Error al obtener usuarios activos:', error);
        document.getElementById('totalUsuariosActivos').textContent = 'Error';
    }
}

// Ejecutar la función cuando cargue la página
window.addEventListener('DOMContentLoaded', obtenerTotalUsuariosActivos);


// Paso del curso al formulario de lección
formCurso.addEventListener('submit', function (e) {
    e.preventDefault();
    formCurso.style.opacity = 0;
    setTimeout(() => {
        formCurso.style.display = 'none';
        formLeccion.style.display = 'block';
        setTimeout(() => {
            formLeccion.style.opacity = 1;
        }, 50);
    }, 300);
});

// Guardar todo a la base de datos desde el segundo paso
formLeccion.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData();

    // Agregamos los campos del curso
    const cursoData = new FormData(formCurso);
    for (let [key, value] of cursoData.entries()) {
        formData.append(key, value);
    }

    // Agregamos los campos de la lección
    const leccionData = new FormData(formLeccion);
    for (let [key, value] of leccionData.entries()) {
        formData.append(key, value);
    }

    try {
        const res = await fetch('/curso', {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            alert('Curso guardado con éxito 🎉');
        } else {
            alert('Error al guardar');
        }

    } catch (error) {
        console.error('Error en la petición:', error);
    }
});

function volverAlCurso() {
    formLeccion.style.opacity = 0;
    setTimeout(() => {
        formLeccion.style.display = 'none';
        formCurso.style.display = 'block';
        setTimeout(() => {
            formCurso.style.opacity = 1;
        }, 50);
    }, 300);

}



