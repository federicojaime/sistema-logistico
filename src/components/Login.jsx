// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo_ALS.png';
import fondo from '../assets/fondo.jpg';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Iniciando intento de login...');
      console.log('URL de la API:', import.meta.env.VITE_API_URL);
      console.log('Datos de login:', { email });

      const success = await login(email, password);
      console.log('Respuesta del login:', success);

      if (success) {
        navigate('/logistica/home');
      } else {
        setError('Credenciales inválidas');
      }
    } catch (err) {
      console.error('Error completo:', err);
      console.error('Tipo de error:', err.name);
      console.error('Mensaje de error:', err.message);

      if (err.response) {
        console.error('Datos de la respuesta:', err.response.data);
        console.error('Estado HTTP:', err.response.status);
        console.error('Headers:', err.response.headers);
      } else if (err.request) {
        console.error('La solicitud fue hecha pero no se recibió respuesta');
        console.error('Detalles de la solicitud:', err.request);
      }

      setError('No se pudo conectar con el servidor. Verifique su conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 z-0">
        <img
          src={fondo}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-sm"></div>
      </div>

      {/* Contenedor del login */}
      <div className="relative z-10 w-full max-w-lg mx-4">
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <img
              src={logo}
              alt="ALS Logo"
              className="h-16 w-auto mb-6"
            />
            <h2 className="text-2xl font-bold text-gray-900">
              Portal Corporativo
            </h2>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="correo@ejemplo.com"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}