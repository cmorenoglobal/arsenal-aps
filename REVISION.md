# Revisión de arsenal-aps (octubre 2026)

Revisión del sitio **Arsenal Farmacológico APS · SSVSA** (`index.html`, `sw.js`, `manifest.json` y la planilla `Arsenal_Farmacologico_APS_SSVSA.xlsx`).

## Resumen en simple

- **El sitio es de bajo riesgo.** Es una página estática: no tiene formularios, no pide claves, no se conecta a ninguna base de datos ni carga código de otros sitios. Todos los datos (328 fármacos y 31 vacunas) están escritos dentro del propio `index.html`.
- **No encontré claves, contraseñas, tokens ni datos de pacientes**, ni en los archivos ni en el historial de git (hay un solo commit).
- **El punto débil real no es el código, sino la cuenta de GitHub.** Quien entre a tu cuenta puede cambiar cualquier dosis o restricción y el cambio se publica solo, sin que nadie lo revise. Eso es lo más importante que proteger (ver hallazgo A1).
- En esta rama ya corregí lo que era seguro y de bajo riesgo (ver "Lo que ya se corrigió"). **No cambié ningún dato clínico.**

---

## 1. Seguridad y disponibilidad

### Alto

**A1. Cualquiera que entre a tu cuenta de GitHub puede cambiar el arsenal, y el cambio sale publicado de inmediato.**
- *Situación:* la rama `main` no tiene protección y eres el único colaborador (administrador). Los archivos se subieron con "Add files via upload", así que GitHub Pages publica directamente lo que esté en `main`.
- *Cómo se explotaría:* alguien roba tu contraseña (phishing, contraseña repetida en otro sitio filtrado) o accede a un computador con la sesión abierta, y cambia por ejemplo una dosis o quita una restricción de especialista. Nadie lo notaría, porque no hay revisión ni aviso.
- *Cómo arreglarlo (lo haces tú en GitHub, 15 minutos):*
  1. Activa la **verificación en dos pasos (2FA)** en tu cuenta: *Settings → Password and authentication → Two-factor authentication*. Usa una app (Google Authenticator, Microsoft Authenticator) o una llave física, no SMS.
  2. Protege `main`: *Settings del repo → Rules → Rulesets → New branch ruleset*, objetivo `main`, marca **Restrict deletions**, **Block force pushes** y **Require a pull request before merging**. Así cada cambio pasa por un PR que queda registrado.
  3. Revisa *Settings → Applications* y *Settings → Developer settings → Personal access tokens* y elimina accesos que no reconozcas.
  4. Activa *Settings → Notifications* para que te llegue un correo con cada push.

### Medio

**M1. No hay una forma rápida de saber si el contenido cambió ni de qué versión oficial viene.**
- *Situación:* el sitio dice "2024–2025", pero no dice qué resolución o acta del Comité de Farmacia y Terapéutica respalda los datos ni la fecha de la última actualización.
- *Riesgo:* si alguien copia la página (es pública y fácil de clonar) y la modifica, los usuarios no tienen cómo distinguir la oficial. Lo mismo si tú la actualizas: no queda claro qué versión se está viendo.
- *Cómo arreglarlo:* agregar un pie de página con "Fuente: Resolución/Acta N° … del CFT, fecha …" y "Última actualización: dd-mm-aaaa", y un aviso del tipo "Información de apoyo; ante dudas consultar con Farmacia del establecimiento". Lo dejo como recomendación porque el texto debe definirlo el Servicio.

**M2. Los datos estaban expuestos a inyección de código si se editan a futuro (corregido).**
- *Situación:* la página armaba las tarjetas pegando el texto de cada fármaco directamente como HTML (`innerHTML`). Hoy los datos son tuyos y fijos, así que no era explotable desde afuera, pero si un día se cargan desde la planilla o alguien edita un texto con `<` o un trozo de código, ese código se ejecutaría en el navegador de cada funcionario.
- *Arreglo aplicado:* ahora todo texto se "escapa" antes de mostrarse (función `esc`). Los textos como "Asma <15 años" se ven igual que antes.

### Bajo

**B1. Faltaba Content-Security-Policy (corregido parcialmente).**
- GitHub Pages no permite configurar cabeceras de seguridad. Agregué una CSP como `<meta>` que impide cargar scripts, estilos o conexiones desde otros dominios y bloquea `<base>`, `<object>` y formularios. Tuve que permitir `'unsafe-inline'` porque todo el código está dentro del HTML y usa `onclick`; para endurecerla más habría que mover el JavaScript a un archivo `app.js` y reemplazar los `onclick` por `addEventListener` (cambio mayor, ver mejoras E2).
- Lo que **no** se puede poner con `<meta>` en GitHub Pages: `X-Frame-Options`/`frame-ancestors` (otro sitio podría mostrar tu página dentro de un marco). En un sitio sin login el riesgo es mínimo. Si algún día se necesita, poner el sitio detrás de Cloudflare (gratis) permite agregar esas cabeceras.

**B2. Que "lo boten" (caída del sitio).**
- GitHub Pages es robusto, tiene CDN y protección contra ataques de saturación; un sitio estático como este es muy difícil de botar. Los riesgos reales son: (a) que se borre o cambie el repo desde tu cuenta (ver A1), (b) que GitHub suspenda la cuenta por algún motivo, (c) que GitHub tenga una caída general (raro, unas horas).
- *Mitigación:* la página ya funciona sin conexión gracias al service worker (quien la abrió antes la sigue viendo). Recomiendo además guardar una copia del repo en otro lado (por ejemplo, descargar el ZIP cada vez que se actualiza, o un espejo en el sitio institucional del Servicio).

