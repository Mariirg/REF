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
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;
  
    try {
      const res = await fetch(`/api/usuarios/${id}`, {
        method: "DELETE",
      });
  
      if (res.ok) {
        alert("Usuario eliminado");
        cargarUsuarios(); // Recarga la tabla
      } else {
        alert("Error al eliminar el usuario");
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
        alert("Rol actualizado");
        cargarUsuarios();
      } else {
        alert("Error al cambiar rol");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  