const { BlobServiceClient } = require("@azure/storage-blob");
const { v4: uuidv4 } = require("uuid");
const { poolPromise } = require("../models/database");
const Curso = require("../models/cursoModel");
const Leccion = require("../models/leccionModel");
const generarTemplateLeccion = require("../utils/generarTemplateLeccion");
require("dotenv").config();

const AZURE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = "curso";

const mostrarCursos = async (req, res) => {
    try {
        const cursos = await Curso.obtenerTodos();
        res.json(cursos);
    } catch (error) {
        console.error("Error al obtener cursos:", error);
        res.status(500).send("Error del servidor");
    }
};

const subirImagenAzure = async (file) => {
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const extension = file.originalname.split('.').pop();
    const blobName = `${uuidv4()}.${extension}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
    });
    return blockBlobClient.url;
};

const guardarCurso = async (req, res) => {
    try {
        const {
            NombreCurso, Descripcion, TituloLeccion, IntroLeccion, IntroCurso,
            Definicion,
            ImportanciaFinanzas, Practica
        } = req.body;

        const fileMetas = req.files?.imgMetas?.[0];
        let urlImgMetas = null;
        if (fileMetas) {
            urlImgMetas = await subirImagenAzure(fileMetas);
        }
        const file1 = req.files?.img1?.[0];
        let urlimg1 = null;
        if (file1) {
            urlimg1 = await subirImagenAzure(file1);
        }
        const file2 = req.files?.img2?.[0];
        let urlimg2 = null;
        if (file2) {
            urlimg2 = await subirImagenAzure(file2);
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
        const cursoId = resultCurso.recordset[0].IdCurso;

        // Guardar Lección
        await Leccion.insertar(
            cursoId, TituloLeccion, IntroLeccion, IntroCurso,
            Definicion, ImportanciaFinanzas, Practica, urlimg1, urlimg2
        );

        const contenido = {
            TituloLeccion:TituloLeccion,
            IntroLeccion: IntroLeccion,
            IntroCurso: IntroCurso,
            Definicion:Definicion,
            Importancia: ImportanciaFinanzas,
            Practica: Practica,
            urlimg1:urlimg1,
            urlimg2:urlimg2
        };   
        console.log(contenido)     
        
        generarTemplateLeccion(NombreCurso, contenido);

        res.status(200).json({ mensaje: "Curso y lección guardados exitosamente." });

    } catch (error) {
        console.error("❌ Error al guardar el curso completo:", error);
        res.status(500).json({ error: "Error al guardar el curso completo." });
    }
};

module.exports = {
    guardarCurso,
    mostrarCursos
};
