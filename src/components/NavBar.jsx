// src/components/NavBar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LogOut, 
  User, 
  BarChart2, 
  Menu, 
  X, 
  Home,
  Plus,
  Users,
  FileText
} from 'lucide-react';
import logo from '../assets/logo_ALS.png';

export function NavBar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Comprobar si la ruta actual coincide con la proporcionada
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Obtener elementos de navegación según el rol
  const getNavItems = () => {
    const items = [];

    // Común para todos
    items.push({
      path: "/logistica/home",
      label: "Inicio",
      icon: <Home className="w-5 h-5" />,
      roles: ['admin', 'transportista', 'contable']
    });

    // Específico para admin
    if (user.role === 'admin') {
      items.push(
        {
          path: "/logistica/crear-envio",
          label: "Crear Envío",
          icon: <Plus className="w-5 h-5" />,
          primary: true
        },
        {
          path: "/logistica/clientes",
          label: "Clientes",
          icon: <Users className="w-5 h-5" />
        },
        {
          path: "/logistica/facturas",
          label: "Facturas",
          icon: <FileText className="w-5 h-5" />
        },
        {
          path: "/logistica/estadisticas",
          label: "Estadísticas",
          icon: <BarChart2 className="w-5 h-5" />
        },
        {
          path: "/logistica/usuarios",
          label: "Usuarios",
          icon: <User className="w-5 h-5" />
        }
      );
    }

    // Específico para contable
    if (user.role === 'contable') {
      items.push(
        {
          path: "/logistica/envios-finalizados",
          label: "Envíos Finalizados",
          icon: <FileText className="w-5 h-5" />
        },
        {
          path: "/logistica/facturas",
          label: "Facturas",
          icon: <FileText className="w-5 h-5" />
        }
      );
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Barra superior roja */}
      <div className="bg-red-600 h-2 w-full"></div>

      {/* Navbar principal */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/logistica/home" className="flex items-center">
                <img src={logo} alt="ALS Logo" className="h-10" />
              </Link>
            </div>

            {/* Navegación de escritorio */}
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    ${item.primary 
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : isActive(item.path)
                        ? 'text-blue-600 font-medium' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                    px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Sección de perfil de usuario */}
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-3">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-500" />
                <div className="ml-2">
                  <div className="text-sm font-medium text-gray-700">{user.name}</div>
                  <div className="text-xs text-gray-400">{user.role === 'admin' ? 'Admin' : (user.role === 'contable' ? 'Contable' : 'Transportista')}</div>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
              >
                <span>Salir</span>
              </button>
            </div>

            {/* Botón de menú móvil */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              >
                <span className="sr-only">Abrir menú</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden border-t border-gray-200`}>
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  ${item.primary 
                    ? 'bg-blue-600 text-white'
                    : isActive(item.path)
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                  block px-3 py-2 text-base font-medium flex items-center space-x-3
                `}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          
          {/* Perfil móvil */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user.name}</div>
                <div className="text-sm font-medium text-gray-500">{user.role === 'admin' ? 'Admin' : (user.role === 'contable' ? 'Contable' : 'Transportista')}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-gray-100"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}