# LIBRO — Guía de instalación (100% gratis)

## Qué incluye esta carpeta

- **index.html** → la app completa. Ábrela en cualquier navegador (Android, PC, tablet). No necesita instalación ni internet para funcionar: todo tu registro se guarda en el propio dispositivo (IndexedDB).
- **Code.gs** → el "backend" opcional para respaldar tus datos en una hoja de Google Sheets. Es opcional — la app funciona perfectamente sin esto.

Nada de esto tiene costo. No usa ninguna API de pago, ni requiere tarjeta de crédito en ningún paso.

---

## Paso 0 — Por qué Brave no te deja instalarla (y cómo arreglarlo)

Si abres `index.html` directamente desde tu teléfono (una ruta que empieza con `file://`), **ningún navegador basado en Chromium** (Brave, Chrome, Edge...) te va a ofrecer "Instalar app" ni un ícono real de "Agregar a pantalla de inicio" — esa función solo funciona con páginas servidas por `https://`. Es una restricción de seguridad del navegador, no algo que se pueda evitar desde el código de la app.

La solución es subir esta carpeta a un hosting gratuito (te da automáticamente `https://`), y desde ahí sí vas a poder instalarla como una app normal. Dos opciones gratuitas, sin tarjeta de crédito:

### Opción A — Netlify Drop (la más rápida, sin cuenta)

