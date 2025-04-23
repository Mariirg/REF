function mostrarPreview(input, previewId) {
    const file = input.files[0];
    const preview = document.querySelector(previewId + ' img');
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

document.getElementById('img1').addEventListener('change', function () {
    mostrarPreview(this, '#preview1');
});

document.getElementById('img2').addEventListener('change', function () {
    mostrarPreview(this, '#preview2');
});

document.getElementById("actualizarLeccionForm").addEventListener("submit", async (e) => {
    e.preventDefault();  // Prevenir el comportamiento por defecto del formulario

    // Obtener los datos del formulario
    const formData = new FormData();

    formData.append("IdCurso", document.getElementById("IdCurso").value);
    formData.append("IdLeccion", document.getElementById("IdLeccion").value);
    formData.append("titulo", document.getElementById("titulo").value);
    formData.append("introLeccion", document.getElementById("introLeccion").value);
    formData.append("introCurso", document.getElementById("introCurso").value);
    formData.append("definicion", document.getElementById("definicion").value);
    formData.append("importancia", document.getElementById("importancia").value);
    formData.append("practica", document.getElementById("practica").value);

    // Si se selecciona una imagen nueva, se añade al FormData
    const img1 = document.getElementById("img1").files[0];
    if (img1) {
        formData.append("urlimg1", img1);
    } else {
        const urlActual = document.getElementById("urlImg1").src;
        formData.append("urlImg1", urlActual);
    }

    const img2 = document.getElementById("img2").files[0];
    if (img2) {
        formData.append("urlimg2", img2);
    }else {
        const urlActual = document.getElementById("urlImg2").src;
        formData.append("urlImg2", urlActual);
    }

    formData.forEach((valor, clave) => {
        console.log(clave, valor);
    });

    try {
        const response = await fetch(`/leccion/${formData.get("IdLeccion")}`, {
            method: "PUT", // O POST dependiendo de tu configuración de backend
            body: formData, // Los datos del formulario incluyendo las imágenes
        }); 
        const result = await response.json();
        if (response.ok) {
            Swal.fire({
                title: 'Lección actualizada correctamente',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                window.location.href = 'indexCursos.html';
            });
        } else {
            Swal.fire({
                title: 'Error al actualizar la lección',
                text: result.error,
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    } catch (error) {
        console.error("Error al hacer la solicitud:", error);
        Swal.fire({
            title: 'Hubo un error al actualizar la lección',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }
});

// Función para obtener los datos de la lección y mostrarlos en el formulario
const obtenerDatosLeccion = async () => {
    try {
        const params = new URLSearchParams(window.location.search);
        const IdCurso = params.get("IdCurso"); 

        const response = await fetch(`/leccion/${IdCurso}`); 
        const leccion = await response.json();

        console.log("Lección recibida:", leccion);

        // Llenar el formulario con los datos de la lección
        document.getElementById("IdCurso").value = leccion.IdCurso;
        document.getElementById("IdLeccion").value = leccion.IdLeccion;
        document.getElementById("titulo").value = leccion.TituloLeccion;        
        document.getElementById("introLeccion").value = leccion.IntroLeccion;
        document.getElementById("introCurso").value = leccion.IntroCurso;
        document.getElementById("definicion").value = leccion.Definicion;
        document.getElementById("importancia").value = leccion.Importancia;
        document.getElementById("practica").value = leccion.Practica;

        // Mostrar imágenes si existen
        if (leccion.urlimg1) {
            document.querySelector("#preview1 img").src = leccion.urlimg1;
        }
        if (leccion.urlimg2) {
            document.querySelector("#preview2 img").src = leccion.urlimg2;
        }

    } catch (error) {
        console.error("Hubo un error al cargar la lección:", error);
    }
};

window.onload = obtenerDatosLeccion;

function volver() {
    window.location.href = 'indexCursos.html';
}
