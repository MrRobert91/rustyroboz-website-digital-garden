# Personal Web + AI Lab  
## Spec-Driven Development Document (SQLite + FAISS Edition)

## 1. Objetivo del proyecto

Construir una **web personal moderna, profesional y fácilmente extensible** que combine:

- **Portfolio / proyectos**
- **Blog / artículos**
- **Digital Garden / notas conectadas por tags**
- **Páginas personales** sobre experiencia, formación, intereses y contacto
- **AI Lab interactivo** con demos y experimentos
- **Chatbot personalizado** capaz de responder sobre mis proyectos, artículos, experiencia, intereses y trayectoria usando RAG

El producto debe sentirse como una mezcla entre:

- una **web profesional personal**
- un **laboratorio de IA**
- un **second brain público / digital garden**
- una **carta de presentación técnica seria**

---

## 2. Stack obligatorio

### Frontend
- **Next.js**

### Backend IA
- **FastAPI + LangGraph**

### Base de datos relacional
- **SQLite**

### Base de datos vectorial
- **FAISS en memoria**
- Los índices deben **persistirse en disco**
- El sistema debe **cargar el índice al arrancar**
- El sistema debe **reindexarse cada vez que se suba nuevo contenido** a la web (proyectos, artículos, ideas, notas, etc.)

### UI
- **Tailwind CSS**
- **shadcn/ui**
- **Motion**

### Contenido
- **MDX en el repo**

### Despliegue
- **Frontend y backend separados**

---

## 3. Principios de desarrollo

### 3.1 Enfoque general
Este proyecto debe seguir un enfoque de **Spec-Driven Development** y **Test-First Development**.

### 3.2 Regla obligatoria
**Nunca implementar código de producción antes de definir y escribir los tests correspondientes.**

Orden obligatorio de trabajo para cada feature:

1. Leer la especificación del feature
2. Definir criterios de aceptación
3. Escribir tests
4. Ejecutar tests y comprobar que fallan
5. Implementar el mínimo código necesario
6. Ejecutar tests y hacerlos pasar
7. Refactorizar
8. Actualizar documentación si aplica

### 3.3 Restricciones
- No introducir tecnologías adicionales sin justificarlo claramente
- No mezclar responsabilidades entre frontend y backend
- No meter lógica compleja de IA en el frontend
- No hacer un diseño recargado o visualmente confuso
- No sacrificar mantenibilidad por “efectos bonitos”
- El contenido debe poder mantenerse fácilmente desde el repo
- La capa vectorial debe seguir el modelo definido: **FAISS en memoria + persistencia a disco**
- El reindexado debe dispararse con cada alta o actualización de contenido relevante

---

## 4. Visión del producto

### 4.1 Qué debe transmitir la web
La web debe transmitir:

- perfil técnico fuerte
- gusto por el diseño y el detalle
- capacidad de producto
- pensamiento estructurado
- interés por la IA, la filosofía, la ética y los sistemas complejos
- mezcla de profesionalidad y exploración personal

### 4.2 Sensación visual
El diseño debe ser:

- **moderno**
- **limpio**
- **atractivo**
- **profesional**
- **minimalista pero no frío**
- **con movimiento sutil y elegante**
- **sin recargar la interfaz**

### 4.3 Tono de experiencia
La experiencia debe sentirse:

- fluida
- ligera
- coherente
- editorial en el contenido
- más interactiva en la parte de laboratorio y chatbot

---

## 5. Arquitectura de alto nivel

## 5.1 Arquitectura general

### Frontend (Next.js)
Responsable de:

- renderizado de la web pública
- páginas de contenido MDX
- navegación
- UI del chatbot
- UI del laboratorio interactivo
- páginas de proyectos, artículos y notas
- componentes visuales y animaciones

### Backend IA (FastAPI + LangGraph)
Responsable de:

- ingestión de contenido
- chunking
- embeddings
- retrieval
- RAG
- orquestación de agentes
- sesiones del chatbot
- streaming de respuestas
- endpoints de indexación/reindexación
- sincronización entre SQLite y FAISS
- lógica de herramientas futuras

### Persistencia relacional (SQLite)
Responsable de:

