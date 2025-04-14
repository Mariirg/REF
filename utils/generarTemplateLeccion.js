const fs = require('fs');
const path = require('path');

const generarTemplateLeccion = (titulo, contenido) => {
  const html = `
  <!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Lección: ${contenido.TituloLeccion}</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Roboto:wght@300;400&display=swap"
    rel="stylesheet" />
    <link rel="stylesheet" href="/public/curso1/css/leccion1.css">
  <link rel="icon" href="../../public/img/logo22.png" sizes="32x32" type="image/png" />
</head>

<body>
  <form class="form-container">
    <header>
      <a href="/indexCursos.html" class="logo">REF</a>
      <nav class="navbar">
        <a href="/indexCursos.html">Inicio</a>
        <button type="button" id="showProfileBtn">Perfil</button>
      </nav>
    </header>

    <div class="container">
      <section class="leccion" id="leccion1">
        <h1 class="titulo">${contenido.TituloLeccion}</h1>
        <p>${contenido.IntroLeccion}</p>
      </section>

      <section class="contenido-curso">
        <h2>Introducción al Curso</h2>
        <p>${contenido.IntroCurso}</p>

        <h2 class="subtitulo">¿Qué es?</h2>
        <p>${contenido.Definicion}</p>

      <div class="imagenes-leccion">
       <figure>
          <img src="${contenido.urlimg1}" alt="Imagen explicativa 1" />
          <figcaption>Ilustración introductoria de la lección</figcaption>
        </figure>
            <figure>
          <img src="${contenido.urlimg2}" alt="Imagen explicativa 1" />
          <figcaption>Ilustración introductoria de la lección</figcaption>
        </figure>
            </div>

        <h3 class="subtitulo">¿Por qué es importante?</h3>
        <p>${contenido.Importancia}</p>

        <div class="practica">
          <h2>Práctica recomendada:</h2>
          <p>${contenido.Practica}</p>
        </div>
      </section>
    </div>
</form>

      <footer>
        <p>&copy; 2025 Red de Educación Financiera. MyD.</p>
        <div class="social-icons">
          <a href="#" aria-label="Instagram">Instagram</a>
          <a href="#" aria-label="Facebook">Facebook</a>
          <a href="#" aria-label="LinkedIn">LinkedIn</a>
        </div>
      </footer>
   

  <script src="../../public/js/leccion1.js"></script>
</body>

</html>

    `;

  const ruta = path.join(__dirname, `../views/lecciones/${titulo.replace(/\s+/g, "_")}.html`);
  fs.writeFileSync(ruta, html, 'utf8');
};

module.exports = generarTemplateLeccion;
