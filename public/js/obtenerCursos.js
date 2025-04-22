// Función para obtener todos los cursos y mostrarlos
async function obtenerCursos() {
    try {
      const response = await fetch('http://localhost:3000/curso');
      const cursos = await response.json();
      const listaCursos = document.getElementById('curso-lista');
  
      cursos.forEach(curso => {
        const li = document.createElement('li');
        li.textContent = `${curso.NombreCurso}: ${curso.Descripcion}`;
        listaCursos.appendChild(li);
      });
    } catch (error) {
      console.error('Error al obtener los cursos:', error);
    }
  }
  
  // Función para obtener el total de cursos y mostrarlo
  async function obtenerTotalCursos() {
    try {
      const response = await fetch('http://localhost:3000/curso/total');
      const data = await response.json();
      const totalCursos = document.getElementById('total-cursos');
      totalCursos.textContent = data.total;
    } catch (error) {
      console.error('Error al obtener el total de cursos:', error);
    }
  }
  
  // Llamar a las funciones al cargar la página
  document.addEventListener('DOMContentLoaded', () => {
    obtenerCursos();
    obtenerTotalCursos();
  });
  