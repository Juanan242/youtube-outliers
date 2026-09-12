# YouTube Outliers

Aplicación frontend para analizar vídeos y canales de YouTube y detectar oportunidades de contenido dentro de un nicho. Utiliza YouTube Data API v3 para buscar vídeos, consultar estadísticas y aplicar análisis sobre los resultados.

## Características

- Búsqueda global por palabra clave y periodo.
- Búsquedas predefinidas para videojuegos.
- Análisis de canales mediante `@handle` o `channel ID`.
- Detección de vídeos Outliers mediante media, desviación estándar y Z-Score.
- Detección de Gemas Ocultas mediante la relación entre visualizaciones y suscriptores.
- Filtro por visualizaciones mínimas.
- Filtro opcional para excluir Shorts según la duración real del vídeo.
- Periodos de análisis de 7 días a 12 meses.
- Ordenación por visualizaciones, Z-Score, fecha y ratio de Gemas Ocultas.
- Temas oscuro y claro.
- Rotación de API keys cuando se agota la cuota disponible.

## Cómo funciona

La aplicación usa `search.list` para localizar vídeos publicados desde la fecha seleccionada. Después agrupa sus IDs para consultar estadísticas y metadatos mediante `videos.list`. Los vídeos se normalizan antes de llegar a la capa de análisis o a la interfaz.

Para el análisis de Outliers se calcula la media de visualizaciones, la desviación estándar y el Z-Score relativo de cada vídeo. Las Gemas Ocultas utilizan la relación `views / subscriberCount`, excluyen vídeos de menos de 180 segundos y ordenan los resultados por ratio de forma predeterminada.

La información de canales se obtiene con `channels.list`. Se utiliza para resolver handles, mostrar suscriptores y enriquecer las búsquedas de Gemas Ocultas. Las búsquedas aplican filtros temporales y pueden excluir vídeos de menos de 120 segundos mediante la duración de `contentDetails.duration`.

## Tecnologías

- HTML5
- CSS3
- JavaScript moderno con módulos ES nativos
- YouTube Data API v3

No se utilizan frameworks ni dependencias externas.

## Estructura del proyecto

```text
youtube-outliers/
├── index.html
├── styles.css
├── js/
│   ├── api/
│   │   ├── apiKeyManager.js
│   │   └── youtube.js
│   ├── analysis/
│   │   ├── hiddenGems.js
│   │   └── outliers.js
│   ├── services/
│   │   ├── channelService.js
│   │   ├── searchService.js
│   │   └── videoService.js
│   ├── ui/
│   │   ├── components.js
│   │   └── renderer.js
│   ├── utils/
│   │   ├── dates.js
│   │   ├── duration.js
│   │   ├── formatters.js
│   │   ├── sorting.js
│   │   └── validation.js
│   ├── app.js
│   ├── config.example.js
│   └── config.js
├── docs/
├── .gitignore
└── .nojekyll
```

La aplicación es una SPA servida desde `index.html`. La búsqueda global, el análisis de canales y Gemas Ocultas son modos de la misma interfaz.

## Configuración local

1. Copia `js/config.example.js` como `js/config.js`.
2. Sustituye los placeholders por tus claves de YouTube Data API v3.
3. Sirve la carpeta raíz con un servidor estático. Por ejemplo:

```powershell
python -m http.server 8000
```

4. Abre `http://localhost:8000` en el navegador.

## API keys

`js/config.example.js` es una plantilla segura para la configuración local. El archivo `js/config.js`, que contiene las claves reales, está excluido mediante `.gitignore` y no debe subirse al repositorio.

La aplicación utiliza las claves desde el frontend para ejecución local. Cualquier clave entregada al navegador puede ser inspeccionada por el usuario, por lo que una futura versión pública debería gestionar las llamadas mediante un backend o proxy.

## Limitaciones

- La aplicación depende de la cuota y disponibilidad de YouTube Data API v3.
- Las API keys deben configurarse manualmente para ejecutar búsquedas reales.
- Las claves usadas en frontend no pueden mantenerse completamente secretas.
- Algunos canales pueden ocultar suscriptores o no proporcionar datos suficientes para el análisis de Gemas Ocultas.
- Los resultados dependen de los metadatos y estadísticas disponibles en YouTube.

## Posibles mejoras

- Mover las llamadas de YouTube a un backend o proxy.
- Añadir caché persistente y una supervisión más visible de la cuota.
- Incorporar más métricas y algoritmos de análisis.
- Ampliar las pruebas automatizadas y preparar un flujo de despliegue.
