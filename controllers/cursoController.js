const streamifier = require('streamifier');
const cloudinary = require("cloudinary").v2;
const { v4: uuidv4 } = require("uuid");
const { poolPromise } = require("../models/database");
const Curso = require("../models/cursoModel");
const Leccion = require("../models/leccionModel");
const generarTemplateLeccion = require("../utils/generarTemplateLeccion");
const eliminarTemplate = require("../utils/eliminarTemplate");
const sql = require("mssql");
require("dotenv").config();


// Configura Cloudinary con las credenciales del .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const mostrarCursos = async (req, res) => {
    try {
        const cursos = await Curso.obtenerTodos();
        res.json(cursos);
    } catch (error) {
        console.error("Error al obtener cursos:", error);
        res.status(500).send("Error del servidor");
    }
};

const subirImagenCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        if (!file?.buffer) {
            return reject(new Error("El archivo no tiene un buffer."));
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                public_id: uuidv4(),
                resource_type: "auto"
            },
            (error, result) => {
                if (error) {
                    console.error("Error subiendo la imagen a Cloudinary:", error.message);
                    return reject(new Error("Error subiendo la imagen a Cloudinary"));
                }
                resolve(result.secure_url); // Devuelve la URL de la imagen
            }
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
};

const guardarCurso = async (req, res) => {
    try {
        const {
            NombreCurso, Descripcion, TituloLeccion, IntroLeccion, IntroCurso,
            Definicion, ImportanciaFinanzas, Practica
        } = req.body;

        console.log(req.files); // Esto debería mostrar un objeto con las imágenes.

        // Subir las imágenes a Cloudinary
        const fileMetas = req.files?.imgMetas?.[0]; // Obtenemos el primer archivo de imgMetas
        let urlImgMetas = null;
        if (fileMetas) {
            urlImgMetas = await subirImagenCloudinary(fileMetas); // Subimos la imagen de metas
        }

        const file1 = req.files?.img1?.[0]; // Obtenemos el primer archivo de img1
        let urlimg1 = null;
        if (file1) {
            urlimg1 = await subirImagenCloudinary(file1); // Subimos la imagen 1
        }

        const file2 = req.files?.img2?.[0]; // Obtenemos el primer archivo de img2
        let urlimg2 = null;
        if (file2) {
            urlimg2 = await subirImagenCloudinary(file2); // Subimos la imagen 2
        }

        const pool = await poolPromise;

        // Guardar Curso
        const resultCurso = await pool.request()
            .input("NombreCurso", NombreCurso)
            .input("Descripcion", Descripcion)
            .input("ImgMetas", urlImgMetas)
            .query(`
                INSERT INTO Cursos (NombreCurso, Descripcion, ImgMetas)
                OUTPUT INSERTED.IdCurso
                VALUES (@NombreCurso, @Descripcion, @ImgMetas)
            `);
        const IdCurso = resultCurso.recordset[0].IdCurso;

        // Guardar Lección
        await Leccion.insertar(
            IdCurso, TituloLeccion, IntroLeccion, IntroCurso,
            Definicion, ImportanciaFinanzas, Practica, urlimg1, urlimg2
        );

        // Guardar Progreso de los usuarios
        await pool.request()
            .input("IdCurso", sql.Int, IdCurso)
            .query("SELECT IdUsuario FROM Usuarios")  // Obtener todos los usuarios
            .then(async (usuarios) => {
                for (const usuario of usuarios.recordset) {
                    await pool.request()
                        .input("IdUsuario", sql.Int, usuario.IdUsuario)
                        .input("IdCurso", sql.Int, IdCurso)
                        .query("INSERT INTO ProgresoUsuario (IdUsuario, IdCurso, Completado) VALUES (@IdUsuario, @IdCurso, 0)");
                }
            });

        const contenido = {
            IdCurso: IdCurso,
            TituloLeccion: TituloLeccion,
            IntroLeccion: IntroLeccion,
            IntroCurso: IntroCurso,
            Definicion: Definicion,
            Importancia: ImportanciaFinanzas,
            Practica: Practica,
            urlimg1: urlimg1,
            urlimg2: urlimg2
        };

        console.log(contenido);

        // Generar el template para la lección
        generarTemplateLeccion(NombreCurso, contenido);

        res.status(200).json({ mensaje: "Curso y lección guardados exitosamente." });

    } catch (error) {
        console.error("❌ Error al guardar el curso completo:", error);
        res.status(500).json({ error: "Error al guardar el curso completo." });
    }
};

const actualizarCurso = async (req, res) => {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    try {
        const NombreCurso = req.body.NombreCurso;
        const Descripcion = req.body.Descripcion;

        console.log("NombreCurso recibido:", NombreCurso); // Depuración
        const IdCurso = req.params.IdCurso; // Usamos el IdCurso desde la URL

        let urlImgMetas = null;

        // Si se subió una nueva imagen de metas, la subimos a Cloudinary
        const nuevaImg = req.files?.imagen?.[0];
        if (nuevaImg) {
            urlImgMetas = await subirImagenCloudinary(nuevaImg);
        }

        const pool = await poolPromise;
        const request = pool.request()
            .input("IdCurso", sql.Int, IdCurso)
            .input("NombreCurso", sql.NVarChar, NombreCurso)
            .input("Descripcion", sql.NVarChar, Descripcion);

        // Solo incluimos ImgMetas si hay una nueva
        if (urlImgMetas) {
            request.input("ImgMetas", sql.NVarChar, urlImgMetas);
        }

        const updateQuery = `
            UPDATE Cursos
            SET
                NombreCurso = @NombreCurso,
                Descripcion = @Descripcion
                ${urlImgMetas ? ', ImgMetas = @ImgMetas' : ''}
            WHERE IdCurso = @IdCurso
        `;

        await request.query(updateQuery);

        res.status(200).json({ mensaje: "Curso actualizado exitosamente." });

    } catch (error) {
        console.error("❌ Error al actualizar curso:", error);
        res.status(500).json({ error: "Error al actualizar curso." });
    }
};

const eliminarCurso = async (req, res) => {
    try {
        const IdCurso = req.params.IdCurso;
        const NombreCurso = req.params.NombreCurso;
        const pool = await poolPromise;

        // Eliminar la lección asociada
        await pool.request()
            .input("IdCurso", sql.Int, IdCurso)
            .query("DELETE FROM Lecciones WHERE IdCurso = @IdCurso");

        // Eliminar el curso
        await pool.request()
            .input("IdCurso", sql.Int, IdCurso)
            .query("DELETE FROM Cursos WHERE IdCurso = @IdCurso");
        eliminarTemplate(NombreCurso)

        res.status(200).json({ mensaje: "Curso y lección eliminados exitosamente." });

    } catch (error) {
        console.error("❌ Error al eliminar curso y lección:", error);
        res.status(500).json({ error: "Error al eliminar curso y lección." });
    }
};



const finalizarCurso = async (req, res) => {
    const IdUsuario = req.IdUsuario;
    const IdCurso = req.params.IdCurso;

    try {
        await Curso.marcarComoFinalizado(IdUsuario, IdCurso);
        res.json({ success: true, message: 'Curso finalizado' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


module.exports = {
    guardarCurso,
    mostrarCursos,
    finalizarCurso,
    actualizarCurso,
    eliminarCurso
};
