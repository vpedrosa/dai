// ./components/Resultados.jsx
import { useState, useEffect } from "react"
import useSWR from "swr"

// Fetcher para SWR
const fetcher = (url) => fetch(url).then((res) => res.json())

// URL base del API (en producción usa ruta relativa, en desarrollo usa localhost:8000)
const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:8000'

// Tiempo mínimo de visualización del spinner (ms)
const MIN_LOADING_TIME = 300

// Componente Spinner para la carga
function Spinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
    </div>
  )
}

// Componente Tarjeta de producto
function TarjetaProducto({ producto }) {
  return (
    <div className="max-w-sm rounded overflow-hidden w-64 bg-white hover:shadow-lg transition-shadow">
      <img
        className="w-10/12 h-48 object-contain mx-auto mt-4 bg-gray-50"
        src={producto.imageUrl}
        alt={producto.text1}
      />
      <div className="px-6 py-4">
        <div className="mb-2 text-sm font-medium text-gray-800">{producto.text1}</div>
        <div className="text-xs text-gray-500 mb-2">{producto.text2}</div>
        <div className="text-xs text-green-600 mb-2">{producto.category}</div>
        {/* Precio */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-gray-900">
            {producto.priceEuros?.toFixed(2).replace('.', ',')}€
          </span>
          <span className="text-sm text-gray-500">{producto.priceText}</span>
        </div>
      </div>
      <div className="px-6 pb-4 text-center">
        <button className="w-full rounded-full px-4 py-2 text-sm text-green-700 border-2 border-green-600 hover:bg-green-50 transition-colors font-medium">
          Añadir al carrito
        </button>
      </div>
    </div>
  )
}

export default function Resultados({ de }) {
  const [showSpinner, setShowSpinner] = useState(false)
  const [loadingStartTime, setLoadingStartTime] = useState(null)

  // Hook de SWR para obtener los datos (siempre se llama, pero con key null si < 3 chars)
  const { data, error, isLoading } = useSWR(
    de.length >= 3 ? `${API_BASE}/api/busqueda-anticipada/${de}` : null,
    fetcher
  )

  // Efecto para manejar el tiempo mínimo del spinner
  useEffect(() => {
    if (isLoading) {
      setShowSpinner(true)
      setLoadingStartTime(Date.now())
    } else if (loadingStartTime) {
      const elapsed = Date.now() - loadingStartTime
      const remaining = MIN_LOADING_TIME - elapsed
      if (remaining > 0) {
        const timer = setTimeout(() => setShowSpinner(false), remaining)
        return () => clearTimeout(timer)
      } else {
        setShowSpinner(false)
      }
    }
  }, [isLoading])

  // Si hay menos de 3 caracteres, mostrar mensaje inicial
  if (de.length < 3) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <p className="text-gray-600 text-lg">Escribe al menos 3 caracteres para buscar</p>
          <p className="text-gray-400">Los resultados aparecerán automáticamente</p>
        </div>
      </main>
    )
  }

  // Función para renderizar los productos
  const ponProductos = (productos) => {
    if (!productos || productos.length === 0) {
      return (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-gray-500 text-lg">No se encontraron productos</p>
          <p className="text-gray-400">Intenta con otros términos de búsqueda</p>
        </div>
      )
    }

    return (
      <>
        <div className="text-center text-gray-600 mb-6">
          Se encontraron <span className="font-bold text-green-600">{productos.length}</span> productos
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {productos.map((producto) => (
            <TarjetaProducto key={producto._id} producto={producto} />
          ))}
        </div>
      </>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {showSpinner || isLoading ? (
        <Spinner />
      ) : data ? (
        ponProductos(data)
      ) : error ? (
        <div className="text-center text-red-500 py-12">
          Error al cargar los productos: {error.message}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">...</div>
      )}
    </main>
  )
}
