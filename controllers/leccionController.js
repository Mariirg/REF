const { poolPromise } = require("../models/database");
const streamifier = require('streamifier');
const cloudinary = require("cloudinary").v2;
const { v4: uuidv4 } = require("uuid");
const Leccion = require("../models/leccionModel");
require("dotenv").config();
const sql = require("mssql");
const generarTemplateLeccion = require("../utils/generarTemplateLeccion");
const eliminarTemplate = require("../utils/eliminarTemplate");


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
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

const crearLeccion = async (req, res) => {
    try {
        const {
            id_curso,
            titulo,
            subtitulo,
            descripcion,
            pasoTitulo,
            tituloMetas,
            textoMetas,
            tituloPractica,
            textoPractica
        } = req.body;

        // Subir la imagen de metas a Cloudinary
        const fileMetas = req.files?.imagenMetas?.[0]; // Obtener el primer archivo de imagenMetas
        let urlImagenMetas = null;
        if (fileMetas) {
            urlImagenMetas = await subirImagenCloudinary(fileMetas); // Subimos la imagen de metas
        }

        const pool = await poolPromise;
        await pool.request()
            .input("id_curso", id_curso)
            .input("titulo", titulo)
            .input("subtitulo", subtitulo)
            .input("descripcion", descripcion)
            .input("pasoTitulo", pasoTitulo)
            .input("tituloMetas", tituloMetas)
            .input("textoMetas", textoMetas)
            .input("imagenMetas", urlImagenMetas)
            .input("tituloPractica", tituloPractica)
            .input("textoPractica", textoPractica)
            .query(`INSERT INTO lecciones (
                    id_curso, titulo, subtitulo, descripcion, pasoTitulo, 
                    tituloMetas, textoMetas, imagenMetas, tituloPractica, textoPractica
                )
                VALUES (
                    @id_curso, @titulo, @subtitulo, @descripcion, @pasoTitulo, 
                    @tituloMetas, @textoMetas, @imagenMetas, @tituloPractica, @textoPractica
                )`);

        res.status(200).json({ mensaje: "Lección guardada exitosamente." });

    } catch (error) {
        console.error("❌ Error al guardar la lección:", error.message);
        res.status(500).json({ error: "Error al guardar la lección." });
    }
};
const obtenerLecciones = async (req, res) => {
    try {
        const pool = await poolPromise;
        const resultado = await pool.request().query("SELECT * FROM lecciones");
        res.status(200).json(resultado.recordset);
    } catch (error) {
        console.error("❌ Error al obtener lecciones:", error.message);
        res.status(500).json({ error: "Error al obtener las lecciones." });
    }

};
const formularioEditar = async (req, res) => {
    try {
        const leccion = await Leccion.obtenerPorId(req.params.IdCurso);

        if (!leccion) {
            return res.status(404).json({ error: "Lección no encontrada." });
        }

        res.status(200).json(leccion);
    } catch (error) {
        console.error("❌ Error al obtener la lección:", error.message);
        res.status(500).json({ error: "Error al obtener la lección." });
    }
};
const actualizarLeccion = async (req, res) => {
    try { const pool = await poolPromise;
        const {
            IdCurso,
            titulo,
            introLeccion,
            introCurso,
            definicion,
            importancia,
            practica,
            IdLeccion,
            urlImg1,
            urlImg2
        } = req.body;

        console.log("Datos recibidos para la lección:", req.body);
        const Curso = await pool.request()
            .input("IdCurso", sql.Int, IdCurso)
            .query("SELECT NombreCurso FROM Cursos WHERE IdCurso = @IdCurso");

        const NombreCurso = Curso.recordset[0]?.NombreCurso || "(sin nombre curso)";

        // Variables para las URLs de las imágenes
        let urlimg1 = urlImg1;
        let urlimg2 = urlImg2;

        // Si se sube una nueva imagen 1
        const nuevaImg1 = req.files?.urlimg1?.[0];
        if (nuevaImg1) {
            // Subimos la imagen a Cloudinary
            const uploadResult1 = await cloudinary.uploader.upload(nuevaImg1.path, {
                folder: 'lecciones', // Puedes crear una carpeta en Cloudinary para organizarlas
                public_id: `leccion_${IdLeccion}_img1`, // Opción de renombrar la imagen si quieres
                resource_type: 'image'
            });
            urlimg1 = uploadResult1.secure_url; // URL segura de la imagen subida
        }

        // Si se sube una nueva imagen 2
        const nuevaImg2 = req.files?.urlimg2?.[0];
        if (nuevaImg2) {
            // Subimos la imagen a Cloudinary
            const uploadResult2 = await cloudinary.uploader.upload(nuevaImg2.path, {
                folder: 'lecciones',
                public_id: `leccion_${IdLeccion}_img2`,
                resource_type: 'image'
            });
            urlimg2 = uploadResult2.secure_url;
        }

        // Conectamos a la base de datos y ejecutamos la actualización
        const request = pool.request()
            .input("IdLeccion", sql.Int, IdLeccion)
            .input("IdCurso", sql.Int, IdCurso)
            .input("TituloLeccion", sql.VarChar, titulo)
            .input("IntroLeccion", sql.Text, introLeccion)
            .input("IntroCurso", sql.Text, introCurso)
            .input("Definicion", sql.Text, definicion)
            .input("Importancia", sql.Text, importancia)
            .input("Practica", sql.Text, practica)
            .input("urlimg1", sql.Text, urlimg1)
            .input("urlimg2", sql.Text, urlimg2);

        const updateQuery = `
            UPDATE Lecciones
            SET
                IdCurso = @IdCurso,
                TituloLeccion = @TituloLeccion,
                IntroLeccion = @IntroLeccion,
                IntroCurso = @IntroCurso,
                Definicion = @Definicion,
                Importancia = @Importancia,
                Practica = @Practica,
                urlimg1 = @urlimg1,
                urlimg2 = @urlimg2
            WHERE IdLeccion = @IdLeccion
        `;

        await request.query(updateQuery);
        res.status(200).json({ mensaje: "Lección actualizada exitosamente." });
        eliminarTemplate(NombreCurso)
        const contenidoActual = await pool.request()
            .input("IdLeccion", sql.Int, IdLeccion)
            .query("SELECT * FROM Lecciones WHERE IdLeccion = @IdLeccion");

        const contenido = contenidoActual.recordset[0]
        generarTemplateLeccion(NombreCurso, contenido)
    } catch (error) {
        console.error("❌ Error al actualizar lección:", error);
        res.status(500).json({ error: "Error al actualizar la lección." });
    }
};
// 👇 Exporta las funciones correctamente
module.exports = {
    crearLeccion,
    obtenerLecciones,
    formularioEditar,
    actualizarLeccion
};
