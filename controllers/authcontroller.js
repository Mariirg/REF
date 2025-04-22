const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("../models/database");
const nodemailer = require("nodemailer");

const codigosRecuperacion = {};
const blacklist = new Set();

// 🔹 REGISTRO
const registroUsuario = async (req, res) => {
    const { NombreUsuario, correo, contrasena, rol } = req.body;

    console.log("Intentando registrar usuario:", NombreUsuario);

    if (!NombreUsuario || !correo || !contrasena) {
        console.log("Faltan campos para el registro");
        return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    try {
        const pool = await poolPromise;
        const existeUsuario = await pool.request()
            .input("NombreUsuario", sql.VarChar, NombreUsuario)
            .query("SELECT * FROM usuarios WHERE NombreUsuario = @NombreUsuario");

        if (existeUsuario.recordset.length > 0) {
            console.log("Usuario ya registrado:", NombreUsuario);
            return res.status(400).json({ mensaje: "El usuario ya está registrado" });
        }

        const hashedPassword = await bcrypt.hash(contrasena, 10);
        const rolValido = rol === "admin" ? "admin" : "usuario";

        const resultado = await pool.request()
            .input("NombreUsuario", sql.VarChar, NombreUsuario)
            .input("correo", sql.VarChar, correo)
            .input("contrasena", sql.VarChar, hashedPassword)
            .input("rol", sql.VarChar, rolValido)
            .input("ProgresoUsuario", sql.Decimal(5, 2), 0)
            .query(`
                INSERT INTO usuarios (NombreUsuario, correo, contrasena, rol, ProgresoUsuario) 
                OUTPUT INSERTED.IdUsuario
                VALUES (@NombreUsuario, @correo, @contrasena, @rol, @ProgresoUsuario)
            `);

        const nuevoIdUsuario = resultado.recordset[0].IdUsuario;

        // Obtener todos los cursos
        const cursos = await pool.request()
            .query("SELECT IdCurso FROM Cursos");

        for (const curso of cursos.recordset) {
            await pool.request()
                .input("IdUsuario", sql.Int, nuevoIdUsuario)
                .input("IdCurso", sql.Int, curso.IdCurso)
                .input("Completado", sql.Bit, 0) // al inicio todos incompletos
                .query("INSERT INTO ProgresoUsuario (IdUsuario, IdCurso, Completado) VALUES (@IdUsuario, @IdCurso, @Completado)");
        }

        console.log("Usuario registrado con éxito:", NombreUsuario);
        res.json({ mensaje: "Usuario registrado exitosamente" });
    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
};

// 🔹 LOGIN
const loginUsuario = async (req, res) => {
    const { NombreUsuario, contrasena } = req.body;

    console.log("Intentando login:", NombreUsuario);

    if (!NombreUsuario || !contrasena) {
        console.log("Faltan campos para login");
        return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("NombreUsuario", sql.VarChar, NombreUsuario)
            .query("SELECT IdUsuario, NombreUsuario, Contrasena, Rol FROM usuarios WHERE NombreUsuario = @NombreUsuario");

        if (result.recordset.length === 0) {
            console.log("Usuario no encontrado:", NombreUsuario);
            return res.status(401).json({ mensaje: "Usuario no encontrado" });
        }

        const usuario = result.recordset[0];

        if (!usuario.Contrasena) {
            console.log("Contraseña inválida");
            return res.status(500).json({ mensaje: "Usuario con contraseña inválida" });
        }

        const isMatch = await bcrypt.compare(contrasena, usuario.Contrasena);
        if (!isMatch) {
            console.log("Contraseña incorrecta para", NombreUsuario);
            return res.status(401).json({ mensaje: "Contraseña incorrecta" });
        }

        const token = jwt.sign(
            { id: usuario.IdUsuario, NombreUsuario: usuario.NombreUsuario, rol: usuario.Rol },
            "secreto", { expiresIn: "1h" }
        );

        console.log("Login exitoso para:", NombreUsuario);
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
        console.log("No se proporcionó token para logout");
        return res.status(400).json({ mensaje: "No hay token proporcionado" });
    }

    const tokenSinBearer = token.split(" ")[1];
    blacklist.add(tokenSinBearer);

    console.log("Token añadido a la blacklist:", tokenSinBearer);
    res.json({ mensaje: "Sesión cerrada correctamente" });
};

// 🔹 OBTENER PERFIL
const obtenerPerfilUsuario = async (req, res) => {
    try {
        const userId = req.usuario.id;
        console.log("Obteniendo perfil del usuario con ID:", userId);

        const pool = await poolPromise;
        const result = await pool.request()
            .input("IdUsuario", sql.Int, userId)
            .query("SELECT NombreUsuario, correo, rol, Descripcion, ProgresoUsuario FROM usuarios WHERE IdUsuario = @IdUsuario");

        if (result.recordset.length > 0) {
            console.log("Perfil encontrado:", result.recordset[0]);
            return res.json(result.recordset[0]);
        } else {
            console.log("Perfil no encontrado para ID:", userId);
            return res.status(404).json({ mensaje: "Perfil no encontrado." });
        }
    } catch (error) {
        console.error("Error al obtener el perfil:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
};

// 🔹 SOLICITAR CÓDIGO
const solicitarRecuperacion = async (req, res) => {
    const { correo } = req.body;

    if (!correo) return res.status(400).json({ mensaje: "El correo es obligatorio" });

    try {
        const pool = await poolPromise;
        const resultado = await pool.request()
            .input("correo", sql.VarChar, correo)
            .query("SELECT IdUsuario FROM usuarios WHERE correo = @correo");

        if (resultado.recordset.length === 0) {
            console.log("Correo no registrado:", correo);
            return res.status(404).json({ mensaje: "Correo no registrado" });
        }

        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        codigosRecuperacion[correo] = { codigo, expiracion: Date.now() + 10 * 60 * 1000 };

        console.log("Código de recuperación generado para", correo, "Código:", codigo);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });

        await transporter.sendMail({
            from: "Recuperación de contraseña",
            to: correo,
            subject: "Equipo REF",
            text: `Has solicitado recuperar tu contraseña. Usa el siguiente código para completar el proceso: ${codigo}`
        });

        console.log("Correo enviado exitosamente a:", correo);
        res.json({ mensaje: "Código enviado al correo" });
    } catch (error) {
        console.error("Error al enviar código:", error);
        res.status(500).json({ mensaje: "Error al enviar el código" });
    }
};

// 🔹 VERIFICAR CÓDIGO
const verificarCodigoRecuperacion = (req, res) => {
    const { correo, codigo } = req.body;

    const data = codigosRecuperacion[correo];

    console.log("Verificando código para:", correo, "Código recibido:", codigo, "Datos guardados:", data);

    if (!data) return res.status(400).json({ mensaje: "No se ha solicitado recuperación" });

    if (Date.now() > data.expiracion) {
        delete codigosRecuperacion[correo];
        console.log("Código expirado para:", correo);
        return res.status(400).json({ mensaje: "El código ha expirado" });
    }

    if (data.codigo !== codigo) {
        console.log("Código incorrecto para:", correo);
        return res.status(400).json({ mensaje: "Código incorrecto" });
    }

    console.log("Código correcto para:", correo);
    res.json({ mensaje: "Código válido" });
};

// 🔹 CAMBIAR CONTRASEÑA
const cambiarContrasena = async (req, res) => {
    const { correo, nuevaContrasena } = req.body;

    console.log("Cambiando contraseña para:", correo);

    if (!correo || !nuevaContrasena) {
        console.log("Faltan campos para cambiar contraseña");
        return res.status(400).json({ mensaje: "Correo y nueva contraseña son obligatorios" });
    }

    try {
        const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

        const pool = await poolPromise;
        await pool.request()
            .input("correo", sql.VarChar, correo)
            .input("contrasena", sql.VarChar, hashedPassword)
            .query("UPDATE usuarios SET contrasena = @contrasena WHERE correo = @correo");

        delete codigosRecuperacion[correo];
        console.log("Contraseña actualizada para:", correo);

        res.json({ mensaje: "Contraseña actualizada exitosamente" });
    } catch (error) {
        console.error("Error al cambiar contraseña:", error);
        res.status(500).json({ mensaje: "Error al cambiar la contraseña" });
    }

};

module.exports = {
    registroUsuario,
    loginUsuario,
    logoutUsuario,
    obtenerPerfilUsuario,
    solicitarRecuperacion,
    verificarCodigoRecuperacion,
    cambiarContrasena,
    blacklist,
};
