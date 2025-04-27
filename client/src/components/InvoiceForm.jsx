import React, { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
// const backendUrl = 'http://localhost:5000';

const InvoiceForm = () => {
  const fileInputRef = useRef();
  const [filePreviewURL, setFilePreviewURL] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setIsSubmitting(true);
      await axios.post(`${backendUrl}/api/invoice`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Success state
      setIsSubmitting(false);
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
      setIsSubmitting(false);
      alert(`Error submitting form: ${err.response?.data?.message || err.message}`);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        <form 
          onSubmit={handleSubmit} 
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white text-center">
            <h2 className="text-2xl font-bold">Invoice Submission</h2>
            <p className="opacity-90">Fill in the details to upload a new invoice</p>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              {/* Mobile */}
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  placeholder="+91 9876543210"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              {/* Company */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  placeholder="Acme Inc."
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              {/* Amount Paid */}
              <div>
                <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount Paid (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    id="amountPaid"
                    name="amountPaid"
                    placeholder="0.00"
                    value={formData.amountPaid}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={handleStatusChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                >
                  <option value="" disabled>Select Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Pending Amount (conditional) */}
              {formData.status === 'pending' && (
                <div>
                  <label htmlFor="pendingAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Pending Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      id="pendingAmount"
                      name="pendingAmount"
                      placeholder="0.00"
                      value={formData.pendingAmount}
                      onChange={handleChange}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required={formData.status === 'pending'}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}

              {/* Total Amount (calculated) */}
              {(formData.amountPaid || (formData.status === 'pending' && formData.pendingAmount)) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount (₹)
                  </label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-medium">
                    ₹ {totalAmount.toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice File (PDF, JPG, PNG) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-10 h-10 mb-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      {formData.file ? formData.file.name : "PDF, JPG, or PNG (MAX. 10MB)"}
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

            {/* File Preview */}
            {filePreviewURL && formData.file && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 overflow-hidden"
              >
                <p className="text-sm font-medium text-gray-700 mb-2">File Preview:</p>
                <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
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
                      className="w-full max-h-64 object-contain mx-auto"
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="mt-2 px-3 py-1 text-sm text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                >
                  Remove File
                </button>
              </motion.div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !formData.file}
                className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all ${isSubmitting || !formData.file ? 'opacity-70 cursor-not-allowed' : 'hover:from-blue-700 hover:to-blue-600 shadow-md'}`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  'Submit Invoice'
                )}
              </button>
            </div>
          </div>

          {/* Form Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              All invoices are securely stored and processed
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default InvoiceForm;