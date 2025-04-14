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
            contenedor.innerHTML = '';

            data.forEach(curso => {
                /* const bloque = document.createElement('div');
                 bloque.classList.add('leccion');
                 bloque.innerHTML = `
                   <a href="leccion${Curso.IdCurso}.html">
                     <img src="${Curso.ImgMetas}" alt="${Curso.NombreCurso}" class="leccion-img">
                     <h4>${Curso.NombreCurso}</h4>
                     <p>${Curso.Descripcion}</p>
                   </a>
                 `;
                 contenedor.appendChild(bloque);*/
                // Crear div principal del curso
                const cursoDiv = document.createElement("div");
                cursoDiv.classList.add("curso");

                // Crear enlace
                const titulo = curso.NombreCurso;
                const nombreArchivo = titulo.replace(/\s+/g, "_") + ".html";
                const anchor = document.createElement("a");
                anchor.href = `/lecciones/${nombreArchivo}`;
    

               /* if (cursoData.bloqueado) {
                    anchor.classList.add("bloqueado");
                }*/

                // Imagen
                const img = document.createElement("img");
                img.src = curso.ImgMetas;
                img.alt = curso.NombreCurso;

                // Candado si está bloqueado
              /*  if (cursoData.bloqueado) {
                    const candado = document.createElement("span");
                    candado.id = "candado";
                    candado.textContent = "🔒";
                    anchor.appendChild(candado);
                }*/

                // Título
                const h3 = document.createElement("h3");
                h3.textContent = curso.NombreCurso;

                // Descripción
                const p = document.createElement("p");
                p.textContent = curso.Descripcion;

                // Añadir elementos al anchor
                anchor.append(img, h3, p);

                // Añadir anchor al div del curso
                cursoDiv.appendChild(anchor);
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
            console.error("❌ Error al obtener el ID del usuario desde el token:", error);
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

            console.log("ℹ️ Perfil cargado:", { NombreUsuario, Descripcion, FotoPerfil });
        } catch (error) {
            console.error("❌ Error al cargar el perfil:", error);
        }
    }

    async function guardarCambiosEnBD(NombreUsuario, Descripcion, FotoPerfil) {
        if (!NombreUsuario?.trim() || !Descripcion?.trim()) {
            alert("❌ Nombre y descripción son obligatorios.");
            return;
        }

        // Si no se proporciona una nueva imagen, se mantiene la actual
        const imagenActual = localStorage.getItem("perfilFoto") || "";

        const datosActualizados = {
            IdUsuario,
            NombreUsuario: NombreUsuario.trim(),
            Descripcion: Descripcion.trim(),
            FotoPerfil: FotoPerfil || imagenActual
        };

        console.log("📤 Guardando en BD:", datosActualizados);

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

            console.log("✅ Cambios guardados correctamente.");
            alert("✅ Los cambios se han guardado correctamente.");
        } catch (error) {
            console.error("❌ Error al guardar en la BD:", error.message);
            alert(`❌ Error al guardar: ${error.message}`);
        }
    }

    editButton?.addEventListener("click", () => {
        const currentName = nameSpan.textContent;
        const currentAbout = aboutSpan.textContent;

        const newName = prompt("Ingrese su nombre:", currentName);
        const newAbout = prompt("Ingrese información sobre usted:", currentAbout);

        const fondo = profilePic.style.backgroundImage;
        if (newName?.trim() && newAbout?.trim()) {
            guardarCambiosEnBD(newName, newAbout, fondo);
        } else {
            alert("❌ Por favor, completa todos los campos correctamente.");
        }
    });

    profilePic?.addEventListener("click", () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";

        fileInput.addEventListener("change", async (event) => {
            const file = event.target.files[0];
            if (!file) {
                alert("❌ Por favor, selecciona una imagen válida.");
                return;
            }

            // Subir imagen a Azure
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
                console.error("❌ Error al subir imagen o guardar perfil:", err.message);
                alert("❌ Error al subir imagen o guardar perfil.");
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
            console.error("❌ Error al obtener el rol del usuario:", error);
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
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/index.html";
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
            console.error("❌ Error cargando lecciones:", error);
        }
    }

    document.addEventListener("DOMContentLoaded", cargarLecciones);

    cargarPerfil();
    verificarRolAdmin();
});