1. Desde tu PC, entra a [app.netlify.com/drop](https://app.netlify.com/drop).
2. Arrastra la carpeta `finanzas-app` completa (con `index.html`, `manifest.json`, `sw.js` e `icons/`) a la página.
3. En unos segundos te da una URL como `https://algo-al-azar.netlify.app`.
4. Abre esa URL en Brave desde tu Android.
5. Toca el menú (⋮) → **"Instalar app"** o **"Agregar a pantalla de inicio"** — ahora sí debería aparecer la opción, con el ícono de la app.

⚠️ Nota: los sitios gratuitos de Netlify Drop sin cuenta pueden expirar después de un tiempo. Para algo permanente, usa la Opción B.

### Opción B — GitHub Pages (gratis para siempre, requiere una cuenta gratuita de GitHub)

1. Crea una cuenta gratuita en [github.com](https://github.com) si no tienes una.
2. Crea un repositorio nuevo (puede ser privado o público), por ejemplo `finanzas-app`.
3. Sube ahí los archivos de esta carpeta (`index.html`, `manifest.json`, `sw.js`, `icons/`, `Code.gs` si quieres, `SETUP.md`).
4. Ve a **Settings → Pages** del repositorio, y en "Source" elige la rama principal (`main`) y la carpeta raíz (`/`).
5. Guarda — GitHub te da una URL fija como `https://tu-usuario.github.io/finanzas-app/`.
6. Abre esa URL en Brave desde tu Android y sigue el mismo paso 5 de la Opción A.

Una vez instalada, la app se abre como cualquier otra: ícono en tu pantalla de inicio, sin barra de direcciones, y sigue funcionando sin internet gracias a IndexedDB (tus datos) y al service worker (la propia página).

⚠️ **Importante — esto NO sincroniza tus datos entre PC y teléfono.** Subir la app a GitHub Pages o Netlify solo te da una URL con `https://` para poder *instalarla*; cada dispositivo que la abra sigue teniendo su propia base de datos local, separada. Para que el teléfono y la PC vean la misma información, **los dos tienen que estar conectados a la misma hoja de Google Sheets** (Paso 2 más abajo) — eso sí sincroniza.

---

## Paso 1.5 — Sincronizar entre varios dispositivos (PC + teléfono)

Ahora la sincronización funciona en las dos direcciones: cada dispositivo **sube** lo nuevo que registraste ahí, y **descarga** lo que se registró en los demás. Para que funcione:

1. Completa el Paso 2 (Google Sheets) **una sola vez**, desde cualquiera de los dos dispositivos.
2. En el **otro** dispositivo, abre la app, ve a **Ajustes**, y pega ahí **la misma URL** del script (la que termina en `/exec`).
3. Toca **Guardar URL** y luego **Sincronizar ahora** en ambos dispositivos.
4. A partir de ahí, cada vez que uno de los dos registre algo y sincronice (manual, automático cada 5 min, o al recuperar conexión), el otro dispositivo lo va a "ver" la próxima vez que sincronice.

No es instantáneo en tiempo real (no hay una notificación empujada de un dispositivo a otro) — cada uno consulta la hoja cuando le toca sincronizar. Para uso personal diario esto es más que suficiente.

**Si ya habías probado la sincronización antes de este cambio:** el script se actualizó para usar un identificador único por registro (`uid`) en vez del identificador local, que antes podía chocar entre dispositivos. Para evitar mezclar el formato viejo con el nuevo:

1. Ve a tu Google Sheet → pestaña "Transacciones" → borra todas las filas de prueba que ya tengas (puedes dejar la hoja completamente vacía, la app la vuelve a preparar sola).
2. En Apps Script, reemplaza todo el código por la versión nueva de `Code.gs` (incluida en esta carpeta) y haz clic en **Implementar → Administrar implementaciones → editar (ícono de lápiz) → Nueva versión → Implementar**, para que la URL existente use el código actualizado (no hace falta generar una URL nueva).
3. Vuelve a sincronizar desde cada dispositivo.

---

## Paso 1 — Usar la app localmente (sin nada más)

1. Copia la carpeta `finanzas-app` a tu teléfono, PC o tablet.
2. Abre `index.html` con tu navegador (Chrome, Firefox, Safari, etc.).
3. En Android: puedes tocar el menú del navegador → **"Añadir a pantalla de inicio"** para que se abra como una app normal.
4. Empieza a registrar tus transacciones. Todo queda guardado en tu dispositivo, incluso sin internet.

⚠️ Importante: como los datos se guardan en el navegador, **no borres los datos de navegación / caché** de ese navegador, o perderás el historial. Si quieres respaldo adicional, sigue el paso 2.

---

## Paso 2 — Conectar el respaldo gratuito en Google Sheets (opcional)

Esto te permite ver y respaldar tus datos en una hoja de cálculo de Google, sincronizada automáticamente cuando tengas internet.

### 2.1 Crea la hoja de cálculo

1. Ve a [sheets.google.com](https://sheets.google.com) y crea una hoja nueva.
2. Ponle el nombre que quieras, por ejemplo "Finanzas personales".

### 2.2 Instala el script

1. En la hoja, ve a **Extensiones → Apps Script**.
2. Borra el código de ejemplo que aparece y pega todo el contenido del archivo `Code.gs` (incluido en esta carpeta).
3. Guarda el proyecto (ícono de disquete o Ctrl/Cmd + S). Puedes ponerle un nombre como "Sync Finanzas".

### 2.3 Publica el script como Web App

1. Arriba a la derecha, haz clic en **Implementar → Nueva implementación**.
2. En "Selecciona el tipo", elige **Aplicación web**.
3. Configura:
   - **Ejecutar como:** tu cuenta (Yo)
   - **Quién tiene acceso:** *Cualquier usuario* (esto es necesario para que la app pueda enviar datos; el enlace es único y difícil de adivinar, pero no lo compartas públicamente)
4. Haz clic en **Implementar**.
5. Google te pedirá autorizar permisos la primera vez — es tu propio script, es seguro aceptarlo (puede mostrar una advertencia de "app no verificada" porque es un script personal; haz clic en "Avanzado" → "Ir a (nombre del proyecto), no seguro" para continuar).
6. Copia la **URL de la aplicación web** que te entrega (termina en `/exec`).

### 2.4 Conecta la URL en la app

1. Abre `index.html` → ve a **Ajustes**.
2. Pega la URL en el campo "URL del Web App de Google Apps Script".
3. Toca **Guardar URL** y luego **Sincronizar ahora**.
4. Ve a tu hoja de Google Sheets: debería aparecer una pestaña "Transacciones" con tus registros.

A partir de aquí, cada vez que tengas internet, la app sincronizará automáticamente los registros pendientes (también lo hace sola cada 5 minutos y al recuperar conexión).

---

## Borrar registros: ahora sí se sincroniza

Al eliminar una transacción desde **Transacciones → Eliminar**, la app:

1. La borra de inmediato en el dispositivo donde la borraste.
2. Guarda su identificador (`uid`) en una lista de "pendientes por borrar".
3. En la próxima sincronización, envía esa lista al script, que elimina esas mismas filas de tu Google Sheet.
4. Cuando el otro dispositivo sincronice, verá que ese `uid` ya no está en la hoja y lo borrará también de su base local — quedando los dos al día.

**Importante:** si vuelves a redeployar el script, tienes que usar el `Code.gs` incluido en esta carpeta (ya trae el soporte de borrado). Sigue el mismo procedimiento de "Nueva versión" o "Nueva implementación" que ya conoces.

## ⚠️ Sobre la sincronización cada 5 segundos

La app ahora intenta sincronizar automáticamente cada 5 segundos mientras esté abierta y con internet. Esto la hace sentir "en tiempo real", pero tiene un costo: Google Apps Script en una cuenta gratuita (no Workspace) tiene una cuota de **~90 minutos de ejecución acumulada por día**. Con dos dispositivos sincronizando cada 5 segundos todo el día, es posible agotar esa cuota, y el script empezará a devolver errores temporales hasta el día siguiente (se reinicia solo a medianoche, hora del Pacífico de EE.UU.).

Si notas que la sincronización empieza a fallar sin razón aparente después de usar la app varias horas seguidas, esa es la causa más probable. La solución es simplemente subir el intervalo — por ejemplo a 30 segundos o 1 minuto — cambiando este número en `index.html`:

```js
setInterval(()=>{ if(navigator.onLine) trySync(); }, 5*1000); // <- cambia 5*1000 por, por ejemplo, 30*1000
```

## Notas sobre el OCR (lectura de recibos)

- La primera vez que uses "Leer recibo (OCR)" necesitas internet, porque la app descarga la librería **Tesseract.js** (gratuita, de código abierto, sin necesidad de cuenta ni API key).
- Después de esa primera carga, el navegador la deja en caché y puedes seguir usando el resto de la app sin conexión.
- El texto detectado siempre se te muestra para que lo confirmes antes de guardar — el sistema nunca completa un monto automáticamente sin tu revisión.
- Si el reconocimiento de un banco o plataforma en particular no es preciso, se puede ir mejorando con el tiempo (cada plataforma tiene un formato distinto de recibo).

---

## Qué tasa se usa en cada conversión

- **USD ↔ Bs** se calcula con la tasa **BCV oficial**.
- **USDT ↔ Bs** se calcula con la tasa **paralela / P2P** (normalmente distinta y más alta que la oficial).

Antes, un error hacía que ambas conversiones usaran la misma tasa (la paralela), por lo que el monto en USD y en USDT terminaba siendo idéntico en bolívares — esto ya está corregido: cada registro ahora guarda las dos tasas por separado (`tasa_usd_bs` y `tasa_usdt_bs`), y puedes ver ambas en la vista previa antes de guardar un registro.

## Sobre las tasas de cambio

La app intenta traer la tasa automáticamente, probando estas fuentes gratuitas en orden (todas sin API key ni tarjeta de crédito):

1. **[DolarApi](https://dolarapi.com/docs/venezuela/)** (`ve.dolarapi.com`) — da la tasa oficial BCV y la tasa paralela en una sola llamada. Es la fuente principal.
2. **[BCV.today](https://bcv.today/api/)** (`bcv.today/api/rate.json`) — respaldo si DolarApi no responde. Solo trae la tasa oficial (scraping directo de bcv.org.ve).
3. **Krecit** (`pay.krecit.com/api/services/bcv-rate`) — fuente comunitaria compartida sin documentación pública oficial; la app la lee de forma defensiva (prueba varios nombres de campo posibles) por si cambia su formato en el futuro.

Si ninguna de las tres responde (o no hay internet), puedes ingresar las tasas manualmente en **Ajustes → Tasas de cambio manuales**. La tasa "USDT/Bs" usa como referencia la tasa paralela mientras no configures una fuente distinta; puedes sobreescribirla manualmente si tienes una tasa P2P más exacta del momento (por ejemplo, del mercado P2P de Binance).

**¿Por qué no se llama directo a bcv.org.ve?** El sitio del Banco Central de Venezuela bloquea el acceso automatizado y no permite peticiones `fetch()` desde otros dominios (CORS), así que una app en el navegador no puede leerlo directamente — necesita un intermediario que sí pueda visitarlo y republicar el dato en un formato accesible. Eso es justo lo que hace **BCV.today** (fuente #2 de la lista de arriba): scrapea la misma página oficial del BCV (incluida la de "Cambio Oficial") y la republica como JSON abierto, así que tu app ya recibe ese mismo número de forma indirecta pero confiable.

**Nota sobre DolarVZLA:** también existe [dolarvzla.com/dev](https://dolarvzla.com/dev), que incluye tasa BCV y USDT P2P de Binance, pero no publica una especificación de API estable y pública que se pudiera verificar al momento de escribir esto. Si más adelante confirmas el formato exacto de su endpoint, se puede agregar como una fuente más siguiendo el mismo patrón usado para las otras tres (ver el arreglo `RATE_SOURCES` dentro de `index.html`).

---

## Resumen de costos: **$0**

| Componente | Costo |
|---|---|
| App (HTML/JS) | Gratis, corre en tu navegador |
| Hosting (Netlify Drop o GitHub Pages) | Gratis, con HTTPS incluido |
| Base de datos local (IndexedDB) | Gratis, incluida en el navegador |
| Respaldo en Google Sheets | Gratis, con tu cuenta de Google personal |
| Backend de sincronización (Apps Script) | Gratis, sin límite de uso relevante para uso personal |
| Tasas de cambio (dolarapi.com) | Gratis, sin llave de API |
| OCR (Tesseract.js) | Gratis, código abierto, sin cuenta |
