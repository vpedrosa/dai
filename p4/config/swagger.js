// config/swagger.js - Configuración de Swagger para documentación de API
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Tienda Online',
      version: '1.0.0',
      description: 'API RESTful para gestión de productos de una tienda online. Práctica 4 - DAI',
      contact: {
        name: 'Soporte API',
        email: 'soporte@tiendaonline.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      schemas: {
        Producto: {
          type: 'object',
          required: ['nombre', 'precio'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID único del producto',
              example: '6719f538fdfbd218f753f044'
            },
            nombre: {
              type: 'string',
              description: 'Nombre del producto',
              example: 'Producto de prueba'
            },
            precio: {
              type: 'number',
              description: 'Precio del producto en euros',
              example: 29.99
            },
            descripcion: {
              type: 'string',
              description: 'Descripción del producto',
              example: 'Descripción detallada del producto'
            },
            imagen: {
              type: 'string',
              description: 'URL de la imagen del producto',
              example: 'https://example.com/imagen.jpg'
            },
            categoria: {
              type: 'string',
              description: 'Categoría del producto',
              example: 'Electrónica'
            }
          }
        },
        ProductoInput: {
          type: 'object',
          required: ['nombre', 'precio'],
          properties: {
            nombre: {
              type: 'string',
              description: 'Nombre del producto',
              example: 'Producto nuevo'
            },
            precio: {
              type: 'number',
              description: 'Precio del producto en euros',
              example: 49.99
            },
            descripcion: {
              type: 'string',
              description: 'Descripción del producto',
              example: 'Descripción del nuevo producto'
            },
            imagen: {
              type: 'string',
              description: 'URL de la imagen del producto',
              example: 'https://example.com/nueva-imagen.jpg'
            },
            categoria: {
              type: 'string',
              description: 'Categoría del producto',
              example: 'Electrónica'
            }
          }
        },
        ProductoPrecio: {
          type: 'object',
          required: ['precio'],
          properties: {
            precio: {
              type: 'number',
              description: 'Nuevo precio del producto en euros',
              example: 39.99
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error',
              example: 'Producto no encontrado'
            }
          }
        },
        PaginacionResponse: {
          type: 'object',
          properties: {
            productos: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Producto'
              }
            },
            totalProductos: {
              type: 'number',
              description: 'Número total de productos',
              example: 100
            },
            paginaActual: {
              type: 'number',
              description: 'Página actual',
              example: 1
            },
            totalPaginas: {
              type: 'number',
              description: 'Número total de páginas',
              example: 10
            },
            productosPorPagina: {
              type: 'number',
              description: 'Productos por página',
              example: 10
            }
          }
        }
      },
      parameters: {
        productId: {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'ID único del producto'
        },
        page: {
          name: 'page',
          in: 'query',
          schema: {
            type: 'integer',
            default: 1,
            minimum: 1
          },
          description: 'Número de página para la paginación'
        },
        limit: {
          name: 'limit',
          in: 'query',
          schema: {
            type: 'integer',
            default: 10,
            minimum: 1,
            maximum: 100
          },
          description: 'Número de productos por página'
        }
      },
      responses: {
        NotFound: {
          description: 'Producto no encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        BadRequest: {
          description: 'Solicitud incorrecta',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ServerError: {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js'] // Archivos donde buscar anotaciones
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
