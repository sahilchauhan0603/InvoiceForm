const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    validate: {
      validator: function(v) {
        return /^[0-9]{10,15}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  amountPaid: {
    type: Number,
    required: [true, 'Paid amount is required'],
    min: [0, 'Amount paid cannot be negative']
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending'
  },
  pendingAmount: {
    type: Number,
    default: 0,
    min: [0, 'Pending amount cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  file: {
    type: String,
    required: [true, 'File path is required']
  },
  fileType: {
    type: String,
    enum: ['image/jpeg', 'image/png', 'application/pdf']
  },
  paymentDate: Date,
  dueDate: Date,
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for remaining amount
InvoiceSchema.virtual('remainingAmount').get(function() {
  return this.totalAmount - this.amountPaid;
});

// Pre-save validation
InvoiceSchema.pre('save', function(next) {
  // Auto-calculate total if not set
  if (!this.totalAmount) {
    this.totalAmount = this.amountPaid + this.pendingAmount;
  }

  // Clear pending amount if status is paid
  if (this.status === 'paid') {
    this.pendingAmount = 0;
    this.paymentDate = new Date();
  }

  // Set due date if pending and not set
  if (this.status === 'pending' && !this.dueDate) {
    this.dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  }

  next();
});

// Indexes
InvoiceSchema.index({ userId: 1 });
InvoiceSchema.index({ email: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ createdAt: -1 });

// Static methods
InvoiceSchema.statics.findByUser = function(userId, adminOverride = false) {
  if (adminOverride) {
    return this.find();
  }
  return this.find({ userId });
};

module.exports = mongoose.model('Invoice', InvoiceSchema);