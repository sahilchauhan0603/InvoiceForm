import React, { useState, useEffect } from 'react';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/invoice`);
        setInvoices(response.data);
      } catch (err) {
        setError('Failed to fetch invoices');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  if (loading) return <div className="text-center py-8">Loading invoices...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Invoice Records</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 border-b text-left">Name</th>
              <th className="py-3 px-4 border-b text-left">Company</th>
              <th className="py-3 px-4 border-b text-left">Amount Paid</th>
              <th className="py-3 px-4 border-b text-left">Status</th>
              <th className="py-3 px-4 border-b text-left">Date</th>
              <th className="py-3 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice._id} className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b">{invoice.name}</td>
                <td className="py-3 px-4 border-b">{invoice.companyName}</td>
                <td className="py-3 px-4 border-b">₹{invoice.amountPaid.toFixed(2)}</td>
                <td className="py-3 px-4 border-b">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    invoice.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="py-3 px-4 border-b">
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 border-b">
                  <button 
                    onClick={() => window.open(`${backendUrl}/${invoice.file}`, '_blank')}
                    className="text-blue-600 hover:underline"
                  >
                    View Invoice
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceList;