import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

// Componentes
import { Login } from './components/Login';
import { ShipmentList } from './components/ShipmentList';
import { CreateShipment } from './components/CreateShipment';
import { UserManagement } from './components/UserManagement';
import { Invoices } from './components/Invoices';
import { NavBar } from './components/NavBar';
import { ClientList } from './components/ClientList';

// Contextos
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ShipmentsProvider } from './contexts/ShipmentsContext';

// Ruta privada
const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/logistica/login" replace />;
  }

  // Si hay roles permitidos especificados y el usuario no tiene uno de ellos
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirigir a una página permitida según su rol
    if (user.role === 'transportista') {
      return <Navigate to="/logistica/home" replace />;
    } else if (user.role === 'contable') {
      return <Navigate to="/logistica/facturas" replace />;
    } else {
      return <Navigate to="/logistica/home" replace />;
    }
  }

  return (
    <>
      <NavBar />
      <ShipmentsProvider>
        {children}
      </ShipmentsProvider>
    </>
  );
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/logistica/login" element={<Login />} />
        <Route
          path="/logistica/home"
          element={
            <PrivateRoute allowedRoles={['admin', 'transportista']}>
              <ShipmentList />
            </PrivateRoute>
          }
        />
        <Route
          path="/logistica/clientes"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <ClientList />
            </PrivateRoute>
          }
        />
        <Route
          path="/logistica/crear-envio"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <CreateShipment />
            </PrivateRoute>
          }
        />
        <Route
          path="/logistica/usuarios"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <UserManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/logistica/facturas"
          element={
            <PrivateRoute allowedRoles={['admin', 'contable']}>
              <Invoices />
            </PrivateRoute>
          }
        />
        <Route path="/logistica" element={<Navigate to="/logistica/home" replace />} />
        <Route path="/" element={<Navigate to="/logistica/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}