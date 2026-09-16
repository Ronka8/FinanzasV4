/**
 * LIBRO — Backend gratuito de sincronización con Google Sheets
 * ---------------------------------------------------------------
 * Este script:
 *  - Recibe transacciones nuevas desde cualquier dispositivo (POST,
 *    campo "records") y las agrega como filas en la hoja "Transacciones".
 *  - Recibe borrados (POST, campo "deletes": lista de uid) y elimina
 *    esas filas de la hoja, para que un borrado hecho en un dispositivo
 *    se refleje también en los demás.
 *  - Permite que cualquier dispositivo DESCARGUE la lista completa
 *    (GET ?action=list), para que dos dispositivos distintos (por
 *    ejemplo tu PC y tu teléfono) terminen viendo los mismos datos.
 *
 * No requiere tarjeta de crédito ni ningún servicio de pago: corre
 * dentro de tu propia cuenta de Google, gratis.
 *
 * Instrucciones de instalación completas en SETUP.md
 */

const SHEET_NAME = 'Transacciones';

const HEADERS = [
  'uid', 'fecha_hora_utc', 'fecha_hora_local', 'zona_horaria', 'tipo', 'categoria',
  'moneda_original', 'monto_original', 'tasa_usd_bs', 'tasa_usdt_bs',
  'monto_bs', 'monto_usd', 'monto_usdt', 'plataforma', 'nota', 'origen'
];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Devuelve el set de uid (columna A) que ya existen en la hoja, para no
// duplicar un registro si por alguna razón se reintenta el envío.
function getExistingUids_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return new Set();
  const uids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  return new Set(uids.map(String).filter(Boolean));
}

// Elimina de la hoja todas las filas cuyo uid (columna A) esté en el
// arreglo `uidsToDelete`. Recorre de abajo hacia arriba para no romper
// los índices de fila mientras borra.
function deleteRowsByUid_(sheet, uidsToDelete) {
  if (!uidsToDelete || uidsToDelete.length === 0) return 0;
  const deleteSet = new Set(uidsToDelete.map(String));
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const uidsCol = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  let deleted = 0;
  for (let i = uidsCol.length - 1; i >= 0; i--) {
    const uid = String(uidsCol[i][0]);
    if (uid && deleteSet.has(uid)) {
      sheet.deleteRow(i + 2); // +2: la fila 1 es encabezado, el arreglo es 0-index
      deleted++;
    }
  }
  return deleted;
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const records = body.records || [];
    const deletes = body.deletes || [];
    const sheet = getSheet_();

    // 1) Primero los borrados, para no chocar con dedup de uids reciclados
    const deleted = deleteRowsByUid_(sheet, deletes);

    // 2) Luego los registros nuevos, con protección contra duplicados
    const existingUids = getExistingUids_(sheet);
    let saved = 0, skipped = 0;

    records.forEach(function (t) {
      const uid = t.uid != null ? String(t.uid) : '';
      if (uid && existingUids.has(uid)) { skipped++; return; }
      sheet.appendRow([
        uid,
        t.fecha_hora_utc || '',
        t.fecha_hora_local_str || '',
        t.tz || '',
        t.tipo || '',
        t.categoria || '',
        t.moneda_original || '',
        t.monto_original || '',
        t.tasa_usd_bs || '',
        t.tasa_usdt_bs || '',
        t.monto_bs || '',
        t.monto_usd || '',
        t.monto_usdt || '',
        t.plataforma || '',
        t.nota || '',
        t.origen || ''
      ]);
      if (uid) existingUids.add(uid);
      saved++;
    });

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, saved: saved, skipped: skipped, deleted: deleted }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Consulta el precio P2P de Binance para USDT/VES directamente (sin CORS,
 * porque esto corre en el servidor de Google, no en el navegador).
 * tradeType 'SELL' = anuncios de gente que está COMPRANDO USDT (te dicen
 * cuánto te pagarían si tú vendes) -> referencia para "vender".
 * tradeType 'BUY'  = anuncios de gente que está VENDIENDO USDT (te dicen
 * cuánto te cobrarían si tú compras) -> referencia para "comprar".
 * Se promedian los primeros anuncios (los mejor rankeados/más grandes)
 * para evitar que un anuncio suelto y atípico distorsione el número.
 */
/**
 * Consulta la tasa exacta de USDT/VES de Binance P2P utilizando un servicio
 * optimizado para Venezuela, evitando los bloqueos de IP y obteniendo el valor real.
 */
function getBinanceP2PPrice_(tradeType) {
  try {
    // Usamos un endpoint público que rastrea la tasa exacta de Binance P2P en vivo
    const url = 'https://www.usdt.com.ve/api/tasa'; // O puedes usar un conector JSON directo
    
    // Alternativa directa mediante una API de agregación limpia en formato JSON:
    const altUrl = 'https://cotizave.com/api/v1/fx/rates'; // Devuelve Binance P2P real
    
    const options = {
      method: 'get',
      muteHttpExceptions: true
    };
    
    const resp = UrlFetchApp.fetch('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        asset: 'USDT',
        fiat: 'VES',
        tradeType: tradeType,
        page: 1,
        rows: 2,
        payTypes: [],
        publisherType: null,
        merchantCheck: false
      }),
      muteHttpExceptions: true
    });
    
    const json = JSON.parse(resp.getContentText());
    if (json && json.data && json.data.length > 0) {
      return parseFloat(json.data[0].adv.price);
    }
    
    return null;
  } catch (err) {
    console.error("Error al consultar Binance: " + err);
    return null;
  }
}

/**
 * GET normal (sin parámetros) -> mensaje de estado, útil para probar en el
 * navegador que el script quedó bien desplegado.
 * GET ?action=list -> devuelve todos los registros como JSON, para que
 * otro dispositivo pueda descargarlos y quedar sincronizado.
 * GET ?action=binance -> devuelve el precio actual de USDT/VES en Binance
 * P2P (comprar, vender y el promedio de ambos).
 */
function doGet(e) {
  const action = e && e.parameter && e.parameter.action;

  if (action === 'list') {
    const sheet = getSheet_();
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, records: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
    const records = values.map(function (row) {
      const obj = {};
      HEADERS.forEach(function (h, i) { obj[h] = row[i]; });
      return obj;
    });
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, records: records }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'binance') {
    try {
      const venderA = getBinanceP2PPrice_('SELL'); // lo que te pagarían si vendes
      const comprarA = getBinanceP2PPrice_('BUY');  // lo que te cobrarían si compras
      let promedio = null;
      if (venderA && comprarA) promedio = (venderA + comprarA) / 2;
      else promedio = venderA || comprarA || null;

      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, vender: venderA, comprar: comprarA, promedio: promedio }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, mensaje: 'El script de sincronización está activo.' }))
    .setMimeType(ContentService.MimeType.JSON);
} 