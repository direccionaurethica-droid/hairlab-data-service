const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Crea una instancia de Express
const app = express();

// Puerto configurable mediante variable de entorno PORT. Por defecto: 3000.
const PORT = process.env.PORT || 3000;

/*
 * Carga el dataset de estilos extendido y la paleta de colores.
 *
 * El archivo `data/styles_extended.json` contiene un arreglo de objetos con metadatos
 * sobre cada corte de cabello. Cada objeto incluye:
 *  - id: Identificador único (string)
 *  - name: Nombre del corte (string)
 *  - group: Categoría según la longitud (Corto, Medio, Largo)
 *  - category: Tipo de tendencia (Tendencia, Transgresor, Clásico)
 *  - hair_types: Lista de tipos de cabello compatibles (array de strings)
 *  - face_shapes: Lista de formas de rostro compatibles (array de strings)
 *  - keywords: Palabras clave descriptivas (array de strings)
 *  - short: Descripción breve del corte (string)
 *  - images: Rutas a cuatro imágenes del corte (array de strings)
 *
 * El archivo `data/colors.json` contiene un arreglo de objetos con metadatos
 * sobre colores de cabello. Cada objeto incluye:
 *  - id: Identificador único (string)
 *  - name: Nombre del color (string)
 *  - hex: Código hexadecimal del color (string)
 *  - category: Tipo de tendencia (Clásico, Tendencia, Transgresor)
 *  - intensity: Nivel de intensidad (Suave, Medio, Audaz)
 *  - description: Descripción del color (string)
 */

// Lee el dataset de estilos extendido
const stylesExtendedPath = path.join(__dirname, 'data', 'styles_extended.json');
let styles = [];
try {
  const rawData = fs.readFileSync(stylesExtendedPath, 'utf8');
  styles = JSON.parse(rawData);
} catch (err) {
  console.error('No se pudo leer el archivo de estilos extendido:', err);
}

// Lee la paleta de colores
const colorsPath = path.join(__dirname, 'data', 'colors.json');
let colors = [];
try {
  const rawColors = fs.readFileSync(colorsPath, 'utf8');
  colors = JSON.parse(rawColors);
} catch (err) {
  console.error('No se pudo leer el archivo de colores:', err);
}

// Habilita CORS para permitir peticiones desde otros dominios
app.use(cors());

// Endpoints de estilos

/**
 * GET /styles
 * Devuelve todos los cortes de cabello disponibles.
 */
app.get('/styles', (req, res) => {
  res.json(styles);
});

/**
 * GET /styles/:id
 * Devuelve un corte de cabello por su identificador único. Si no se encuentra,
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
 * GET /styles/recommend
 * Devuelve una lista filtrada de cortes de cabello en función de los parámetros
 * de consulta proporcionados. Se pueden filtrar por categoría, tipo de cabello y
 * forma de rostro.
 *
 * Parámetros de consulta:
 *  - category: Tendencia | Transgresor | Clásico
 *  - hairType: Uno de los tipos de cabello (p. ej. Liso, Ondulado, Rizado)
 *  - faceShape: Uno de los tipos de rostro (p. ej. Ovalado, Redondo, Cuadrado, Corazón)
 */
app.get('/styles/recommend', (req, res) => {
  const { category, hairType, faceShape } = req.query;
  let filtered = styles;
  if (category) {
    filtered = filtered.filter((s) => s.category.toLowerCase() === category.toLowerCase());
  }
  if (hairType) {
    filtered = filtered.filter((s) => s.hair_types.map((ht) => ht.toLowerCase()).includes(hairType.toLowerCase()));
  }
  if (faceShape) {
    filtered = filtered.filter((s) => s.face_shapes.map((fs) => fs.toLowerCase()).includes(faceShape.toLowerCase()));
  }
  res.json(filtered);
});

// Endpoints de colores

/**
 * GET /colors
 * Devuelve todos los colores disponibles.
 */
app.get('/colors', (req, res) => {
  res.json(colors);
});

/**
 * GET /colors/:id
 * Devuelve un color por su identificador único. Si no se encuentra,
 * responde con 404.
 */
app.get('/colors/:id', (req, res) => {
  const { id } = req.params;
  const color = colors.find((c) => c.id === id);
  if (!color) {
    return res.status(404).json({ error: 'Color not found' });
  }
  res.json(color);
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
  console.log(`Hair Lab Data Service extendido escuchando en el puerto ${PORT}`);
});