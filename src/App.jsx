import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { ShipmentList } from './components/ShipmentList';
import { CreateShipment } from './components/CreateShipment';
import { Invoices } from './components/Invoices';
import { QuickBooksSetup } from './components/QuickBooksSetup';
import { ShipmentsProvider } from './contexts/ShipmentsContext';

export default function App() {
  return (
    <ShipmentsProvider>
      <Router basename="/logistica/">
        <div className="min-h-screen bg-gray-50">
          <NavBar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<ShipmentList />} />
              <Route path="/crear-envio" element={<CreateShipment />} />
              <Route path="/facturas" element={<Invoices />} />
              <Route path="/quickbooks/callback" element={<QuickBooksSetup />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ShipmentsProvider>
  );
}
