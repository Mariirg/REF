
const Usuario = require("../models/usuarioModel");

// Obtener usuario por ID
const getUsuarioById = async (req, res) => {
  const idUsuario = parseInt(req.params.IdUsuario, 10);
  if (isNaN(idUsuario)) {
    return res.status(400).json({ error: "ID inválido. Debe ser un número." });
  }

  try {
    const usuario = await Usuario.obtenerPorId(idUsuario);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }
    res.status(200).json(usuario);
  } catch (error) {
    console.error("❌ Error al obtener el perfil del usuario:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// Actualizar perfil de usuario
const actualizarPerfilUsuario = async (req, res) => {
  const idUsuario = parseInt(req.params.IdUsuario, 10);
  const { NombreUsuario, Descripcion, FotoPerfil } = req.body;

  if (isNaN(idUsuario)) {
    return res.status(400).json({ error: "ID inválido. Debe ser un número." });
  }

  if (!NombreUsuario || !Descripcion || !FotoPerfil) {
    return res.status(400).json({ error: "Nombre, descripción y foto son requeridos." });
  }

  try {
    await Usuario.actualizarPerfil(idUsuario, NombreUsuario, Descripcion, FotoPerfil);
    res.status(200).json({ mensaje: "Perfil actualizado correctamente." });
  } catch (error) {
    console.error("❌ Error al actualizar el perfil:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// Obtener usuarios activos
const getUsuariosActivos = async (req, res) => {
  try {
    const usuarios = await Usuario.obtenerActivos();
    res.status(200).json(usuarios);
  } catch (error) {
    console.error("❌ Error al obtener usuarios activos:", error.message);
    res.status(500).json({ error: "Error al obtener usuarios activos" });
  }

};


module.exports = {
  getUsuarioById,
  actualizarPerfilUsuario,
  getUsuariosActivos,
};
