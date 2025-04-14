const jwt = require("jsonwebtoken");

// Lista negra para tokens cerrados por logout
const blacklist = new Set();

// 🔐 Middleware para verificar token JWT
function verificarToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ mensaje: "Token requerido en formato Bearer" });
    }

    const token = authHeader.split(" ")[1];

    if (blacklist.has(token)) {
        return res.status(401).json({ mensaje: "Token inválido (el usuario cerró sesión)" });
    }

    try {
        const decoded = jwt.verify(token, "secreto"); // 🔑 Usa variable de entorno en producción
        req.usuario = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ mensaje: "Token inválido o expirado" });
    }
}

// 🔐 Middleware para verificar si el usuario es administrador
function verificarAdmin(req, res, next) {
    if (!req.usuario || req.usuario.rol !== "admin") {
        return res.status(403).json({ mensaje: "Acceso denegado. Se requiere rol de administrador." });
    }
    next();
}

// ✅ Middleware para permitir solo actualización de nombre y descripción
function validarCamposPermitidos(req, res, next) {
    const camposPermitidos = ["NombreUsuario", "Descripcion","FotoPerfil"];
    const clavesRecibidas = Object.keys(req.body);

    const camposInvalidos = clavesRecibidas.filter(
        (campo) => !camposPermitidos.includes(campo)
    );

    if (camposInvalidos.length > 0) {
        return res.status(400).json({
            mensaje: `Solo se permite actualizar: ${camposPermitidos.join(", ")}.`,
            camposNoPermitidos: camposInvalidos
        });
    }

    next();F
}

module.exports = {
    verificarToken,
    verificarAdmin,
    validarCamposPermitidos,
    blacklist
};
