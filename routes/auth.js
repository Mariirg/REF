const express = require("express");
const {
    registroUsuario,
    loginUsuario,
    logoutUsuario,
    obtenerPerfilUsuario,
    actualizarPerfilUsuario
} = require("../controllers/authcontroller");
const { verificarToken, verificarAdmin } = require("../middleware/auth");

const router = express.Router();

// 🔹 Rutas de autenticación
router.post("/registro", registroUsuario);
router.post("/login", loginUsuario);
router.post("/logout", logoutUsuario);

// 🔹 Rutas de perfil de usuario (requieren autenticación)
router.get("/perfil", verificarToken, obtenerPerfilUsuario);  // Obtener perfil del usuario
router.put("/perfil", verificarToken, actualizarPerfilUsuario); // Actualizar perfil del usuario

// 🔹 Rutas de administrador (protegidas)
router.get("/admin/dashboard", verificarToken, verificarAdmin, (req, res) => {
    res.json({ mensaje: "Bienvenido al panel de administrador" });
});

module.exports = router;
