# Práctica 5.1: DOM, botón para cambiar precios

20, 21 de Noviembre
José María Guirao (jmguirao@ugr.es)

En esta práctica pondremos a funcionar el botón **Cambiar Precio** usando el API de la práctica anterior.

## Campo de entrada para el precio

Añadiremos un campo de entrada `<input ...>` con el valor del precio actual en las tarjetas de productos (solo visible para usuarios admin).

## Manejador de eventos

Crearemos un manejador de eventos para cada botón de cambiar precio. En el evento `click`:

1. Enviar la llamada `PUT` al API
2. A la vuelta, poner el valor actualizado o un mensaje de error

## Identificar los botones

Para identificar todos los botones de cambiar precio en la pantalla, usaremos una clase y el método `querySelectorAll` o `getElementsByClassName`.

## Atributos data

Para etiquetar los elementos y acceder a ellos, usar [atributos data](https://developer.mozilla.org/es/docs/Learn/HTML/Howto/Use_data_attributes), a los que se accede como propiedades de los elementos.

## Código del script

```javascript
// cambio-precio.js
const cambiar_precio = (evt) => {
    const botón = evt.target                 // elemento al que se hecho click

    // identificar a que producto pertenece
    // identificar el <input> que le corresponde
    // tomar el valor de entrada del input

    fetch('url_del_api_put_del_producto',{
            method: "PUT",
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({precio_euros: entrada_del_input})
        })
        .then(res => res.json())
        .then( res => {
            console.log(res)
            // poner el precio actualizado
        })
        .catch(err => {
            console.error(err)
            // poner mensaje de error
    })
}

// sacar los botones_cambiar_precio aqui
...

for (const botón of botones_cambiar_precio) {
    botón.addEventListener('click', cambiar_precio)
}
```

## Cargar el script

Este código irá en un archivo `cambio-precio.js` cargado en el head con `defer` para que no actúe hasta que todo el DOM esté formado:

```html
<script defer src="/public/js/cambio-precio.js"></script>
```
