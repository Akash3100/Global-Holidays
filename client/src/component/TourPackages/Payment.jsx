import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import './Payment.css';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [booking] = useState(() => {
    const stateBooking = location.state?.booking;
    if (stateBooking) return stateBooking;
    try {
      return JSON.parse(localStorage.getItem('latestBooking') || 'null');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const formatMoney = (value = 0) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login', { state: { from: 'payment' } });
    }
  }, [navigate]);

  const loadRazorpayScript = () => new Promise((resolve) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePayment = async () => {
    if (!booking) {
      setMessage('No booking found. Please create a booking before payment.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const { data: order } = await api.post('/api/payments/order', {
        amount: booking.grandTotal || booking.totalPrice || 0,
        currency: process.env.REACT_APP_RAZORPAY_CURRENCY || 'INR',
        receipt: `booking_${booking._id}`,
        notes: {
          bookingId: booking._id,
          userEmail: booking.email,
          placeName: booking.placeName,
        },
      });

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setMessage('Unable to load Razorpay checkout. Please try again later.');
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || '',
        amount: order.amount,
        currency: order.currency,
        name: 'Global Holidays',
        description: `Payment for ${booking.placeName}`,
        order_id: order.id,
        prefill: {
          name: booking.name,
          email: booking.email,
        },
        handler: async (response) => {
          try {
            await api.post('/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id,
              amount: order.amount / 100,
              currency: order.currency,
            });
            setMessage('Payment verified successfully. Redirecting...');
            localStorage.removeItem('latestBooking');
            navigate('/dashboard');
          } catch (verifyError) {
            setMessage(verifyError.response?.data?.message || verifyError.message || 'Payment verification failed.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setMessage('Payment window was closed before completion.'),
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || 'Unable to initiate payment.');
      setLoading(false);
    }
  };

  return (
    <div className="pmnt-page-wrapper">
      <header className="pmnt-site-header">
        <h1>Choose Your Payment Method</h1>
        <p className="pmnt-tagline">Secure checkout for your London booking</p>
      </header>

      <main className="pmnt-main-container">
        {!booking ? (
          <div className="payment-empty-state">
            <p>No booking found. Please book your tour first.</p>
            <button className="pmnt-btn pmnt-btn-primary" onClick={() => navigate('/book')}>
              Start Booking
            </button>
          </div>
        ) : (
          <div className="payment-details-card">
            <div className="payment-summary">
              <h2>{booking.placeName}</h2>
              <p><strong>Traveler:</strong> {booking.name}</p>
              <p><strong>Email:</strong> {booking.email}</p>
              <p><strong>Travel Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
              <p><strong>Tickets:</strong> {booking.qty}</p>
              <p><strong>Total:</strong> {formatMoney(booking.grandTotal || booking.totalPrice || 0)}</p>
            </div>
            <div className="payment-action-panel">
              <button className="pmnt-btn pmnt-btn-primary" onClick={handlePayment} disabled={loading}>
                {loading ? 'Opening Razorpay...' : 'Pay with Razorpay'}
              </button>
              <button className="pmnt-btn pmnt-btn-secondary" onClick={() => navigate('/book')}>
                Back to Booking
              </button>
              {message && <p className="payment-message">{message}</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PaymentPage;
