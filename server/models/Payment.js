const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  razorpay_order_id: { type: String, required: true },
  razorpay_payment_id: { type: String, required: true },
  razorpay_signature: { type: String, required: true },
  amount: { type: Number },
  currency: { type: String },
  status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
