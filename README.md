# Red de Educación Financiera (REF)

*REF* (Red de Educación Financiera) es una plataforma web interactiva diseñada para brindar educación financiera a jóvenes mediante cursos virtuales, lecciones interactivas y seguimiento del progreso. El sistema incluye autenticación de usuarios, gestión de contenido educativo, manejo de roles y una interfaz moderna construida con tecnologías web.

---

## Estado del proyecto

*Proyecto Finalizado*  
Este proyecto ha sido desarrollado completamente y se encuentra funcional para su uso.

---

## Requisitos previos

Asegúrate de tener instalado:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- 
- Navegador web actualizado (Chrome, Firefox, Edge, etc.)

---

## Instalación del proyecto

1. Clona este repositorio o descarga los archivos:

`bash

git clone https://github.com/usuario/REF.git

2. Entra a la carpeta del proyecto:
cd REF

3. Instala las dependencias del backend:
npm install

4. Configura el archivo .env con tus variables (puerto, conexión a la base de datos, JWT_SECRET, etc.)

## Estructura del proyecto

REF/

├── controllers/           # Controladores (Auth, Usuarios, Cursos, Lecciones)
---
├── middleware/            # Middleware para validaciones y autenticación
---
├── models/                # Modelos de datos con Sequelize
---
├── node_modules/          # Dependencias del proyecto
---
├── public/                # Archivos estáticos (CSS, JS, imágenes)
---
│   ├── css/
---
│   ├── img/
---
│   └── js/
---
├── routes/                # Rutas del sistema
---
├── utils/                 # Funciones de utilidad (generación de templates)
---
├── views/                 # Páginas HTML (Login, Registro, Cursos, etc.)
---
│   └── lecciones/         # Lecciones individuales en HTML
---
├── .env                   # Variables de entorno
---
├── .gitignore             # Archivos ignorados por Git
---
├── estructura.txt         # Explicación de la estructura del proyecto
---
├── history.sqlite         # Base de datos SQLite
---
├── package.json           # Configuración del proyecto y scripts
---
├── package-lock.json      # Registro de dependencias exactas
---
└── server.js              # Archivo principal para configurar el servidor

## ¿Cómo usarlo?

1. Ejecuta el servidor con:
node server.js

## Autoras
Mariana Romero Gomez

Dajhiana Benitez Pantoja
