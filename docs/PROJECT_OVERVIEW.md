# YouTube Outliers

## Propósito

YouTube Outliers es una herramienta frontend para explorar vídeos de YouTube y localizar oportunidades de contenido dentro de un nicho. Usa YouTube Data API v3 para buscar vídeos, consultar estadísticas y analizar canales.

## Funcionalidades

- Búsqueda global por palabra clave y periodo.
- Búsquedas predefinidas para videojuegos.
- Análisis de un canal mediante `@handle` o `channel ID`.
- Detección de outliers mediante media, desviación estándar y z-score.
- Detección de Gemas Ocultas mediante la relación `views / subscriberCount`.
- Filtros por visualizaciones mínimas y exclusión de Shorts.
- Ordenación por visualizaciones, z-score, fecha y ratio en Gemas Ocultas.
- Cambio entre tema oscuro y claro.

Las Gemas Ocultas excluyen vídeos de menos de 180 segundos. El filtro general de Shorts utiliza la duración real de `contentDetails.duration` y considera Shorts los vídeos de menos de 120 segundos.

## Arquitectura

La aplicación usa JavaScript moderno con módulos ES nativos, HTML y CSS, sin frameworks ni dependencias externas.

- `js/api`: cliente común de YouTube y gestión de rotación de API keys.
- `js/services`: casos de uso de vídeos, canales y búsquedas paginadas.
- `js/analysis`: algoritmos puros de outliers y Gemas Ocultas.
- `js/ui`: creación de formularios, tarjetas, estados y renderizado.
- `js/utils`: fechas, duración, validación, formato y ordenación.
- `js/config.js`: configuración local, ignorada por Git.
- `js/config.example.js`: plantilla sin secretos.

La interfaz es una SPA servida desde `index.html`; los modos de búsqueda global, canal y Gemas Ocultas se alternan dentro de la misma página. No existe una página independiente `hidden-gems.html`.

## Ejecución local

1. Copia `js/config.example.js` como `js/config.js`.
2. Sustituye los placeholders por tus claves de YouTube Data API v3.
3. Sirve el directorio con cualquier servidor estático. Por ejemplo:

```powershell
python -m http.server 8000
```

4. Abre `http://localhost:8000`.

No se deben registrar, publicar ni incluir las claves en documentación, logs o control de versiones. Una clave entregada al navegador no puede mantenerse completamente secreta; una versión pública debería mover las llamadas a un backend o proxy.

## API keys y cuota

El cliente empieza con la primera clave configurada. Cuando YouTube informa de agotamiento real de cuota, la clave usada se marca como agotada durante la sesión y se intenta la siguiente disponible. Los errores normales y los límites temporales no rotan automáticamente la clave. Las estadísticas de vídeos y canales se solicitan por lotes para reducir llamadas.

## Limitaciones conocidas

- Las claves se usan desde el frontend, por lo que son visibles para quien inspeccione la aplicación.
- La cuota de YouTube limita el número de búsquedas y páginas procesadas.
- Los análisis dependen de que YouTube proporcione estadísticas y suscriptores visibles.
- La fecha de publicación y la duración proceden de los datos devueltos por YouTube.

## Mejoras futuras

- Mover la comunicación con YouTube a un backend.
- Añadir caché persistente y límites de cuota visibles.
- Incorporar más algoritmos estadísticos.
- Añadir pruebas automatizadas integradas y una configuración de despliegue.
