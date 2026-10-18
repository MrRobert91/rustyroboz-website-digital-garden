# Castellano e inglés

El botón ES/EN de la cabecera cambia el idioma de la web completa y conserva la
preferencia durante un año en la cookie `site-language`. La primera visita usa
inglés; una preferencia no reconocida también vuelve a inglés. Cambiar de idioma
recarga la misma URL para actualizar conjuntamente HTML, MDX, metadatos y controles.
El layout se renderiza por petición para evitar servir contenido de otro idioma
desde una página prerenderizada.

## Contenido y mantenimiento

- Los MDX originales siguen en sus colecciones habituales. Los slugs, enlaces,
  códigos de catálogo, tecnologías, imágenes y vídeos son los mismos en ambos idiomas.
- `content/translations/en.json` y `es.json` contienen título, descripción, cuerpo
  MDX y textos de medios para los 42 documentos publicados: 33 proyectos,
  7 artículos y 2 páginas. Los artículos originalmente escritos en castellano
  también tienen versión inglesa. No hay traducción remota durante la navegación.
- Cada entrada tiene `sourceHash`: SHA-256 del MDX original en UTF-8, normalizando
  CRLF a LF. Al editar o publicar contenido, revisa ambas traducciones y actualiza
  este hash. Las pruebas detectan entradas ausentes, sobrantes o desactualizadas.
- `apps/web/lib/i18n/{en,es}.json` contiene interfaz, accesibilidad, cronología y
  títulos de citas del chatbot. Los componentes usan `t()` o el componente `Text`.
  Se mantienen los nombres de productos, herramientas, tecnologías y anglicismos.
- Las fechas y duraciones de la cronología se formatean según el idioma.
- El chat envía `language: en | es`; el agente usa esa preferencia y su caché separa
  las respuestas por idioma. Los clientes anteriores pueden omitir el campo.

## Validación

```powershell
npm.cmd run test:web
python -m pytest apps/api/tests
npm.cmd run build:web
$env:E2E_PRODUCTION = '1'
npm.cmd run test:e2e --workspace @rustyroboz/web -- --workers=2
```

Las pruebas compilan los 84 cuerpos MDX, comparan enlaces, bloques de código y
referencias de medios, y verifican la cobertura de las colecciones. El recorrido
con Chromium abre todos los artículos y proyectos en ambos idiomas, comprueba
títulos, resúmenes, metadatos y `lang`, y prueba las rutas principales a 320, 768 y
1280 píxeles. Incluye accesibilidad con axe, cambio de idioma, navegación y recarga.
Las capturas de portada quedan en `apps/web/test-results/home-{en,es}-{width}.png`.
CI ejecuta también estos recorridos sobre el servidor standalone de producción.

## API y publicación

El índice conserva un documento y una URL canónica por contenido, con las dos
variantes lingüísticas. Un cambio en cualquiera de ellas modifica el checksum y
fuerza la reconstrucción de SQLite, FTS y FAISS en el siguiente arranque.

Al publicar esta funcionalidad, despliega **web y API desde el mismo commit**,
siguiendo el procedimiento del README. Reiniciar una imagen antigua no incorpora
los catálogos nuevos. Durante la validación local se arranca la API con los
catálogos bilingües y se comprueba `/health`: SQLite y FAISS deben estar `ready`.
