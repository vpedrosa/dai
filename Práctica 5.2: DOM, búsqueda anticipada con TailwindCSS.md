# Práctica 5.2: DOM, búsqueda anticipada con TailwindCSS

27, 28 de Noviembre
José María Guirao (jmguirao@ugr.es)

En esta práctica empezaremos a hacer una búsqueda anticipada como la de la web de la tienda de Mercadona. La completaremos la semana que viene. Usaremos TailwindCSS en lugar de Bootstrap para el CSS.

Haremos una página con una barra de búsqueda que al teclear 3 o más caracteres, aparezca el número de productos que contienen este texto. Dejamos las tarjetas de los productos para más adelante.

## API

Previamente prepararemos un nuevo endpoint:

```
GET /api/busqueda-anticipada/:texto
```

Que devuelva una lista con los productos que contengan la cadena de búsqueda.

## Tailwind

Para que se cargue y funcione Tailwind usamos la plantilla:

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Búsqueda anticipada</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@unocss/reset/tailwind.min.css">
        <script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>
    </head>
    <body>
    <!-- Aquí la barra de búsqueda -->

    <!-- Aquí los resultados -->
    </body>
</html>
```

## Extensión de VSCode

Es muy conveniente la [extensión de VSCode para Tailwind](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss). Para que se active tiene que encontrar un archivo `tailwind.config.js`, aunque esté vacío.

## Barra de búsqueda con IA

Tailwind es muy frecuente y adecuado para las IAs. Para la barra de búsqueda podemos pedírselo a una IA o buscar alguna plantilla en internet. Se puede subir a la IA una imagen de la barra de Mercadona como referencia.
