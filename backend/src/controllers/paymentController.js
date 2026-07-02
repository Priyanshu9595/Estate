const Payment = require('../models/Payment');
const Rent = require('../models/Rent');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// @desc    Record a payment
// @route   POST /api/payments
// @access  Private (Admin)
const recordPayment = async (req, res) => {
  try {
    const { rent_id, amount, mode, transaction_ref, notes } = req.body;

    const rent = await Rent.findById(rent_id);
    if (!rent) return res.status(404).json({ message: 'Rent record not found' });

    const payment = await Payment.create({
      rent_id,
      amount,
      mode,
      transaction_ref,
      notes,
    });

    // Update Rent record
    const newPaidAmount = rent.paid_amount + Number(amount);
    const newDueAmount = rent.rent_amount + rent.charges - newPaidAmount;
    
    let newStatus = 'Pending';
    if (newDueAmount <= 0) {
      newStatus = 'Paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'Partial';
    }

    await Rent.findByIdAndUpdate(rent_id, {
      paid_amount: newPaidAmount,
      due_amount: newDueAmount,
      status: newStatus,
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private (User)
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'YOUR_TEST_KEY_HERE') {
      return res.status(500).json({ message: 'Razorpay keys are missing in backend/.env' });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `rcptid_${Math.random().toString(36).substr(2, 6)}`
    };

    const order = await instance.orders.create(options);
    res.status(200).json({ ...order, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create Razorpay order', error: error.message });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/verify
// @access  Private (User)
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const expectedSignature = hmac.digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.status(200).json({ message: "Payment verified successfully", paymentId: razorpay_payment_id });
    } else {
      res.status(400).json({ message: "Invalid payment signature" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
};

module.exports = { recordPayment, createRazorpayOrder, verifyRazorpayPayment };
