const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: Date, required: true },
  qty: { type: Number, required: true, default: 1 },
  placeName: { type: String, required: true },
  price: { type: Number, required: true },
  phoneNumber: { type: String, required: true },
  cityOfResidence: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  tax: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Booking', bookingSchema);
