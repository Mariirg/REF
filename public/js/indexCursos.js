document.addEventListener("DOMContentLoaded", () => {
    const showProfileBtn = document.getElementById("showProfileBtn");
    const perfilSection = document.getElementById("perfilSection");
    const overlay = document.getElementById("overlay");
    const profilePic = document.querySelector(".profile-pic");
    const editButton = document.getElementById("editProfileBtn");
    const nameSpan = document.querySelector(".name");
    const aboutSpan = document.querySelector(".about-me");
    const cerrarSesionBtn = document.getElementById("cerrarSesion");
    const adminPanel = document.getElementById("adminPanel");


    fetch('/curso')
        .then(res => res.json())
        .then(data => {
            const contenedor = document.getElementById('contenedorcurso');
            const rol = localStorage.getItem("rol"); // 🔐 Traer el rol desde localStorage
            contenedor.innerHTML = '';

            data.forEach(curso => {
                const cursoDiv = document.createElement("div");
                cursoDiv.classList.add("curso");

                // Crear enlace
                const titulo = curso.NombreCurso;
                const nombreArchivo = titulo.replace(/\s+/g, "_") + ".html";
                const anchor = document.createElement("a");
                anchor.href = `/lecciones/${nombreArchivo}?IdCurso=${curso.IdCurso}`;

                // Imagen
                const img = document.createElement("img");
                img.src = curso.ImgMetas;
                img.alt = curso.NombreCurso;

                // Título
                const h3 = document.createElement("h3");
                h3.textContent = curso.NombreCurso;

                // Descripción
                const p = document.createElement("p");
                p.textContent = curso.Descripcion;

                // Añadir elementos al anchor
                anchor.append(img, h3, p);

                // Agregar anchor al curso
                cursoDiv.appendChild(anchor);

                // 🔒 Solo mostrar si es admin
                if (rol === "admin") {
                    const botonEditar = document.createElement("button");
                    botonEditar.textContent = "Editar";
                    botonEditar.classList.add("btn-curso", "btn-editar");

                    botonEditar.addEventListener("click", () => {
                        Swal.fire({
                            title: 'Editar curso',
                            html: `
                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <img src="${curso.ImgMetas}" alt="Imagen actual" style="width: 100px; height: auto; margin-bottom: 10px; border-radius: 8px;">
                            <input type="file" id="imagenCurso" class="swal2-file">
                        </div>
                        <input id="nombreCurso" class="swal2-input" placeholder="Nombre del curso" value="${curso.NombreCurso}">
                        <textarea id="descripcionCurso" class="swal2-textarea" placeholder="Descripcion">${curso.Descripcion}</textarea>
                    `,
                            showCancelButton: true,
                            confirmButtonText: 'Guardar cambios',
                            cancelButtonText: 'Cancelar',
                            confirmButtonColor: "#6d44c0",
                            cancelButtonColor: "#d33",
                            focusConfirm: false,

                            preConfirm: () => {
                                const nombre = document.getElementById('nombreCurso').value;
                                const descripcion = document.getElementById('descripcionCurso').value;
                                const inputImagen = document.getElementById('imagenCurso');
                                const imagenFile = inputImagen.files[0];
                                const imagenAnterior = curso.ImgMetas;

                                if (!nombre || !descripcion) {
                                    Swal.showValidationMessage('Nombre y descripción obligatorios.');
                                    return false;
                                }

                                const formData = new FormData();
                                formData.append("NombreCurso", nombre);
                                formData.append("Descripcion", descripcion);
                                if (imagenFile) {
                                    formData.append("imagen", imagenFile);
                                } else {
                                    formData.append("imagenAnterior", imagenAnterior);
                                }

                                return formData;
                            }

                        }).then(async (result) => {
                            if (result.isConfirmed) {
                                const formData = result.value;

                                try {
                                    const response = await fetch(`/curso/actualizar/${curso.IdCurso}`, {
                                        method: "PUT",
                                        body: formData
                                    });

                                    const data = await response.json();

                                    if (response.ok) {
                                        window.location.reload();
                                    } else {
                                        Swal.fire("Error", data.error || "No se pudo actualizar el curso.", "error");
                                    }

                                } catch (error) {
                                    console.error("Error actualizando curso:", error);
                                    Swal.fire("Error", "No se pudo actualizar el curso.", "error");
                                }
                            }
                        });
                    });

                    const botonEliminar = document.createElement("button");
                    botonEliminar.textContent = "Eliminar";
                    botonEliminar.classList.add("btn-curso", "btn-eliminar");

                    botonEliminar.addEventListener("click", () => {
                        Swal.fire({
                            title: 'Eliminar curso',
                            showCancelButton: true,
                            confirmButtonText: 'Eliminar',
                            cancelButtonText: 'Cancelar',
                            confirmButtonColor: "#6d44c0",
                            cancelButtonColor: "#d33",
                            focusConfirm: false,

                        }).then(async (result) => {
                            if (result.isConfirmed) {
                                try {
                                    const response = await fetch(`/curso/eliminar/${curso.IdCurso}/${curso.NombreCurso}`, {
                                        method: "DELETE"
                                    });

                                    const data = await response.json();

                                    if (response.ok) {
                                        window.location.reload();
                                    } else {
                                        Swal.fire("Error", data.error || "No se pudo eliminar el curso.", "error");
                                    }

                                } catch (error) {
                                    console.error("Error eliminando curso:", error);
                                    Swal.fire("Error", "No se pudo eliminar el curso.", "error");
                                }
                            }
                        });
                    });

                    // 👉 Agregar botones solo si es admin
                    cursoDiv.append(botonEditar, botonEliminar);
                }

                // 👉 Agregar el div al contenedor principal
                contenedor.appendChild(cursoDiv);
            });
        })
        .catch(err => console.error('Error al cargar cursos:', err));

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
        Swal.fire({
            icon: 'warning',
            title: 'No se ha encontrado un usuario válido.',
            text: 'Redirigiendo a la página de inicio...',
            showConfirmButton: false,
            timer: 2000,
            background: '#fff',
            color: '#8b5cf6'
          }).then(() => {
        window.location.href = "/index.html";
        return;})
    }

    async function cargarPerfil() {
        try {
            const progreso = document.getElementById("progreso-usuario")
            const response = await fetch(`http://localhost:3000/api/usuarios/${IdUsuario}`);
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            const data = await response.json();

            const NombreUsuario = localStorage.getItem("perfilNombre") || data.NombreUsuario || "Nombre no disponible";
            const Descripcion = localStorage.getItem("perfilDescripcion") || data.Descripcion || "Descripción no disponible";
            const FotoPerfil = localStorage.getItem("perfilFoto") || data.FotoPerfil;

            progreso.style.width = data.ProgresoUsuario + "%";

            progreso.innerHTML = data.ProgresoUsuario + "%";
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
            Swal.fire({
                icon: 'warning',
                title: 'Nombre y Descripcion son obligatorios',
                showConfirmButton: false,
                timer: 2000,
                background: '#fff',
                color: '#8b5cf6'
              }).then(() => {
            return; 
              })
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
            Swal.fire({
                icon: 'success',
                title: 'Los cambios se han guardado correctamente',
                showConfirmButton: 'Ok',
                timer: 2000,
                background: '#fff',
                color: '#8b5cf6'
              })
        } catch (error) {
            console.error(" Error al guardar en la BD:", error.message);
            alert(` Error al guardar: ${error.message}`);
        }
    }

    editButton?.addEventListener("click", async () => {
        const currentName = nameSpan.textContent;
        const currentAbout = aboutSpan.textContent;
    
        // Usando Swal para ingresar el nombre
        const { value: newName } = await Swal.fire({
            title: 'Ingrese su nombre',
            input: 'text',
            inputValue: currentName,
            inputPlaceholder: 'Nombre',
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            background: '#fff',
            color: '#8b5cf6',
            inputValidator: (value) => {
                if (!value.trim()) {
                    return 'El nombre no puede estar vacío';
                }
            }
        });
    
        if (newName === undefined) return; // Si el usuario cancela
    
        // Usando Swal para ingresar información sobre sí mismo
        const { value: newAbout } = await Swal.fire({
            title: 'Ingrese información sobre usted',
            input: 'textarea',
            inputValue: currentAbout,
            inputPlaceholder: 'Acerca de usted',
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            background: '#fff',
            color: '#8b5cf6',
            inputValidator: (value) => {
                if (!value.trim()) {
                    return 'La información no puede estar vacía';
                }
            }
        });
    
        if (newAbout === undefined) return; // Si el usuario cancela
    
        const fondo = profilePic.style.backgroundImage;
        const fondoLimpio = fondo.replace(/^url\(["']?/, "").replace(/["']?\)$/, "");
    
        if (newName?.trim() && newAbout?.trim()) {
            guardarCambiosEnBD(newName.trim(), newAbout.trim(), fondoLimpio);
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Por favor completa todos los campos correctamente',
                showConfirmButton: false,
                timer: 2000,
                background: '#fff',
                color: '#8b5cf6'
            });
        }
    });
    

    profilePic?.addEventListener("click", () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";

        fileInput.addEventListener("change", async (event) => {
            const file = event.target.files[0];
            if (!file) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Por favor selecciona una imagen válida',
                    showConfirmButton: false,
                    timer: 2000,
                    background: '#fff',
                    color: '#8b5cf6'
                  }).then(() => {
                return; })
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

    function getUserRole() {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.Rol;
        } catch (error) {
            console.error(" Error al obtener el rol del usuario:", error);
            return null;
        }
    }

    function verificarRolAdmin() {
        const userRole = getUserRole();
        if (adminPanel) {
            adminPanel.style.display = userRole === "admin" ? "block" : "none";
            if (userRole !== "admin") {
                alert("No tienes permisos para acceder a esta sección.");
            }
        }
    }

    cerrarSesionBtn?.addEventListener("click", () => {
        Swal.fire({
            icon: 'success',
            title: '¡Esperamos verte pronto!',
            text: 'Cerrar sesión exitoso',
            showConfirmButton: false,
            timer: 2000,
            background: '#fff',
            color: '#8b5cf6'
          }).then(() => { 
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/index.html";
          });
    });

    async function cargarLecciones() {
        try {
            const res = await fetch("http://localhost:3000/api/lecciones");
            const lecciones = await res.json();

            const contenedor = document.getElementById("contenedorLecciones");
            contenedor.innerHTML = "";

            lecciones.forEach(leccion => {
                const div = document.createElement("div");
                div.classList.add("leccion");
                div.innerHTML = `
                    <h3>${leccion.titulo}</h3>
                    <p>${leccion.subtitulo}</p>
                    <p>${leccion.descripcion}</p>
                    <hr>
                `;
                contenedor.appendChild(div);
            });
        } catch (error) {
            console.error(" Error cargando lecciones:", error);
        }
    }


    document.addEventListener("DOMContentLoaded", cargarLecciones);

    cargarPerfil();
    verificarRolAdmin();
});
function editar() {
    const params = new URLSearchParams(window.location.search);
    const IdCurso = params.get("IdCurso");
    window.location.href = `/editarLeccion.html?IdCurso=${IdCurso}`
}
