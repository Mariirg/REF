const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("../models/database");

const blacklist = new Set(); // tokens inválidos

// 🔹 REGISTRO
const registroUsuario = async (req, res) => {
    const { NombreUsuario, correo, contrasena, rol } = req.body;

    if (!NombreUsuario || !correo || !contrasena) {
        return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    try {
        const pool = await poolPromise;
        const existeUsuario = await pool.request()
            .input("NombreUsuario", sql.VarChar, NombreUsuario)
            .query("SELECT * FROM usuarios WHERE NombreUsuario = @NombreUsuario");

        if (existeUsuario.recordset.length > 0) {
            return res.status(400).json({ mensaje: "El usuario ya está registrado" });
        }

        const hashedPassword = await bcrypt.hash(contrasena, 10);
        const rolValido = rol === "admin" ? "admin" : "usuario";

        await pool.request()
            .input("NombreUsuario", sql.VarChar, NombreUsuario)
            .input("correo", sql.VarChar, correo)
            .input("contrasena", sql.VarChar, hashedPassword)
            .input("rol", sql.VarChar, rolValido)
            .query(`
                INSERT INTO usuarios (NombreUsuario, correo, contrasena, rol) 
                VALUES (@NombreUsuario, @correo, @contrasena, @rol)
            `);

        res.json({ mensaje: "Usuario registrado exitosamente" });
    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
};

// 🔹 LOGIN
const loginUsuario = async (req, res) => {
    const { NombreUsuario, contrasena } = req.body;

    if (!NombreUsuario || !contrasena) {
        return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("NombreUsuario", sql.VarChar, NombreUsuario)
            .query("SELECT IdUsuario, NombreUsuario, Contrasena, Rol FROM usuarios WHERE NombreUsuario = @NombreUsuario");

        if (result.recordset.length === 0) {
            return res.status(401).json({ mensaje: "Usuario no encontrado" });
        }

        const usuario = result.recordset[0];

        if (!usuario.Contrasena) {
            return res.status(500).json({ mensaje: "Usuario con contraseña inválida" });
        }

        const isMatch = await bcrypt.compare(contrasena, usuario.Contrasena);
        if (!isMatch) {
            return res.status(401).json({ mensaje: "Contraseña incorrecta" });
        }

        const token = jwt.sign(
            { id: usuario.IdUsuario, NombreUsuario: usuario.NombreUsuario, rol: usuario.Rol },
            "secreto", { expiresIn: "1h" }
        );

        res.json({ mensaje: "Login exitoso", token, rol: usuario.Rol });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
};

// 🔹 LOGOUT
const logoutUsuario = (req, res) => {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(400).json({ mensaje: "No hay token proporcionado" });
    }

    const tokenSinBearer = token.split(" ")[1];
    blacklist.add(tokenSinBearer);

    res.json({ mensaje: "Sesión cerrada correctamente" });
};

// 🔹 OBTENER PERFIL
const obtenerPerfilUsuario = async (req, res) => {
    try {
        const userId = req.usuario.id;

        const pool = await poolPromise;
        const result = await pool.request()
            .input("IdUsuario", sql.Int, userId)
            .query("SELECT NombreUsuario, correo, rol, Descripcion FROM usuarios WHERE IdUsuario = @IdUsuario");

        if (result.recordset.length > 0) {
            return res.json(result.recordset[0]);
        } else {
            return res.status(404).json({ mensaje: "Perfil no encontrado." });
        }
    } catch (error) {
        console.error("Error al obtener el perfil:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
};

// 🔹 ACTUALIZAR PERFIL (solo nombre y descripción)
const actualizarPerfilUsuario = async (req, res) => {
    try {
        const { NombreUsuario, Descripcion } = req.body;
        const userId = req.usuario.id;

        if (!NombreUsuario || !Descripcion) {
            return res.status(400).json({ mensaje: "Nombre y descripción son obligatorios" });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input("IdUsuario", sql.Int, userId)
            .input("NombreUsuario", sql.VarChar, NombreUsuario)
            .input("Descripcion", sql.VarChar, Descripcion)
            .query(`
                UPDATE usuarios 
                SET NombreUsuario = @NombreUsuario, Descripcion = @Descripcion 
                WHERE IdUsuario = @IdUsuario
            `);

        if (result.rowsAffected[0] > 0) {
            return res.json({ mensaje: "Perfil actualizado correctamente." });
        } else {
            return res.status(404).json({ mensaje: "Perfil no encontrado." });
        }
    } catch (error) {
        console.error("Error al actualizar el perfil:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
};

module.exports = {
    registroUsuario,
    loginUsuario,
    logoutUsuario,
    obtenerPerfilUsuario,
    actualizarPerfilUsuario,
    blacklist
};