- metadatos de contenido
- documentos y chunks
- sesiones de chat
- mensajes del chat
- logs estructurados si aplica
- tablas auxiliares del sistema

### Persistencia vectorial (FAISS)
Responsable de:

- mantener embeddings en memoria para búsqueda rápida
- persistir índices a disco
- recargar índices al iniciar el backend
- reindexar contenido al añadir o actualizar documentos
- resolver similarity search para retrieval

---

## 6. Estrategia de repositorio

## 6.1 Estructura recomendada
Usar un **monorepo** con separación clara entre apps y paquetes compartidos.

```text
root/
  apps/
    web/                 # Next.js
    api/                 # FastAPI + LangGraph
  content/
    articles/
    projects/
    notes/
    tutorials/
    talks/
    fiction/
    pages/
  data/
    sqlite/
    faiss/
  packages/
    ui/                  # componentes compartidos si fueran necesarios
    config/              # configuración compartida
    types/               # tipos y contratos compartidos
  docs/
    specs/
    adr/
  scripts/
  .github/
```

### 6.2 Directorios de datos recomendados
```text
data/
  sqlite/
    app.db
  faiss/
    index.faiss
    index_meta.json
```

---

## 7. Modelo de contenido

## 7.1 Tipos de contenido iniciales
El contenido en MDX debe organizarse como mínimo en:

- `articles`
- `projects`
- `notes`
- `tutorials`
- `talks`
- `fiction`
- `pages`

## 7.2 Frontmatter mínimo común
Cada archivo MDX debe incluir como mínimo:

```yaml
title:
description:
slug:
publishedAt:
updatedAt:
tags:
draft:
featured:
coverImage:
readingTime:
```

## 7.3 Frontmatter adicional por tipo
### Projects
```yaml
status: planned | active | completed | archived
tech:
links:
  github:
  demo:
  article:
  video:
```

### Talks
```yaml
event:
location:
videoUrl:
slidesUrl:
```

### Notes
```yaml
series:
related:
```

## 7.4 Requisitos del contenido
- Debe ser fácil añadir nuevo contenido sin tocar lógica de negocio
- Debe soportar tags
- Debe permitir enlazar contenido relacionado
- Debe permitir mostrar listados, filtros y páginas de detalle
- Debe alimentar el RAG del chatbot
- Debe poder disparar reindexación cuando haya nuevo contenido o contenido actualizado

---

## 8. Diseño y sistema visual

## 8.1 Objetivo visual
Construir una interfaz con estética profesional, contemporánea y sobria.

## 8.2 Reglas visuales
- Mucho espacio en blanco
- Tipografía clara y jerárquica
- Máximo cuidado con padding, grid y ritmo vertical
- Tarjetas limpias y consistentes
- No abusar de degradados
- No abusar de blur, glassmorphism o efectos de moda
- Paleta contenida, con uno o dos acentos
- Buen contraste y accesibilidad

## 8.3 Motion / animaciones
Usar Motion con moderación y propósito.

### Animaciones deseadas
- entrada suave de secciones
- hover elegante en cards y links
- transiciones sutiles entre estados
- aparición progresiva de contenido destacado
- animaciones pequeñas en chatbot
- microinteracciones en botones y filtros

### Animaciones no deseadas
- animaciones largas
- elementos que distraigan
- rebotes exagerados
- motion constante en toda la interfaz

## 8.4 Componentes visuales prioritarios
- navbar
- hero personal
- cards de proyectos
- cards de artículos
- layout editorial de post
- tag pills
- timeline de experiencia
- panel del chatbot
- secciones de AI Lab
- footer con redes/contacto

---

## 9. Testing strategy obligatoria

## 9.1 Principio
Todo feature debe comenzar por tests.

## 9.2 Frontend
### Herramientas recomendadas
- **Vitest**
- **React Testing Library**
- **Playwright**

### Qué testear
- renderizado de componentes
- navegación básica
- filtros por tags
- pages de detalle
- comportamiento del chatbot UI
- accesibilidad básica
- regresiones visuales críticas si se añaden más adelante

## 9.3 Backend
### Herramientas recomendadas
- **Pytest**
- **httpx AsyncClient** para tests de API
- fixtures para SQLite de test
- tests de grafos/agentes en LangGraph
- tests del índice FAISS y su persistencia

