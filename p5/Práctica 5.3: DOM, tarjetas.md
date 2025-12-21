# Práctica 5.3: DOM, tarjetas

4, 5 de Diciembre
José María Guirao (jmguirao@ugr.es)

En esta sesión completaremos la búsqueda mostrando las tarjetas de los productos.

## Tarjeta prototipo con Tailwind

El código de la tarjeta puede ser parecido a [Cards](https://tailwindcss.com/docs/container), con los cambios necesarios para parecerse a los de Mercadona:

```html
<!-- Tarjeta producto -->
<div class="max-w-sm rounded overflow-hidden w-2/12 hover:shadow">
    <img class="w-10/12 h-3/6 bg-gray-400 ml-5"
             src="https://prod-mercadona.imgix.net/images/aa127a068121be5a0a5dfd543ddb2fa0.jpg?fit=crop&h=300&w=300"
             alt="queso para fundir">
    <div class="px-6 py-4">
        <div class="mb-2 text-sm">Queso rallado especial para fundir mezcla Hacendado</div>

        <!-- Poner aquí el resto de los textos-->

        </div>
    <div class="px-6 pb-2 text-center">
        <span class="w-full inline-block rounded-full px-3 py-1 text-sm text-yellow-800 mr-2 mb-2
                     border border-yellow-600 hover:bg-yellow-200">Añadir al carro</span>
    </div>
</div>
```

## Elemento template

Una vez que nos funcione, la ponemos dentro de un elemento `<template>` para poder clonarla como en [HTML templates with vanilla JavaScript](https://gomakethings.com/html-templates-with-vanilla-javascript/):

```html
<template id="plantilla">
<!-- Tarjeta producto -->
    ...
</template>
```

## Mostrar tarjetas

Ahora en lugar de mostrar el número de productos, mostraremos las tarjetas de cada producto:

```javascript
function muestraProducto(p) {                                  // para cada producto p
    const template = document.getElementById('plantilla')      // la plantilla
    const clonado = template.content.cloneNode(true)           // se clona

    // substituir en clonado la información del producto p.img_url, p.texto_1, etc

    // tarjetas es el nodo de la página donde se mostrarán las tarjetas
    const tarjetas = document.getElementById('tarjetas')
    tarjetas.append(clonado)
}
```
