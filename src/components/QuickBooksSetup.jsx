// src/components/QuickBooksSetup.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuickBooksService from '../services/quickbooksService';

const qbService = new QuickBooksService();

export function QuickBooksSetup() {
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        setIsConnected(qbService.isConnected());

        const handleCallback = async () => {
            const params = new URLSearchParams(location.search);
            const code = params.get('code');
            const state = params.get('state');
            const savedState = localStorage.getItem('qb_auth_state');

            if (code && state) {
                if (state !== savedState) {
                    setError('Error de validación de estado OAuth');
                    return;
                }

                setLoading(true);
                try {
                    await qbService.exchangeCodeForTokens(code);
                    setIsConnected(true);
                    navigate('/facturas');
                } catch (err) {
                    setError(`Error al conectar con QuickBooks: ${err.message}`);
                } finally {
                    setLoading(false);
                    localStorage.removeItem('qb_auth_state');
                }
            }
        };

        if (location.pathname.includes('/quickbooks/callback')) {
            handleCallback();
        }
    }, [location, navigate]);

    const handleConnect = () => {
        setLoading(true);
        try {
            const authUrl = qbService.getAuthorizationUrl();
            window.location.href = authUrl;
        } catch (err) {
            setError(`Error al iniciar la conexión con QuickBooks: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = () => {
        try {
            qbService.disconnect();
            setIsConnected(false);
        } catch (err) {
            setError(`Error al desconectar de QuickBooks: ${err.message}`);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Conexión con QuickBooks</h3>
                    <p className="text-sm text-gray-500">
                        {isConnected 
                            ? 'Tu cuenta está conectada con QuickBooks' 
                            : 'Conecta tu cuenta de QuickBooks para sincronizar facturas'}
                    </p>
                </div>
                <div className="flex items-center">
                    {isConnected ? (
                        <>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                                Conectado
                            </span>
                            <button
                                onClick={handleDisconnect}
                                className="text-sm text-gray-600 hover:text-gray-900"
                                disabled={loading}
                            >
                                Desconectar
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleConnect}
                            disabled={loading}
                            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                                ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {loading ? 'Conectando...' : 'Conectar con QuickBooks'}
                        </button>
                    )}
                </div>
            </div>

            {isConnected && (
                <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Estado de la Sincronización</h4>
                    <p className="text-sm text-gray-600">
                        Conexión activa con QuickBooks
                    </p>
                </div>
            )}
        </div>
    );
}