### Qué testear
- health endpoints
- endpoints de chat
- endpoints de ingestión
- retrieval
- ranking / citations
- persistencia de sesiones
- fallbacks y errores controlados
- carga y guardado del índice FAISS
- reindexado tras alta o actualización de contenido

## 9.4 Integración
Debe haber tests de integración para:

- contenido MDX → chunking → embeddings → SQLite + FAISS
- consulta del chatbot → retrieval → respuesta
- frontend chat → backend stream
- renderizado correcto de contenidos y tags
- persistencia del índice → reinicio del backend → recarga correcta

## 9.5 E2E mínimo
Debe existir al menos un conjunto mínimo de tests E2E que cubra:

1. Home carga correctamente  
2. Navegación a proyectos  
3. Navegación a artículo  
4. Filtro por tag  
5. Abrir chatbot  
6. Hacer pregunta sobre el contenido indexado  
7. Recibir respuesta válida  
8. Subir o añadir nuevo contenido y confirmar que el sistema lo reindexa

---

## 10. Fases de desarrollo

# Fase 0 — Fundaciones técnicas

## Objetivo
Preparar el repositorio, toolchain, testing y base arquitectónica sin construir aún features finales.

## Entregables
- monorepo inicial
- apps `web` y `api`
- setup de Tailwind, shadcn/ui y Motion
- setup de FastAPI y LangGraph base
- configuración inicial de SQLite
- configuración base de FAISS
- estructura de persistencia a disco para índices
- framework de tests frontend/backend
- CI básica ejecutando tests

## Tests a escribir primero
- frontend arranca y renderiza página placeholder
- backend responde en `/health`
- SQLite de test funciona correctamente
- un índice FAISS vacío se crea, persiste y recarga
- pipeline de tests corre en CI

## Definition of Done
- repositorio ejecutable por cualquier desarrollador
- tests verdes
- estructura base estable

---

# Fase 1 — Web pública de contenido

## Objetivo
Tener una primera versión profesional de la web sin chatbot todavía.

## Features
- Home
- About
- Projects list + detail
- Articles list + detail
- Notes / Digital Garden
- Tags
- Contact / social links
- Layout MDX
- SEO básico
- sitemap y RSS si procede

## Tests a escribir primero
- listados renderizan contenido MDX
- páginas de detalle resuelven slug correcto
- tags filtran correctamente
- links externos críticos existen
- layout no rompe con contenido mínimo ni largo

## Criterios de aceptación
- puedo publicar contenido nuevo añadiendo archivos MDX
- la web se ve moderna y profesional
- navegación clara y consistente
- responsive en desktop y móvil
- tipografía y espaciado cuidados
- cero elementos visualmente recargados

## Definition of Done
- web pública usable
- contenido y navegación estables
- tests verdes
- Lighthouse razonable
- diseño presentable como portfolio real

---

# Fase 2 — AI Lab y chatbot MVP

## Objetivo
Añadir una primera experiencia interactiva con chatbot personal conectado al contenido del sitio.

## Features
- panel/chat drawer o página dedicada
- endpoint de chat en backend
- LangGraph básico para flujo de consulta
- retrieval sobre contenido indexado
- respuestas centradas en:
  - proyectos
  - artículos
  - experiencia
  - intereses
- citations o referencias a contenido fuente
- streaming de respuestas

## Tests a escribir primero
- una pregunta sobre un proyecto devuelve contexto relevante
- una pregunta fuera de dominio devuelve respuesta controlada
- el chatbot no inventa enlaces inexistentes
- el stream del frontend maneja estados loading/error/success
- el grafo básico de LangGraph sigue el flujo esperado
- una consulta usa el índice FAISS cargado en memoria correctamente

## Criterios de aceptación
- puedo preguntar por proyectos y recibir respuesta útil
- el chatbot responde sobre mí usando contenido propio
- la UI del chat se siente integrada y profesional
- hay feedback visual claro mientras responde
- las respuestas se apoyan en contenido real indexado

## Definition of Done
- chatbot MVP usable en producción
- flujo end-to-end funcionando
- tests unitarios, integración y E2E verdes

---

# Fase 3 — Ingestión robusta y RAG mejorado