**B3. Metadatos de la planilla Excel.**
- `Arsenal_Farmacologico_APS_SSVSA.xlsx` contiene en sus propiedades tu nombre ("Última modificación por") y la referencia a un complemento de Office. No es un dato sensible, pero si prefieres que no aparezca: *Archivo → Información → Inspeccionar documento → Quitar propiedades del documento*. Revisé el contenido: solo trae el arsenal, sin datos de pacientes.

**B4. Service worker (corregido).**
- Guardaba en caché cualquier petición, incluso de otros dominios. Ahora solo guarda archivos del propio sitio. También subí la versión de caché a `af-aps-v5` para que los teléfonos tomen la versión nueva.

**B5. Sin dependencias externas ni Actions.**
- No hay librerías de CDN (no aplica SRI), no hay `package.json`, no hay GitHub Actions ni secretos configurados en el repo. Nada que actualizar por vulnerabilidades. Si en el futuro se agrega alguna librería externa, fijar la versión exacta y agregar `integrity="sha384-…"`.

**B6. Parámetros de URL, `eval`, formularios.**
- No se usan. El buscador solo filtra en el navegador; lo escrito no se envía a ninguna parte.

---

## 2. Mejoras

### Lo que ya se corrigió en esta rama

| Commit | Qué hace |
|---|---|
| Escapar datos antes de insertarlos con innerHTML | Ver M2 |
| Añadir Content-Security-Policy y política de referrer | Ver B1 |
| Accesibilidad: pestañas y filtros como botones reales | Las pestañas y los filtros por establecimiento eran `<div>`/`<span>`: no se podían usar con teclado ni los anunciaba un lector de pantalla. Ahora son botones, indican si están activos (`aria-pressed`), tienen foco visible y el buscador y los selectores tienen etiqueta. Se ven igual. |
| Celular: dosis con salto de línea y sin zoom en iPhone | En iPhone, tocar un campo con letra menor a 16 px hace zoom automático y descuadra la pantalla. |
| Ícono de la app y ajustes al service worker | El `manifest.json` apuntaba a `icon-192.png` e `icon-512.png`, que **no existen** en el repo (error 404 y la app instalada queda sin ícono). Agregué `icon.svg`. |
| Celular: eliminar el desborde horizontal | En un teléfono de 360 px la página medía 527 px de ancho y había que desplazarse de lado. Ahora calza exacto. |

Probado en Chromium a 1200 px y 360 px de ancho: sin errores en consola, filtros, buscador y pestañas funcionando (328 fármacos, 31 vacunas, igual que antes).

### Recomendaciones pendientes

**Usabilidad en celular**
- U1. En el teléfono los filtros ocupan casi toda la primera pantalla y los fármacos empiezan abajo. Sugiero dejar visible solo el buscador y esconder el resto detrás de un botón "Filtros ▾".
- U2. El contador de resultados está bien, pero no indica qué filtros están activos. Un texto corto ("SAPU · Antibióticos") ayuda a no confundirse.
- U3. Guardar el último filtro usado (por ejemplo, el tipo de establecimiento) para que quien trabaja en un SAPU no tenga que marcarlo cada vez.
- U4. La búsqueda distingue tildes: "lidocaina" sin tilde no encuentra "LIDOCAÍNA". Se arregla normalizando el texto (`normalize('NFD')`) al comparar. Es un cambio pequeño y lo recomiendo como siguiente paso.

**Accesibilidad**
- AC1. Revisar contraste del texto gris claro (`--texto-sec: #64748b` sobre gris `#f1f5f9`): está en el límite.
- AC2. Los emojis (💊, ⚠️, 🏥) los leen los lectores de pantalla ("píldora", "advertencia"); no es grave, pero se pueden marcar con `aria-hidden="true"`.

**Rendimiento**
- R1. La página pesa ~150 KB y carga rápido; no hay problema real. Si el arsenal crece mucho, conviene pasar los datos a un archivo `datos.json` aparte.

**Estructura y mantenimiento de los datos** (lo más importante a mediano plazo)
- E1. **Hay dos copias de los datos**: la planilla Excel y el JSON dentro de `index.html`. Si se actualiza una y no la otra, quedan distintas sin que nadie lo note. Sugiero que la planilla sea la fuente oficial y generar el JSON desde ella con un pequeño script (o una GitHub Action) cada vez que cambie, en lugar de editar el HTML a mano.
- E2. Separar el código en `index.html` (estructura), `app.js` (lógica) y `datos.json` (arsenal). Facilita revisar cambios: un PR que modifica `datos.json` muestra exactamente qué fármaco cambió.
- E3. Agregar al repo una descripción y un `README.md` breve: qué es, quién lo mantiene, de dónde salen los datos y cómo actualizarlos.
- E4. Las rutas del service worker están fijas a `/arsenal-aps/`. Si algún día el sitio se mueve a un dominio propio, hay que ajustarlas.

**Errores visibles**
- Íconos inexistentes del manifest (corregido) y desborde horizontal en celular (corregido). No encontré otros errores en consola.
