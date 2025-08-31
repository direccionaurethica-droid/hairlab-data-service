const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Crea una instancia de Express
const app = express();

// Puerto configurable mediante variable de entorno PORT. Por defecto: 3000.
const PORT = process.env.PORT || 3000;

/*
 * Carga el dataset de estilos.  
 * El archivo `data/styles.json` contiene un arreglo de objetos con metadatos
 * sobre cada estilo capilar. Cada objeto debe incluir como mínimo:
 *  - id: Identificador único (string)
 *  - name: Nombre descriptivo del estilo (string)
 *  - group: Categoría o familia del estilo (string)
 *  - keywords: Lista de palabras clave (array de strings)
 *  - short: Descripción breve (string)
 *  - images: Rutas a cuatro imágenes representativas (array de strings)
 */
const stylesPath = path.join(__dirname, 'data', 'styles.json');
let styles = [];
try {
  const rawData = fs.readFileSync(stylesPath, 'utf8');
  styles = JSON.parse(rawData);
} catch (err) {
  console.error('No se pudo leer el archivo de estilos:', err);
}

// Habilita CORS para permitir peticiones desde otros dominios
app.use(cors());

// Endpoints

/**
 * GET /styles
 * Devuelve un arreglo con todos los estilos disponibles.
 */
app.get('/styles', (req, res) => {
  res.json(styles);
});

/**
 * GET /styles/:id
 * Devuelve un único estilo por su identificador. Si no se encuentra,
 * responde con 404.
 */
app.get('/styles/:id', (req, res) => {
  const { id } = req.params;
  const style = styles.find((s) => s.id === id);
  if (!style) {
    return res.status(404).json({ error: 'Style not found' });
  }
  res.json(style);
});

/**
 * GET /health
 * Endpoint sencillo de verificación. Devuelve el estado del servicio.
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Hair Lab Data Service escuchando en el puerto ${PORT}`);
});
