// src/components/NavBar.jsx
import { Link } from 'react-router-dom'
import logo from '../assets/logo_ALS.png' // Ajusta la ruta según donde tengas tu imagen

export function NavBar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="Logo"
                className="h-12" // Ajusta el tamaño según necesites
              />
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Pedidos
            </Link>
            <Link
              to="/crear-envio"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Crear Envío
            </Link>
            <Link
              to="/facturas"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Facturas
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}