const fs = require('fs');
const path = require('path');

const eliminarTemplateLeccion = (titulo) => {
  try {
    // Crear la ruta del archivo a eliminar
    const ruta = path.join(__dirname, `../views/lecciones/${titulo.replace(/\s+/g, "_")}.html`);
    
    // Verificar si el archivo existe
    if (fs.existsSync(ruta)) {
      // Eliminar el archivo
      fs.unlinkSync(ruta);
      console.log(`El template de la lección '${titulo}' ha sido eliminado exitosamente.`);
    } else {
      console.log(`El archivo de la lección '${titulo}' no existe.`);
    }
  } catch (error) {
    console.error("❌ Error al eliminar el template de la lección:", error);
  }
};

module.exports = eliminarTemplateLeccion;
