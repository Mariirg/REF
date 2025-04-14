const { poolPromise } = require("../models/database");
const { BlobServiceClient } = require("@azure/storage-blob");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const AZURE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = "lecciones";

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

        const fileMetas = req.files?.imagenMetas?.[0];
        let urlImagenMetas = null;
        if (fileMetas) {
            urlImagenMetas = await subirImagenAzure(fileMetas);
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
            .query(`
                INSERT INTO lecciones (
                    id_curso, titulo, subtitulo, descripcion, pasoTitulo, 
                    tituloMetas, textoMetas, imagenMetas, tituloPractica, textoPractica
                )
                VALUES (
                    @id_curso, @titulo, @subtitulo, @descripcion, @pasoTitulo, 
                    @tituloMetas, @textoMetas, @imagenMetas, @tituloPractica, @textoPractica
                )
            `);

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

// 👇 Exporta las funciones correctamente
module.exports = {
    crearLeccion,
    obtenerLecciones
};
