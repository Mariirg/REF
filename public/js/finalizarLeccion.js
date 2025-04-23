const params = new URLSearchParams(window.location.search);
const IdCurso = params.get("IdCurso");

function finalizarCurso() {

    console.log("Anjhell lindo");
    console.log(localStorage.getItem('token'));

    fetch(`/curso/finalizar/${IdCurso}`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'), // Ajusta si guardas el token diferente
          'Content-Type': 'application/json'
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          Swal.fire({
              title: '¡Curso finalizado!',
              icon: 'success',
              confirmButtonText: 'Aceptar'
          }).then(() => {
              window.location.href = "/indexCursos.html";
          });
        }
      });
}
