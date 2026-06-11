const Booking = require('../models/Booking');

const formatMoney = (value = 0) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
}).format(Number(value || 0));

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-IN') : 'N/A');

const statusLabels = {
  pending: 'Pending confirmation',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
};

const buildStatusEmail = (booking) => {
  const statusLabel = statusLabels[booking.status] || booking.status;
  const travelDate = formatDate(booking.date);
  const total = formatMoney(booking.grandTotal);
  const subject = `Global Holidays booking status: ${statusLabel}`;
  const text = [
    `Hi ${booking.name},`,
    '',
    `Your booking status has been updated to: ${statusLabel}.`,
    '',
    `Destination: ${booking.placeName}`,
    `Travel date: ${travelDate}`,
    `Guests: ${booking.qty || 1}`,
    `Total value: ${total}`,
    '',
    'Thank you for choosing Global Holidays.',
  ].join('\n');
  const html = `
    <div style="font-family: Arial, sans-serif; color: #14233a; line-height: 1.6;">
      <h2 style="margin: 0 0 12px; color: #1b3b2b;">Global Holidays Booking Update</h2>
      <p>Hi ${booking.name},</p>
      <p>Your booking status has been updated to <strong>${statusLabel}</strong>.</p>
      <table cellpadding="8" cellspacing="0" style="border-collapse: collapse; background: #f8fbff;">
        <tr><td><strong>Destination</strong></td><td>${booking.placeName}</td></tr>
        <tr><td><strong>Travel date</strong></td><td>${travelDate}</td></tr>
        <tr><td><strong>Guests</strong></td><td>${booking.qty || 1}</td></tr>
        <tr><td><strong>Total value</strong></td><td>${total}</td></tr>
      </table>
      <p>Thank you for choosing Global Holidays.</p>
    </div>
  `;

  return { subject, text, html };
};

const createBooking = async (req, res, next) => {
  try {
    const { name, email, date, qty, placeName, price, phoneNumber, cityOfResidence } = req.body;

    if (!name || !email || !date || !qty || !placeName || !price || !phoneNumber || !cityOfResidence) {
      res.status(400);
      throw new Error('Missing required booking fields');
    }

    const totalPrice = Number(price) * Number(qty);
    const tax = Number((totalPrice * 0.12).toFixed(2));
    const grandTotal = Number((totalPrice + tax).toFixed(2));

    const bookingData = {
      name,
      email,
      date,
      qty,
      placeName,
      price,
      phoneNumber,
      cityOfResidence,
      totalPrice,
      tax,
      grandTotal,
    };

    if (req.user && req.user._id) bookingData.user = req.user._id;

    const booking = await Booking.create(bookingData);
    const io = req.app.get('io');
    if (io) {
      io.emit('bookingCreated', booking);
    }

    try {
      const { sendMail } = require('../utils/mailer');
      const subject = `Global Holidays booking received: ${booking.placeName}`;
      const total = formatMoney(booking.grandTotal);
      const text = `Hi ${booking.name},\n\nYour booking for ${booking.placeName} on ${formatDate(booking.date)} has been received and is pending confirmation. Total: ${total}.\n\nThank you for choosing Global Holidays.`;
      const html = `<p>Hi ${booking.name},</p><p>Your booking for <strong>${booking.placeName}</strong> on <em>${formatDate(booking.date)}</em> has been received and is pending confirmation.</p><p><strong>Total:</strong> ${total}</p><p>Thank you for choosing Global Holidays.</p>`;

      await sendMail({ to: booking.email, subject, text, html });

      if (process.env.ADMIN_EMAIL) {
        await sendMail({ to: process.env.ADMIN_EMAIL, subject: `New booking: ${booking.placeName}`, text: `New booking by ${booking.name} (${booking.email})`, html: `<p>New booking by ${booking.name} (${booking.email})</p><p>Place: ${booking.placeName}</p><p>Total: ${total}</p>` });
      }
    } catch (emailErr) {
      console.error('Booking created but email failed:', emailErr.message || emailErr);
    }

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status');
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    if (req.user && req.user._id && booking.user && booking.user.toString() !== req.user._id.toString()) {
      if (!req.user.isAdmin) {
        res.status(403);
        throw new Error('Not authorized to change this booking');
      }
    }

    booking.status = status;
    await booking.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('bookingStatusUpdated', booking);
    }

    // Send email notification to customer about status change
    try {
      const { sendMail } = require('../utils/mailer');
      const { subject, text, html } = buildStatusEmail(booking);
      await sendMail({ to: booking.email, subject, text, html });
    } catch (emailErr) {
      console.error('Status updated but email failed:', emailErr.message || emailErr);
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking, getBookings, getMyBookings, updateBookingStatus };
