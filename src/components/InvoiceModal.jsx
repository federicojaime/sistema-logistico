import React, { useRef } from 'react';
import { X, Download } from 'lucide-react';
import logo from '../assets/logo_ALS.png';

const InvoiceModal = ({ shipment, onClose }) => {
  const invoiceRef = useRef(null);
  const currentDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(currentDate.getDate() + 30);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const handleDownloadPDF = () => {
    const element = invoiceRef.current;
    const opt = {
      margin: 0.5,
      filename: `invoice-${shipment.ref}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    if (window.html2pdf) {
      window.html2pdf().set(opt).from(element).save();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </button>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div ref={invoiceRef} className="p-8 bg-white max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">INVOICE</h1>
              <div className="mt-2 space-y-0.5 text-sm">
                <p>All Logistics Services, Inc</p>
                <p>8600 NW S. River drive #223</p>
                <p>Miami, FL 33166</p>
                <p>info@serviceals.com</p>
                <p>+1 (305) 345-1128</p>
              </div>
            </div>
            <div>
              <img src={logo} alt="ALS Logo" className="h-12" />
              <p className="text-sm mt-1">Logistic & Trading Solution</p>
            </div>
          </div>

          {/* Bill/Ship Section */}
          <div className="mt-16 bg-blue-50/30 py-6 px-8">
            <div className="grid grid-cols-2 gap-32">
              <div>
                <h2 className="text-gray-700 mb-2">Bill to</h2>
                <p className="text-sm">{shipment.name}</p>
                <p className="text-sm">{shipment.customer}</p>
              </div>
              <div>
                <h2 className="text-gray-700 mb-2">Ship to</h2>
                <p className="text-sm">{shipment.name}</p>
                <p className="text-sm">{shipment.customer}</p>
              </div>
            </div>
          </div>

          {/* Divider line */}
          <div className="my-8 border-t border-gray-200"></div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2">
            <div>
              <h2 className="text-gray-700 mb-2">Invoice details</h2>
              <div className="space-y-0.5 text-sm">
                <p>Invoice no.: {shipment.ref}</p>
                <p>Terms: Net 30</p>
                <p>Invoice date: {formatDate(currentDate)}</p>
                <p>Due date: {formatDate(dueDate)}</p>
              </div>
            </div>
            <div className="text-sm">
              <p className="mt-8">PO#: {shipment.ref}</p>
            </div>
          </div>

          {/* Table */}
          <div className="mt-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-b border-gray-200">
                  <th className="py-2 text-left">#</th>
                  <th className="py-2 text-left">Date</th>
                  <th className="py-2 text-left">Product or service</th>
                  <th className="py-2 text-left">Description</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Rate</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-3">1</td>
                  <td className="py-3">{formatDate(currentDate)}</td>
                  <td className="py-3">Local Cartage</td>
                  <td className="py-3">{`${shipment.pickup} to ${shipment.delivery} cnt# ${shipment.container || ''}`}</td>
                  <td className="py-3 text-right">1</td>
                  <td className="py-3 text-right">${(450).toFixed(2)}</td>
                  <td className="py-3 text-right">${(450).toFixed(2)}</td>
                </tr>
                {shipment.lg === 'YES' && (
                  <tr className="border-b border-gray-200">
                    <td className="py-3">2</td>
                    <td className="py-3">{formatDate(currentDate)}</td>
                    <td className="py-3">Chassis Fee</td>
                    <td className="py-3">2 days, charged 1</td>
                    <td className="py-3 text-right">1</td>
                    <td className="py-3 text-right">$35.00</td>
                    <td className="py-3 text-right">$35.00</td>
                  </tr>
                )}
                {shipment.extra === 'YES' && (
                  <tr className="border-b border-gray-200">
                    <td className="py-3">3</td>
                    <td className="py-3">{formatDate(currentDate)}</td>
                    <td className="py-3">HAZMAT</td>
                    <td className="py-3">fee</td>
                    <td className="py-3 text-right">1</td>
                    <td className="py-3 text-right">$100.00</td>
                    <td className="py-3 text-right">$100.00</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="6" className="py-4 text-right">Total</td>
                  <td className="py-4 text-right font-medium text-lg">
                    ${(450 + (shipment.lg === 'YES' ? 35 : 0) + (shipment.extra === 'YES' ? 100 : 0)).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;