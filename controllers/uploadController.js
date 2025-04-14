const { BlobServiceClient } = require("@azure/storage-blob");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config(); // Asegúrate de tener tu .env con la cadena

const AZURE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = "usuario"; // debe existir en tu cuenta de Azure

const subirImagenAzure = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No se recibió ninguna imagen." });

        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

        const extension = req.file.originalname.split(".").pop();
        const blobName = `${uuidv4()}.${extension}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.uploadData(req.file.buffer, {
            blobHTTPHeaders: { blobContentType: req.file.mimetype },
        });

        const imageUrl = blockBlobClient.url;

        res.status(200).json({ imageUrl });
    } catch (err) {
        console.error("❌ Error subiendo imagen a Azure:", err.message);
        res.status(500).json({ error: "Error al subir imagen a Azure." });
    }
};

module.exports = { subirImagenAzure };