## Objetivo
Consolidar la capa de conocimiento.

## Features
- pipeline de indexación desde MDX
- chunking configurable
- embeddings persistidos en SQLite
- índice FAISS regenerado y persistido a disco
- metadatos por chunk
- reindexado incremental o reindexado completo controlado
- ranking / retrieval mejorado
- citations por slug o documento fuente
- sincronización fiable entre SQLite y FAISS

## Tests a escribir primero
- un documento MDX se chunkea como se espera
- se persisten embeddings y metadatos
- el índice FAISS se regenera correctamente
- reindexado no deja documentos huérfanos
- búsqueda devuelve contenido relevante
- cambios en contenido actualizan índice correctamente
- reinicio del backend mantiene el índice operativo tras recarga desde disco

## Criterios de aceptación
- el índice se puede regenerar de forma fiable
- el sistema soporta crecimiento del contenido
- las respuestas mejoran respecto al MVP
- retrieval trazable y depurable
- SQLite y FAISS permanecen coherentes entre sí

## Definition of Done
- pipeline estable
- tests verdes
- documentación operativa disponible

---

# Fase 4 — Pulido, performance y experiencia premium

## Objetivo
Refinar UX, motion, rendimiento y percepción de producto.

## Features
- refinado de animaciones
- pulido de cards y transiciones
- skeletons / loading states
- mejoras de accesibilidad
- optimización de performance
- mejoras del AI Lab
- detalles editoriales avanzados
- “related content”
- “now page” opcional
- mejoras de SEO y metadata social

## Tests a escribir primero
- estados loading no rompen UI
- navegación y animaciones no bloquean interacción
- accesibilidad básica
- contenido relacionado se resuelve correctamente

## Definition of Done
- producto visualmente sólido
- buena sensación de fluidez
- sin sobrecarga visual
- listo para enseñarse públicamente

---

## 11. Contratos de backend mínimos

## 11.1 Endpoints iniciales
### Salud
- `GET /health`

### Chat
- `POST /api/v1/chat`
- `POST /api/v1/chat/stream`

### Ingestión
- `POST /api/v1/ingest/reindex`
- `POST /api/v1/ingest/file`
- `GET /api/v1/ingest/status`

### Retrieval interno o debug
- `POST /api/v1/retrieval/search`

## 11.2 Requisitos de API
- respuestas JSON consistentes
- errores estructurados
- timeouts controlados
- logging suficiente para depurar
- separación clara entre endpoints públicos e internos
- endpoints de ingestión deben disparar reindexado o marcarlo para ejecución inmediata

---

## 12. Modelo de datos mínimo

## 12.1 Persistencia relacional en SQLite
Tablas recomendadas:
- `documents`
- `document_chunks`
- `chat_sessions`
- `chat_messages`

## 12.2 `documents`
Campos sugeridos:
- `id`
- `slug`
- `title`
- `content_type`
- `source_path`
- `checksum`
- `published_at`
- `updated_at`
- `metadata_json`

## 12.3 `document_chunks`
Campos sugeridos:
- `id`
- `document_id`
- `chunk_index`
- `content`
- `embedding_json` o `embedding_blob`
- `token_count`
- `metadata_json`
- `faiss_vector_id`

## 12.4 `chat_sessions`
Campos sugeridos:
- `id`
- `created_at`
- `updated_at`
- `session_title`

## 12.5 `chat_messages`
Campos sugeridos:
- `id`
- `session_id`
- `role`
- `content`
- `created_at`
- `citations_json`

## 12.6 Persistencia vectorial en disco
Archivos sugeridos:
- `index.faiss`
- `index_meta.json`

`index_meta.json` debe permitir mapear:
- `faiss_vector_id`
- `document_id`
- `chunk_id`
- `slug`
- `content_type`

---

## 13. Requisitos del chatbot

## 13.1 Alcance del chatbot MVP
Debe responder sobre:

- quién soy
- experiencia profesional
- formación
- proyectos
- artículos y tutoriales
- intereses
- temas tratados en la web

## 13.2 Comportamientos deseados
- responder con claridad
- reconocer incertidumbre
- basarse en contenido real
- enlazar o citar contenidos cuando sea posible
- evitar alucinaciones
- manejar preguntas fuera de ámbito

