// src/components/NavBar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import logo from '../assets/logo_ALS.png';

export function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/logistica/home" className="flex items-center">
              <img src={logo} alt="Logo" className="h-12" />
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Enlaces basados en el rol del usuario */}
            {user.role !== 'contable' && (
              <Link
                to="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                Pedidos
              </Link>
            )}

            {/* Mostrar enlace a Facturas para todos los roles */}
            <Link
              to="/logistica/facturas"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Facturas
            </Link>

            {user.role === 'admin' && (
              <>
                {/* Agregar enlace a Clientes - visible solo para administradores */}
                <Link
                  to="/logistica/clientes"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Clientes
                </Link>
                <Link
                  to="/logistica/crear-envio"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Crear Envío
                </Link>
                <Link
                  to="/logistica/usuarios"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Usuarios
                </Link>
              </>
            )}

            <div className="pl-4 border-l border-gray-200 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {user.name}
                  {/* Mostrar el rol del usuario junto a su nombre */}
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    {user.role === 'transportista' ? '(Transportista)' : user.role === 'contable' ? '(Contable)' : '(Admin)'}
                  </span>
                </span>
              </div>

              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}