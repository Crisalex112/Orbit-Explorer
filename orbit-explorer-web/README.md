# Orbit Explorer Web — versión funcional

Aplicación web educativa para registrar, evaluar, comparar y priorizar cuerpos celestes.

## Forma más fácil de abrirla

### Windows

1. Descomprime la carpeta completa.
2. Haz doble clic en `ABRIR_ORBIT_EXPLORER.bat`.

También puedes abrir directamente `index.html` con doble clic. La aplicación ya no depende de módulos JavaScript ni de instalaciones externas.

## Ejecutarla con servidor local (opcional)

Esta opción no es necesaria, pero puede utilizarse si tienes Node.js:

```bash
npm start
```

Después abre:

```text
http://localhost:4173
```

También sirve la extensión **Live Server** de Visual Studio Code.

## Verificaciones técnicas

```bash
npm run check
npm test
```

- `npm run check` genera el paquete JavaScript y comprueba su sintaxis.
- `npm test` ejecuta pruebas del modelo, del HTML y del paquete funcional.

## Archivos principales

- `index.html`: estructura de la interfaz.
- `styles.css`: diseño espacial.
- `app.bundle.js`: aplicación funcional cargada por el HTML.
- `app.js`: código fuente de la interfaz.
- `data.js`: base de datos inicial.
- `evaluation.js`: evaluación y simulación.
- `charts.js`: gráficas cartesianas.
- `build.mjs`: genera `app.bundle.js` sin dependencias.
- `server.js`: servidor local opcional.
- `legacy/`: versión Java original.

## Si abriste una versión anterior

Elimina la carpeta anterior, descomprime esta versión nuevamente y presiona `Ctrl + F5` en el navegador para evitar que se use JavaScript guardado en caché.
