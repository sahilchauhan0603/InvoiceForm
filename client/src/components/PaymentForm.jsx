import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentForm = ({ invoice, onSubmit, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const remainingAmount = invoice.totalAmount - invoice.amountPaid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    
    if (paymentAmount > 0 && paymentAmount <= remainingAmount) {
      setIsSubmitting(true);
      try {
        await onSubmit(paymentAmount);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
            <h3 className="text-2xl font-bold">Payment Processing</h3>
            <p className="opacity-90">Complete payment for {invoice.name}'s invoice</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-600 font-medium mb-1">Total</p>
                <p className="text-lg font-bold">₹{invoice.totalAmount.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-green-600 font-medium mb-1">Paid</p>
                <p className="text-lg font-bold">₹{invoice.amountPaid.toFixed(2)}</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg">
                <p className="text-xs text-amber-600 font-medium mb-1">Due</p>
                <p className="text-lg font-bold">₹{remainingAmount.toFixed(2)}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    max={remainingAmount}
                    step="0.01"
                    placeholder={`0.00 - ${remainingAmount.toFixed(2)}`}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <div className="absolute right-2 top-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Max: ₹{remainingAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !amount}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
                >
                  {isSubmitting ? (
                    <>
                      <span className="opacity-0">Submit Payment</span>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </>
                  ) : (
                    "Submit Payment"
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Payments are processed securely
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentForm;