# Arsenal Farmacológico APS · SSVSA

Buscador del Arsenal Farmacológico para establecimientos de Atención Primaria (APS, SAPU, SAR, SUR, CECOF) del Servicio de Salud Valparaíso – San Antonio. Funciona en el celular, se puede instalar como app y sigue funcionando sin conexión después de la primera visita.

## De dónde salen los datos

La **única fuente** es la planilla `Arsenal_Farmacologico_APS_SSVSA.xlsx`. La página la lee directamente cada vez que se abre. No hay datos copiados dentro del código.

La fecha de "Última actualización" que aparece al pie de la página también sale del Excel: es la fecha en que se guardó por última vez.

## Cómo actualizar el arsenal

1. Abre `Arsenal_Farmacologico_APS_SSVSA.xlsx` en Excel, haz los cambios y guarda.
2. En GitHub, entra al repositorio → **Add file → Upload files**, arrastra el Excel **con el mismo nombre** y confirma con **Commit changes**.
3. Espera 1 o 2 minutos y recarga la página para ver los cambios.

### Reglas para que el Excel se lea bien

- Solo se lee la **primera hoja** del libro.
- Debe existir una fila de encabezados con estas columnas (el orden puede cambiar): CATEGORÍA, FÁRMACO, FORMA FARMACÉUTICA, DOSIS, PROFESIONAL, APS, SAPU, SAR, SUR, CECOF, OBSERVACIONES / RESTRICCIONES.
- En las columnas APS, SAPU, SAR, SUR y CECOF, una **X** indica que el establecimiento tiene el fármaco. Cualquier otro valor, o la celda vacía, se considera "no".
- Las filas con categoría **VACUNA / INMUNOGLOBULINA** aparecen en la pestaña Vacunas. En esas filas, la columna DOSIS se muestra como presentación.
- Las filas sin nombre en FÁRMACO se ignoran, como la nota de abreviaturas del final.

Si el Excel no se puede leer, la página muestra un mensaje con el motivo, por ejemplo "Falta la columna SAPU", y un enlace para descargar la planilla.

## Archivos

- `index.html`: la página completa (estructura, estilos y lógica).
- `sw.js`: permite que la página funcione sin conexión.
- `manifest.json`, `icon.svg`: datos para instalarla como app.
- `REVISION.md`: revisión de seguridad y mejoras (octubre 2026).
