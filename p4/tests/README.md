# Tests de la API RESTful

Este directorio contiene los tests automatizados para la API RESTful de la tienda online.

## Tecnologías

- **Jest**: Framework de testing
- **Supertest**: Librería para testing de APIs HTTP
- **Mongoose**: Para interactuar con MongoDB en los tests

## Estructura de Tests

### `api.test.js`

Tests completos para todos los endpoints de la API RESTful:

#### GET /api/productos
- ✅ Devuelve productos paginados
- ✅ Respeta parámetros de paginación
- ✅ Filtra por categoría

#### POST /api/productos
- ✅ Crea producto con datos válidos
- ✅ Rechaza producto sin nombre
- ✅ Rechaza producto sin precio
- ✅ Rechaza precio negativo
- ✅ Rechaza precio no numérico

#### GET /api/productos/:id
- ✅ Obtiene producto por ID válido
- ✅ Devuelve 404 para ID inexistente
- ✅ Devuelve 400 para ID inválido

#### PUT /api/productos/:id
- ✅ Actualiza precio correctamente
- ✅ Rechaza precio inválido
- ✅ Rechaza precio negativo
- ✅ Devuelve 404 para ID inexistente
- ✅ Devuelve 400 para ID inválido

#### DELETE /api/productos/:id
- ✅ Elimina producto existente
- ✅ Devuelve 404 para ID inexistente
- ✅ Devuelve 400 para ID inválido

#### Flujo CRUD completo
- ✅ Ejecuta ciclo completo: CREATE → READ → UPDATE → DELETE

## Ejecutar los Tests

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar tests en modo watch (desarrollo)
```bash
npm run test:watch
```

### Ejecutar tests con coverage
```bash
npm run test:coverage
```

## Requisitos Previos

1. **MongoDB debe estar ejecutándose**
   ```bash
   docker-compose up -d
   ```

2. **Variables de entorno configuradas**
   - Asegúrate de que `.env` existe con las configuraciones necesarias
   - El archivo `.env.example` contiene las variables requeridas

3. **Base de datos poblada (recomendado)**
   ```bash
   npm run seed
   ```

## Configuración

La configuración de Jest se encuentra en `jest.config.js`:

```javascript
{
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'routes/**/*.js',
    'model/**/*.js'
  ]
}
```

## Coverage

El coverage report se genera en el directorio `coverage/`:

- `coverage/lcov-report/index.html` - Reporte HTML interactivo
- `coverage/coverage-final.json` - Datos de coverage en JSON

**Abrir reporte de coverage:**
```bash
npm run test:coverage
open coverage/lcov-report/index.html  # macOS
xdg-open coverage/lcov-report/index.html  # Linux
start coverage/lcov-report/index.html  # Windows
```

## Notas Importantes

### Conexión a la Base de Datos

Los tests se conectan a la misma base de datos configurada en `.env`.

**⚠️ Advertencia:** Los tests crean y eliminan productos reales en la BD. Se recomienda usar una base de datos de test separada.

Para usar una BD de test diferente, puedes:

1. Crear un archivo `.env.test`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/tienda_test
   SECRET_KEY=tu-secret-key-test
   ```

2. Modificar el script de test en `package.json`:
   ```json
   "test": "node --env-file=.env.test --experimental-vm-modules node_modules/jest/bin/jest.js"
   ```

### Limpieza Automática

Los tests se encargan de:
- ✅ Limpiar los productos creados durante las pruebas
- ✅ Cerrar la conexión a MongoDB después de finalizar
- ✅ Resetear mocks entre tests

### Productos de Prueba

Los tests crean productos con la categoría "Test" para facilitar su identificación:
- `Producto Test Jest`
- `Producto para GET`
- `Producto para PUT`
- `Producto para DELETE`
- `Producto CRUD Completo`

## Troubleshooting

### Error: Cannot find module

Si ves errores de importación, asegúrate de:
1. Ejecutar `npm install`
2. Usar Node.js >= 18
3. Verificar que `"type": "module"` está en `package.json`

### Tests timeout

Si los tests tardan mucho o dan timeout:
1. Verifica que MongoDB está corriendo
2. Verifica la conexión en `.env`
3. Aumenta el timeout en Jest si es necesario

### Error de conexión a MongoDB

```bash
# Verificar que MongoDB está corriendo
docker-compose ps

# Reiniciar MongoDB
docker-compose restart mongodb
```

## Añadir Nuevos Tests

Para añadir nuevos tests:

1. Crea un nuevo archivo `*.test.js` en `tests/`
2. Importa las dependencias necesarias:
   ```javascript
   import request from 'supertest';
   import app from '../app.js';
   ```
3. Organiza los tests con `describe` y `test`
4. Usa `beforeAll` y `afterAll` para setup/cleanup

## Ejemplo de Test Personalizado

```javascript
describe('Mi nuevo endpoint', () => {
  test('debe hacer algo específico', async () => {
    const res = await request(app)
      .get('/mi-endpoint')
      .expect(200);

    expect(res.body).toHaveProperty('data');
  });
});
```
