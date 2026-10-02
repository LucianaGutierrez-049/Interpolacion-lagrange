# Métodos Numéricos — Interpolación de Lagrange · Sesión 8

Aplicación académica independiente que estima la latencia de un microservicio a partir de cuatro nodos editables. HTML5, CSS3 y JavaScript vanilla, sin dependencias externas ni librerías matemáticas.

## Ejecución

1. Abre esta carpeta en Visual Studio Code.
2. Con la extensión Live Server instalada, haz clic derecho en `index.html` y selecciona **Open with Live Server**.
3. Modifica los cuatro pares y el punto evaluado; pulsa **Calcular interpolación**.

También funciona abriendo directamente `index.html` en un navegador, sin servidor ni instalación. **Cargar ejemplo Sesión 8** restaura y calcula los datos de la tarea. **Limpiar** vacía la entrada y oculta los resultados. Las unidades de la interfaz corresponden al contexto memoria/latencia, incluso al editar los datos.

## Método

P₃(x) = Σ (k=0…3) yₖ Lₖ(x), donde Lₖ(x) = ∏ (i=0…3, i≠k) (x−xᵢ)/(xₖ−xᵢ).

`evaluar` implementa manualmente dos bucles anidados O(n²). Calcula cada base y su contribución sin redondear. La interfaz muestra factores, sustitución numérica, aportes, suma y comprobación P₃(xᵢ)−yᵢ. Se usa el algoritmo de Lagrange de la guía teórica (página 56); multiplicar los cocientes equivale a dividir los dos productos del pseudocódigo. No se resuelven sistemas ni se emplean otros métodos. El grado del polinomio es como máximo 3; no siempre será exactamente cúbico. La función auxiliar `polinomios` expande manualmente los productos de las bases y obtiene los coeficientes de P₃(x). Su expansión usa operaciones adicionales; la evaluación principal mantiene O(n²). Los coeficientes se calculan desde los nodos y se redondean solo al mostrarlos.

## Ejemplo de la tarea

| x (GB) | y (ms) |
|---|---|
| 2 | 150 |
| 4 | 85 |
| 8 | 50 |
| 12 | 70 |

En x=6: bases −0.2, 0.75, 0.5, −0.05; aportes −30, 63.75, 25, −3.5. Resultado calculado: **P₃(6)=55.25 ms**. La comprobación reproduce 150, 85, 50 y 70 en sus respectivos nodos.

## Gráfica y validación

SVG adaptable con 401 muestras del mismo evaluador, curva continua dibujada como segmentos pequeños, cuatro nodos, cuadrícula, unidades y punto evaluado naranja. En el ejemplo usa [2,12]; en otros datos usa [min(xᵢ),max(xᵢ)]. Cuando x_eval queda fuera, amplía el rango hasta incluirlo y muestra el aviso de extrapolación. El punto naranja tiene sus coordenadas también en el texto bajo la gráfica.

Se rechazan campos vacíos, texto no numérico, NaN, Infinity, nodos repetidos y conjuntos distintos de cuatro puntos. Los decimales usan punto; se permiten negativos y notación científica. Se detectan resultados o rangos que exceden la representación numérica. JavaScript usa coma flotante de doble precisión; valores muy extremos o nodos muy próximos pueden perder precisión. Solo se redondea la presentación hasta 8 decimales y se conserva notación científica para magnitudes extremas.

## Archivos

- `index.html`: entrada y secciones de resultados.
- `css/styles.css`: diseño adaptable.
- `js/lagrange.js`: validación, evaluación y formato.
- `js/grafica.js`: preparación y dibujo SVG.
- `js/ui.js`: lectura y renderizado.
- `js/app.js`: eventos y coordinación.
- `tests/test.html` y `tests/tests.js`: 19 pruebas sin frameworks.
- `tests/verify-ui.cjs`: verificación adicional de coordinación de interfaz y generación del SVG en Node.

## Pruebas

Abre `tests/test.html`, o pulsa **Ver pruebas matemáticas** en el aplicativo. Para ejecutar en Node desde la carpeta del proyecto:

```sh
node -e "require('./js/lagrange.js'); require('./js/grafica.js'); require('./tests/tests.js');"
```

Incluye el caso 55.25, reproducción de nodos, suma de bases, rechazo de entradas, recta y cúbica conocidas, integridad de los datos gráficos y extrapolación.

Verificación adicional: `node tests/verify-ui.cjs`. Se aprobaron las 19 pruebas y la verificación de interfaz/SVG, incluyendo expansión de bases y coeficientes del ejemplo y de una cúbica distinta. Con el servidor HTTP local se pudo inspeccionar la vista estrecha en el navegador y probar los controles de práctica: ocultar/mostrar solución y reconocer la respuesta correcta. Captura en `vista-previa.png`. La revisión detallada de requisitos está en `VERIFICACION.md`.

## Preparación para el examen

La sección **Guía de examen** explica cuatro pasos: organizar nodos, construir bases, sustituir y sumar, y comprobar el resultado. Incluye errores frecuentes y cómo expandir el polinomio. **Ocultar solución y practicar** oculta resultados, gráfica, desarrollo y coeficientes; puedes trabajar en papel y usar **Comprobar mi respuesta**. Se comprueba el valor calculado de los datos actuales con tolerancia relativa de práctica 1e-6 y escala mínima 1. Cambiar datos borra la retroalimentación anterior. Usa esta sección para estudiar y respeta las reglas del docente durante el examen.

## Correspondencia con Parte B de la GAA (página 7)

- Lectura dinámica de cuatro nodos y x_eval: formulario editable.
- Lagrange con bucles anidados O(n²): `js/lagrange.js`, función `evaluar`.
- Resultado P₃(x_eval): tarjeta superior y suma final.
- Cuatro puntos y curva en [2,12]: gráfica del ejemplo.
- Punto (6,P₃(6)) destacado: marcador naranja.

El desarrollo mostrado sirve para estudiar. Ahora incluye expresiones algebraicas de las bases y del polinomio en decimal; la Parte A sigue siendo una entrega manual distinta, que debe contener tu desarrollo y las justificaciones solicitadas.

## Informe académico

El informe de la sesión está disponible en [Informe_Lagrange_Sesion8.pdf](documentacion/Informe_Lagrange_Sesion8.pdf).

