document.addEventListener("DOMContentLoaded", () => {
  cargarUsuarios();
});

async function cargarUsuarios() {
  const tabla = document.getElementById("userTableBody");
  tabla.innerHTML = ""; // Limpia la tabla

  try {
    const res = await fetch("/api/usuarios");
    const usuarios = await res.json();

    usuarios.forEach(usuario => {
      const fila = document.createElement("tr");

      fila.innerHTML = `
        <td width="60px">
          <div class="imgBx">
            <img src="${usuario.FotoPerfil || 'assets/imgs/user(1).png'}" alt="">
          </div>
        </td>
        <td>
          <h4>${usuario.NombreUsuario} <br> <span>${usuario.Rol}</span></h4>
        </td>
        <td>
          <button onclick="eliminarUsuario(${usuario.IdUsuario})" class="btn-eliminar">Eliminar</button>
          <button onclick="cambiarRol(${usuario.IdUsuario}, '${usuario.Rol}')" class="btn-rol">
            ${usuario.Rol === "admin" ? "Quitar Admin" : "Hacer Admin"}
          </button>
        </td>
      `;

      tabla.appendChild(fila);
    });
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
  }
}

async function eliminarUsuario(id) {
  const result = await Swal.fire({
    title: '¿Estás segura?',
    text: 'Este usuario será eliminado 😢',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e57373',
    cancelButtonColor: '#90caf9',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (!result.isConfirmed) return;

  try {
    const res = await fetch(`/api/usuarios/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: 'El usuario fue eliminado correctamente',
        timer: 2000,
        showConfirmButton: false,
        background: '#fff0f5',
        color: '#c2185b'
      });
      cargarUsuarios();
    } else {
      Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function cambiarRol(id, rolActual) {
  const nuevoRol = rolActual === "admin" ? "usuario" : "admin";

  try {
    const res = await fetch(`/api/usuarios/${id}/rol`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nuevoRol }),
    });

    if (res.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Rol actualizado',
        text: `Ahora es ${nuevoRol}`,
        timer: 2000,
        showConfirmButton: false,
        background: '#f3e5f5',
        color: '#6a1b9a'
      });
      cargarUsuarios();
    } else {
      Swal.fire('Error', 'No se pudo cambiar el rol', 'error');
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
