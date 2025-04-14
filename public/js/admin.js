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
    const editButton = document.querySelector(".button");
    const nameSpan = document.querySelector(".name");
    const aboutSpan = document.querySelector(".about-me");
    const header = document.querySelector(".header");

    let lastScroll = 0;

    // Mostrar el perfil
    showProfileBtn.addEventListener("click", () => {
        perfilSection.style.display = "flex";
        overlay.style.display = "block";
    });

    // Ocultar perfil al hacer clic fuera
    overlay.addEventListener("click", () => {
        perfilSection.style.display = "none";
        overlay.style.display = "none";
    });

    // Editar información
    editButton.addEventListener("click", () => {
        const newName = prompt("Ingrese su nombre:", nameSpan.textContent);
        const newAbout = prompt("Ingrese información sobre usted:", aboutSpan.textContent);

        if (newName) {
            nameSpan.textContent = newName;
            localStorage.setItem("profileName", newName);
        }

        if (newAbout) {
            aboutSpan.textContent = newAbout;
            localStorage.setItem("profileAbout", newAbout);
        }
    });

    // Cambiar foto de perfil
    profilePic.addEventListener("click", () => {
        const newPic = prompt("Ingrese la URL de su nueva foto de perfil:");
        if (newPic) {
            profilePic.style.backgroundImage = `url(${newPic})`;
            localStorage.setItem("profilePic", newPic);
        }
    });

    // Cargar datos guardados
    function loadProfileData() {
        const savedName = localStorage.getItem("profileName");
        const savedAbout = localStorage.getItem("profileAbout");
        const savedPic = localStorage.getItem("profilePic");

        if (savedName) nameSpan.textContent = savedName;
        if (savedAbout) aboutSpan.textContent = savedAbout;
        if (savedPic) profilePic.style.backgroundImage = `url(${savedPic})`;
    }

    loadProfileData();

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
});
function showDetails(title, value, progressValue) {
    document.getElementById("detailTitle").innerText = title;
    document.getElementById("detailInfo").innerText = "Total: " + value;

    // Actualiza la barra de progreso en el modal
    let progressPercentage = (progressValue / value) * 100;
    document.getElementById("modalProgress").style.width = progressPercentage + "%";

    // Muestra el progreso exacto
    document.getElementById("progressText").innerText = `${progressValue} de ${value} completados (${progressPercentage.toFixed(1)}%)`;

    document.getElementById("overlay").style.display = "block";
    document.getElementById("detailBox").style.display = "block";
}

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

// Agregar nuevo usuario dinámicamente
function addUser() {
    let name = document.getElementById("userName").value;
    let country = document.getElementById("userCountry").value;

    if (name && country) {
        let table = document.getElementById("userTable");
        let row = table.insertRow(0);
        row.innerHTML = `
            <td width="60px">
                <div class="imgBx"><img src="assets/imgs/default.jpg" alt=""></div>
            </td>
            <td>
                <h4>${name} <br> <span>${country}</span></h4>
            </td>`;

        closeUserForm();
    } else {
        alert("Debe llenar todos los campos.");
    }
}
// Mostrar y cerrar modal de Ayuda
function openHelp() {
    document.getElementById("helpModal").style.display = "block";
}

function closeHelp() {
    document.getElementById("helpModal").style.display = "none";
}

// Mostrar y cerrar modal de Configuración
function openSettings() {
    document.getElementById("settingsModal").style.display = "block";
}

function closeSettings() {
    document.getElementById("settingsModal").style.display = "none";
}

// Cerrar modal al hacer clic fuera de él
window.onclick = function (event) {
    let helpModal = document.getElementById("helpModal");
    let settingsModal = document.getElementById("settingsModal");

    if (event.target == helpModal) {
        helpModal.style.display = "none";
    }
    if (event.target == settingsModal) {
        settingsModal.style.display = "none";
    }


}; function openAddContent() {
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
                const li = document.createElement('li');
                const estadoColor = user.estado === 'Activo' ? 'green' : 'red';
                li.innerHTML = `
                    <span>${user.nombre}</span> 
                    - <span style="color: ${estadoColor}; font-weight: bold;">${user.estado}</span>
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

