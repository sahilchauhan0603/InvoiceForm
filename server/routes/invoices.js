// routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Invoice = require('../models/Invoice');
const { authenticateUser } = require('../middleware/authMiddleware');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});


// Get all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new invoice
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      companyName,
      amountPaid,
      status,
      pendingAmount,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const totalAmount =
      status === 'pending'
        ? parseFloat(amountPaid) + parseFloat(pendingAmount || 0)
        : parseFloat(amountPaid);

    const invoice = new Invoice({
      name,
      mobile,
      email,
      companyName,
      amountPaid: parseFloat(amountPaid),
      status,
      pendingAmount: status === 'pending' ? parseFloat(pendingAmount) : 0,
      totalAmount,
      file: req.file.path,
      fileType: req.file.mimetype,
    });

    await invoice.save();

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice,
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single invoice
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this invoice' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete invoice
router.delete('/', authenticateUser, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const invoice = await Invoice.findOne({ email, userId: req.user.userId });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found for this email' });
    }

    if (invoice.status === 'pending') {
      return res.status(400).json({ message: 'Pending invoices cannot be deleted' });
    }

    await Invoice.findOneAndDelete({ email, userId: req.user.userId });
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Pay invoice
router.post('/pay', authenticateUser, async (req, res) => {
  try {
    const { email, amount } = req.body;

    const invoice = await Invoice.findOne({ email, userId: req.user.userId });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending invoices can be paid' });
    }

    invoice.amountPaid += parseFloat(amount);

    if (invoice.amountPaid >= invoice.totalAmount) {
      invoice.status = 'paid';
    }

    await invoice.save();
    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;