## 13.3 No objetivos iniciales
- memoria compleja entre sesiones
- herramientas externas avanzadas
- navegación web automática
- multiagente excesivamente complejo desde el primer MVP

---

## 14. Requisitos del frontend

## 14.1 Páginas mínimas
- `/`
- `/about`
- `/projects`
- `/projects/[slug]`
- `/articles`
- `/articles/[slug]`
- `/notes`
- `/notes/[slug]`
- `/tags/[tag]`
- `/lab`
- `/chat`

## 14.2 Requisitos UX
- navegación clara
- responsive
- tiempos de carga razonables
- componentes reutilizables
- estética coherente entre contenido y laboratorio
- dark mode opcional si se introduce después, no obligatorio en fase inicial

---

## 15. Requisitos de calidad

## 15.1 Calidad técnica
- tipado fuerte cuando aplique
- linter y formatter
- tests fiables
- separación clara por capas
- manejo explícito de errores
- documentación breve pero útil

## 15.2 Calidad visual
- consistencia entre componentes
- tarjetas y layouts pulidos
- motion con propósito
- cero sensación de plantilla genérica mal adaptada

## 15.3 Calidad editorial
- buena legibilidad
- jerarquía visual fuerte
- soporte para bloques ricos en MDX
- buena presentación de código, citas, links y recursos

---

## 16. Flujo de trabajo obligatorio para asistentes de IA

Cualquier asistente de generación de código debe seguir estas reglas:

### Regla 1
No empezar implementando features sin identificar la fase activa.

### Regla 2
Antes de escribir código, producir:
- resumen del feature
- lista de archivos a crear/modificar
- criterios de aceptación
- tests que se van a escribir primero

### Regla 3
Escribir tests antes del código de producción.

### Regla 4
Implementar solo el mínimo necesario para pasar tests.

### Regla 5
No mezclar cambios de varias fases en una sola iteración.

### Regla 6
Mantener el diseño moderno, limpio y profesional.

### Regla 7
Toda animación debe justificarse por UX o percepción de calidad.

### Regla 8
Si una decisión técnica contradice esta especificación, explicarlo antes de implementarla.

---

## 17. Prompt operativo recomendado para Claude Code / Codex

Usa esta especificación como fuente de verdad.  
Trabaja por fases.  
Para cada tarea:

1. identifica la fase y el feature concreto  
2. resume el objetivo  
3. escribe primero los tests  
4. ejecuta los tests y confirma que fallan  
5. implementa el mínimo código necesario  
6. vuelve a ejecutar tests  
7. refactoriza sin romper tests  
8. explica brevemente lo implementado  

Prioriza mantenibilidad, claridad, separación de responsabilidades y calidad visual.  
El frontend debe sentirse moderno, elegante, ligero y profesional.  
No hagas una interfaz recargada.  
Usa Motion solo para animaciones sutiles y bien integradas.  
El backend de IA debe vivir en FastAPI + LangGraph.  
El contenido debe vivir en MDX en el repo.  
La persistencia relacional debe vivir en SQLite.  
La búsqueda vectorial debe vivir en FAISS en memoria con persistencia del índice a disco.  
Cada nuevo contenido debe disparar el proceso de reindexación del conocimiento disponible para el chatbot.  

---

## 18. Primera secuencia de implementación recomendada

Orden recomendado real:

1. Fase 0 completa  
2. Home + layout global  
3. Sistema de contenido MDX  
4. Projects + Articles + Notes  
5. Tags y navegación  
6. About + Contact  
7. AI Lab page  
8. Backend de chat mínimo  
9. Ingestión de contenido  
10. Retrieval + RAG  
11. Chat UI con streaming  
12. Pulido visual + motion + performance

---

## 19. Definition of Success

El proyecto será exitoso si cumple lo siguiente:

- la web puede enseñarse como portfolio real
- añadir contenido nuevo es fácil
- el diseño se ve profesional y atractivo
- hay una separación clara entre frontend y backend IA
- el chatbot responde con información propia útil
- el sistema es extensible
- los tests existen antes que el código y validan el comportamiento esperado
- el índice FAISS persiste a disco, se recarga correctamente y se mantiene sincronizado con el contenido
