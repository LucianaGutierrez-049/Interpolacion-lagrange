# Verificación del proyecto — Sesión 8

## Actualización: diseño y preparación para examen

La revisión original de abajo describe la primera versión. La versión actual añade una guía de examen, un modo de práctica que oculta la solución y comprueba la respuesta, y las bases y el polinomio expandidos desde los nodos. Se aprobaron **19/19 pruebas** y la verificación adicional de interfaz, incluida la práctica. El navegador HTTP local permitió comprobar la vista estrecha y probar ocultar/mostrar solución y la respuesta 55.25; captura en `vista-previa.png`. Se resolvió así el bloqueo de inspección de la primera versión para la vista observada. No se ha realizado una revisión visual de todos los tamaños de pantalla.

La expansión de coeficientes es auxiliar y no cambia los dos bucles O(n²) del evaluador. Los coeficientes del ejemplo coinciden con 261, −1651/24, 227/32 y −43/192. También se verificó la expansión de una cúbica distinta y las condiciones de las bases en los nodos.

## Revisión original (antes de la actualización)

Se comparó el código con el texto completo adjunto y se releyó el contenido extraíble de todas las páginas de ambas guías (57 páginas de GT y 8 de GAA). La tabla de nodos, incluida como imagen en GAA, se inspeccionó durante la implementación. La Parte B está en la página 7 de GAA y el pseudocódigo de Lagrange en la página 56 de GT.

## Resultado de la revisión

Los requisitos funcionales obligatorios están implementados y las pruebas ejecutadas aprobaron. La revisión visual en un navegador real sigue pendiente: la conexión del navegador de la habilidad no estuvo disponible y el control alternativo rechazó el protocolo `file://`. Las verificaciones de interfaz usan un documento simulado en Node; comprueban la coordinación y el SVG generado, pero no prueban la apariencia, el diseño móvil ni el comportamiento real del navegador. No se afirma una validación visual completa.

| Requisito del texto | Evidencia / estado |
|---|---|
| Proyecto nuevo e independiente | Carpeta propia; archivos sin código ni referencias a LU o Jacobi. |
| HTML5, CSS3, JavaScript vanilla | Código local; no frameworks, paquetes externos ni librerías matemáticas. |
| Separación de responsabilidades | Motor en lagrange.js, SVG en grafica.js, renderizado en ui.js y eventos en app.js. |
| Cuatro nodos y x_eval editables | Se generan cuatro filas y ocho campos; x_eval es el noveno campo. |
| Datos y botón del ejemplo | (2,150), (4,85), (8,50), (12,70); evaluación en 6. El botón carga y calcula. |
| Algoritmo general | Probado con recta, cúbica conocida, función constante y nodos desordenados. |
| Dos bucles anidados O(n²) | Evaluar recorre k y, dentro, i≠k; multiplica los factores y suma yₖLₖ. |
| Resultado calculado, sin respuesta fija | El motor no contiene 55.25; ese valor solo aparece como referencia en pruebas y documentación. |
| Resultado con unidades | P₃(6)=55.25 ms y frase solicitada de memoria/latencia. |
| Desarrollo de Lagrange | Datos, fórmula, cuatro bases con sustitución y factores, cuatro aportes y suma final. |
| Cuatro puntos y curva | SVG con cuatro círculos de nodos y path de 401 muestras del mismo evaluador. |
| Punto (6,55.25) destacado | Un círculo naranja y guías discontinuas; coordenadas en title y texto. |
| Ejes, cuadrícula y leyenda | Memoria asignada (GB), Latencia media (ms), seis marcas por eje y tres entradas de leyenda. |
| Intervalo del ejemplo [2,12] | Comprobado automáticamente. |
| Otros rangos y extrapolación | Usa min/max de nodos; amplía solo hasta x_eval si queda fuera y muestra aviso. Probados ambos lados. |
| Enteros, negativos y decimales | Lectura numérica finita y prueba con nodos negativos/decimales. Punto decimal indicado en interfaz. |
| Vacíos, texto, NaN, Infinity | Rechazo probado tanto en motor como en el flujo de evaluación. |
| x repetidos | Rechazo con el mensaje explicativo del denominador cero. |
| Número de nodos distinto de cuatro | Motor rechaza tres o cinco nodos; interfaz fija en cuatro filas. |
| Comprobación de nodos | Tabla xi, yi, P₃(xi), diferencia; cuatro diferencias cero en el ejemplo. |
| Botones calcular, cargar y limpiar | Eventos comprobados; limpiar vacía entradas y oculta resultados. Editar oculta resultados anteriores. |
| Precisión y formato | Cálculos sin redondeo; presentación hasta 8 decimales, enteros sin parte decimal y −0 eliminado. Notación científica para magnitudes extremas. |
| Pruebas mínimas solicitadas | Las seis categorías están cubiertas por 16 pruebas matemáticas/gráficas y la verificación adicional de interfaz. |
| README | Objetivo, método, fórmula, estructura, Live Server, ejemplo, resultado, gráfica y validaciones. |
| Diseño limpio y adaptable | CSS implementado con ajuste a una columna en pantallas pequeñas; apariencia pendiente de inspección visual. |
| Expansión de bases y polinomio simplificado | Opcional según el texto; no implementada. No hay coeficientes fijos. |

## Cálculo comprobado

| k | Lₖ(6) | yₖ Lₖ(6) (ms) |
|---|---:|---:|
| 0 | −0.2 | −30 |
| 1 | 0.75 | 63.75 |
| 2 | 0.5 | 25 |
| 3 | −0.05 | −3.5 |

Σ Lₖ(6)=1. La suma de aportes es −30+63.75+25−3.5=55.25 ms.

| xi | yi | P₃(xi) | Diferencia |
|---:|---:|---:|---:|
| 2 | 150 | 150 | 0 |
| 4 | 85 | 85 | 0 |
| 8 | 50 | 50 | 0 |
| 12 | 70 | 70 | 0 |

## Ejecuciones realizadas

```sh
node -e "require('./js/lagrange.js'); require('./js/grafica.js'); require('./tests/tests.js');"
node tests/verify-ui.cjs
```

Resultado: **16/16 pruebas aprobadas**, código de salida 0. La verificación adicional de interfaz/SVG también terminó con código 0. No se encontraron errores funcionales en los casos comprobados; se ampliaron las pruebas sin modificar el algoritmo.

## Alcance académico

La Parte B exige las entradas, Lagrange O(n²), salida y gráfica: están implementadas. La Parte A exige desarrollo manual con expresiones algebraicas simplificadas de las bases y del polinomio; es una entrega distinta y no está resuelta como documento manual en este proyecto. El TXT permite expresamente omitir la expansión simbólica de la aplicación.

## Cómo abrir y comprobar visualmente

Abre index.html con un navegador o desde VS Code con Live Server. El ejemplo se carga al iniciar. Deben verse 55.25 ms, cuatro puntos azules, curva azul y punto naranja (6,55.25). Comprueba también la vista estrecha y abre tests/test.html para ver las 16 pruebas. Esta revisión visual es el único paso de verificación pendiente.
