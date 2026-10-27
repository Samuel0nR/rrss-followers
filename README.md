# Social Check — primera pantalla

Prototipo frontend de la primera pantalla para una SPA que analiza exportaciones de seguidores de Instagram.

## Requisitos
- Node.js 20 o superior recomendado
- npm

## Ejecutar en local
```bash
npm install
npm run dev
```

Abrir la URL local que muestre Vite.

## Compilar
```bash
npm run build
npm run preview
```

## Qué incluye esta iteración
- Identidad visual oscura con lima eléctrica y violeta.
- Hero editorial con ilustración de órbitas creada en CSS, sin imágenes externas.
- Diseño responsive para móvil y escritorio.
- Zona de selección/arrastre de archivos ZIP, validación básica de extensión y tamaño, y opción para quitar el archivo.
- Panel plegable con instrucciones para conseguir la exportación.
- Estados de interacción y animaciones, respetando `prefers-reduced-motion`.

## Importante
Esta iteración es la **primera pantalla visual**, no el analizador completo. El ZIP seleccionado todavía no se descomprime ni se analiza; eso será la siguiente etapa. El archivo no se sube a ningún servidor en esta implementación. La fuente de Google Fonts sí realiza una solicitud externa para cargar tipografías; si se desea una versión completamente sin solicitudes de terceros, habrá que alojar las fuentes localmente o usar tipografías del sistema.
