// App.jsx
import { useState } from "react"
import Navegacion from "./components/Navegacion"
import Resultados from "./components/Resultados"

function App() {

  const [busqueda, setBusqueda] = useState('')

  const handleInput = (evt) => {
    const value = evt.target.value
    console.log(value)
    setBusqueda(value)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navegacion onInput={handleInput} />
      <Resultados de={busqueda} />
    </div>
  )
}

export default App
