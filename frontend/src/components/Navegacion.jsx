// ./components/Navegacion.jsx
import { useState } from "react"

export default function Navegacion({ onInput }) {
  const [valor, setValor] = useState('')

  const handleChange = (evt) => {
    setValor(evt.target.value)
    onInput(evt)
  }

  const limpiar = () => {
    setValor('')
    onInput({ target: { value: '' } })
  }

  return (
    <>
      {/* Header estilo Mercadona */}
      <header className="bg-green-600 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="http://localhost:8000" className="text-white text-2xl font-bold">
              Tienda Online
            </a>
            <a href="http://localhost:8000/productos" className="text-white hover:text-green-200">
              Ver todos los productos
            </a>
          </div>
        </div>
      </header>

      {/* Barra de búsqueda */}
      <section className="bg-white shadow-sm py-6">
        <div className="max-w-3xl mx-auto px-4">
          <div className="relative">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-3 border-2 border-transparent focus-within:border-green-500 focus-within:bg-white transition-all">
              {/* Icono de lupa */}
              <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input
                type="text"
                value={valor}
                onChange={handleChange}
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-500"
                placeholder="Buscar en Tienda Online..."
                autoComplete="off"
              />
              {/* Botón limpiar */}
              {valor.length > 0 && (
                <button
                  onClick={limpiar}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                  type="button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
