const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  amountPaid: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['paid', 'pending'],
    required: true,
  },
  pendingAmount: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  file: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ['image/jpeg', 'image/png', 'application/pdf'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Invoice', InvoiceSchema);