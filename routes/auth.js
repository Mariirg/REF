const express = require("express");
const {
    registroUsuario,
    loginUsuario,
    logoutUsuario,
    obtenerPerfilUsuario,
    solicitarRecuperacion,
    verificarCodigoRecuperacion,
    cambiarContrasena
} = require("../controllers/authcontroller");

const { verificarToken, verificarAdmin } = require("../middleware/auth");

const router = express.Router();

// 🔹 Rutas de autenticación
router.post("/registro", registroUsuario);
router.post("/login", loginUsuario);
router.post("/logout", logoutUsuario);

// 🔹 Rutas de recuperación de contraseña 
router.post("/recuperar", solicitarRecuperacion);
router.post("/verificar", verificarCodigoRecuperacion);
router.post("/cambiar-contrasena", cambiarContrasena);

// 🔹 Rutas de perfil de usuario
router.get("/perfil", verificarToken, obtenerPerfilUsuario);

// 🔹 Rutas de administrador
router.get("/admin/dashboard", verificarToken, verificarAdmin, (req, res) => {
    res.json({ mensaje: "Bienvenido al panel de administrador" });
});





module.exports = router;
