import React, { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const InvoiceForm = () => {
  const fileInputRef = useRef();
  const [filePreviewURL, setFilePreviewURL] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    companyName: '',
    amountPaid: '',
    status: '',
    pendingAmount: '',
    file: null,
  });

  const totalAmount = useMemo(() => {
    const paid = parseFloat(formData.amountPaid) || 0;
    const pending = formData.status === 'pending' 
      ? parseFloat(formData.pendingAmount) || 0 
      : 0;
    return paid + pending;
  }, [formData.amountPaid, formData.pendingAmount, formData.status]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setFormData(prev => ({
      ...prev,
      status: newStatus,
      pendingAmount: newStatus === 'pending' ? prev.pendingAmount : ''
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFormData(prev => ({ ...prev, file: selectedFile }));
      const preview = URL.createObjectURL(selectedFile);
      setFilePreviewURL(preview);
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, file: null }));
    setFilePreviewURL(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  useEffect(() => {
    return () => {
      if (filePreviewURL) {
        URL.revokeObjectURL(filePreviewURL);
      }
    };
  }, [filePreviewURL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    
    if (!formData.file) {
      alert('Please upload an invoice file');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('mobile', formData.mobile);
    data.append('email', formData.email);
    data.append('companyName', formData.companyName);
    data.append('amountPaid', formData.amountPaid);
    data.append('status', formData.status);
    data.append('pendingAmount', formData.status === 'pending' ? formData.pendingAmount : '0');
    data.append('file', formData.file);
  
    try {
      await axios.post(`${backendUrl}/api/invoice`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      alert('Invoice submitted successfully!');
      setFormData({
        name: '',
        mobile: '',
        email: '',
        companyName: '',
        amountPaid: '',
        status: '',
        pendingAmount: '',
        file: null,
      });
      setFilePreviewURL(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      alert(`Error submitting form: ${err.response?.data?.message || err.message}`);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md space-y-4">
        <h2 className="text-center text-2xl font-bold mb-4">Invoice Upload Form</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile No</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              placeholder="Enter mobile number"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              placeholder="Enter company name"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700 mb-1">Amount Paid</label>
            <input
              type="number"
              id="amountPaid"
              name="amountPaid"
              placeholder="Enter amount paid"
              value={formData.amountPaid}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              value={formData.status}
              onChange={handleStatusChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="" disabled>Select Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {formData.status === 'pending' && (
            <div>
              <label htmlFor="pendingAmount" className="block text-sm font-medium text-gray-700 mb-1">Amount Pending</label>
              <input
                type="number"
                id="pendingAmount"
                name="pendingAmount"
                placeholder="Enter pending amount"
                value={formData.pendingAmount}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required={formData.status === 'pending'}
                min="0"
                step="0.01"
              />
            </div>
          )}

          {(formData.amountPaid || (formData.status === 'pending' && formData.pendingAmount)) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100">
                ₹ {totalAmount.toFixed(2)}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Invoice File (PDF, JPG, PNG)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    {formData.file ? formData.file.name : "PDF, JPG, or PNG (MAX. 5MB)"}
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  required
                />
              </label>
            </div>
          </div>

          {filePreviewURL && formData.file && (
            <div className="mt-4 text-center">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              {formData.file.type === "application/pdf" ? (
                <iframe
                  src={filePreviewURL}
                  title="Invoice Preview"
                  className="w-full h-64 border border-gray-300 rounded-md"
                />
              ) : (
                <img
                  src={filePreviewURL}
                  alt="Invoice Preview"
                  className="w-full max-h-64 object-contain border border-gray-300 rounded-md"
                />
              )}
              <button
                type="button"
                onClick={removeFile}
                className="mt-2 px-3 py-1 text-sm text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Remove File
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            disabled={!formData.file}
          >
            Submit Invoice
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;