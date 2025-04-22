const cloudinary = require("cloudinary").v2;
const { v4: uuidv4 } = require("uuid");
require("dotenv").config(); // Asegúrate de tener tu .env con la configuración de Cloudinary

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const subirImagenCloudinary = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No se recibió ninguna imagen." });
        }

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({
                public_id: uuidv4(), // Usamos uuid para un nombre único
                resource_type: "auto", // Detecta el tipo de archivo automáticamente
            }, (error, result) => {
                if (error) {
                    reject(new Error("Error al subir imagen a Cloudinary"));
                }
                resolve(result);
            });

            // Usamos pipe para pasar el archivo directamente desde el buffer en memoria
            uploadStream.end(req.file.buffer);
        });

        // Obtener la URL de la imagen subida
        const imageUrl = result.secure_url;
        res.status(200).json({ imageUrl });
    } catch (err) {
        console.error("❌ Error subiendo imagen a Cloudinary:", err.message);
        res.status(500).json({ error: "Error al subir imagen a Cloudinary." });
    }
};

module.exports = { subirImagenCloudinary };  // Asegúrate de exportarlo correctamente
