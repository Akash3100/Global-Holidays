const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

const createOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;
    if (!amount || Number(amount) <= 0) {
      res.status(400);
      throw new Error('Invalid amount for payment');
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId, amount, currency } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400);
      throw new Error('Missing Razorpay verification fields');
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      res.status(400);
      throw new Error('Payment verification failed');
    }

    const payment = await Payment.create({
      booking: bookingId || null,
      user: req.user ? req.user._id : null,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount: amount || 0,
      currency: currency || 'INR',
      status: 'paid',
    });

    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.status = 'confirmed';
        await booking.save();

        const io = req.app.get('io');
        if (io) {
          io.emit('bookingUpdated', { id: booking._id, status: booking.status });
          io.emit('bookingStatusUpdated', booking);
        }
      }
    }

    res.json({ success: true, message: 'Payment verified and recorded', payment });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, verifyPayment };