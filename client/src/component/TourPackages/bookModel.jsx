import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import './BookModel.css';

const BookModel = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const place = location.state || { name: 'London Premium Tour', price: 80000 };
  const basePrice = place.price || 0;
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    qty: 1,
    cityOfResidence: '',
    phoneNumber: '',
    whatsapp: '',
    vacationType: '',
    numberOfPeople: '1',
  });

  const totalPrice = basePrice * formData.qty;
  const tax = totalPrice > 0 ? Number((totalPrice * 0.12).toFixed(2)) : 0;
  const grandTotal = totalPrice + tax;
  const formatMoney = (value = 0) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

  const handleQtyChange = (type) => {
    setFormData((prev) => {
      const newQty = type === 'inc' ? prev.qty + 1 : prev.qty - 1;
      return { ...prev, qty: newQty < 1 ? 1 : newQty };
    });
  };

  const resetOtpState = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setOtpCode('');
    setOtpError('');
    setOtpMessage('');
  };

  const sendOtp = async () => {
    setOtpError('');
    setOtpMessage('');

      if (!formData.phoneNumber.trim()) {
        setOtpError('Enter a valid phone number before sending OTP.');
      return;
    }

    try {
      setSendingOtp(true);
        const response = await api.post('/api/otp/send', {
          phoneNumber: formData.phoneNumber.trim(),
      });
      setOtpSent(true);
      setOtpMessage(response.data.message || 'OTP sent successfully.');
    } catch (error) {
      setOtpError(error.response?.data?.message || error.message || 'Unable to send OTP.');
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    setOtpError('');
    setOtpMessage('');

    if (!otpCode.trim()) {
      setOtpError('Please enter the OTP you received.');
      return;
    }

    try {
      setVerifyingOtp(true);
        const response = await api.post('/api/otp/verify', {
          phoneNumber: formData.phoneNumber.trim(),
        otp: otpCode.trim(),
      });
      setOtpVerified(true);
      setOtpMessage(response.data.message || 'Email verified successfully.');
      setOtpError('');
    } catch (error) {
      setOtpError(error.response?.data?.message || error.message || 'OTP verification failed.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otpVerified) {
      setOtpError('Please verify your phone number with OTP before confirming booking.');
      return;
    }

    try {
      const response = await api.post('/api/bookings', {
        name: formData.name,
        email: formData.email,
        date: formData.date,
        qty: formData.qty,
        placeName: place.name,
        price: basePrice,
        cityOfResidence: formData.cityOfResidence,
        phoneNumber: formData.phoneNumber,
        whatsapp: formData.whatsapp,
        vacationType: formData.vacationType,
        numberOfPeople: formData.numberOfPeople,
      });

      setBookingResult(response.data);
      localStorage.setItem('latestBooking', JSON.stringify(response.data));
      setShowConfirmation(true);
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Unable to submit booking.');
    }
  };

  const handleDone = (e) => {
    e.preventDefault();
    // Payment gateway removed: go to dashboard after booking
    navigate('/dashboard');
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login', { state: { from: 'booking' } });
    }
  }, [navigate]);

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="realtime-booking-page">
      <div className="booking-card-container">
        <div className="summary-sidebar">
          <button className="back-circle-btn" onClick={handleCancel} title="Go Back" type="button">
            <i className="ri-arrow-left-line"></i>
          </button>

          <div className="sidebar-content">
            <span className="badge">Selected Destination</span>
            <h2>{place.name}</h2>
            <p className="sidebar-desc">
              Experience the historical essence and beautiful architectural marvels of United Kingdom.
            </p>

            <div className="pricing-breakdown">
              <h3>Fare Summary</h3>
              <div className="price-row">
                <span>Base Fare ({formData.qty} x {formatMoney(basePrice)})</span>
                <span>{formatMoney(totalPrice)}</span>
              </div>
              <div className="price-row">
                <span>Local Tax & Fees (12%)</span>
                <span>{formatMoney(tax)}</span>
              </div>
              <hr className="divider" />
              <div className="price-row total">
                <span>Grand Total</span>
                <span>{grandTotal > 0 ? formatMoney(grandTotal) : 'Free Entry'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-main-content">
          {!showConfirmation ? (
            <>
              <div className="form-header-zone">
                <h2>Secure Checkout</h2>
                <p>Provide your official credentials to request express tickets instantly.</p>
              </div>

              <form onSubmit={handleSubmit} className="modern-form-gate">
                <div className="floating-input-group">
                  <label htmlFor="name">Traveler Full Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><i className="ri-user-line"></i></span>
                    <input
                      id="name"
                      type="text"
                      placeholder="e.g. John Doe"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="floating-input-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><i className="ri-mail-line"></i></span>
                    <input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      required
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        resetOtpState();
                      }}
                    />
                  </div>
                </div>

                <div className="form-twin-row">
                  <div className="floating-input-group">
                    <label htmlFor="city">City of Residence</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><i className="ri-map-pin-line"></i></span>
                      <input
                        id="city"
                        type="text"
                        placeholder="e.g. Mumbai"
                        required
                        value={formData.cityOfResidence}
                        onChange={(e) => setFormData({ ...formData, cityOfResidence: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="floating-input-group">
                    <label htmlFor="phone">Phone Number</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><i className="ri-phone-line"></i></span>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="+91 9876543210"
                        required
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      />
                    </div>
                    <div className="otp-status-row">
                      <button
                        type="button"
                        className="btn-otp-action"
                        onClick={sendOtp}
                        disabled={sendingOtp || !formData.phoneNumber.trim()}
                      >
                        {otpSent ? 'Resend OTP' : 'Send OTP'}
                      </button>
                      {otpVerified && <span className="phone-verified-badge">Verified</span>}
                    </div>

                    {otpSent && !otpVerified && (
                      <div className="otp-row">
                        <div className="floating-input-group otp-input-group">
                          <label htmlFor="otp">Verification Code</label>
                          <div className="input-wrapper">
                            <span className="input-icon"><i className="ri-shield-check-line"></i></span>
                            <input
                              id="otp"
                              type="tel"
                              inputMode="numeric"
                              maxLength="6"
                              placeholder="6-digit code"
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value)}
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn-otp-action verify"
                          onClick={verifyOtp}
                          disabled={verifyingOtp || !otpCode.trim()}
                        >
                          Verify OTP
                        </button>
                      </div>
                    )}

                    {otpMessage && <p className="otp-message">{otpMessage}</p>}
                    {otpError && <p className="otp-error">{otpError}</p>}
                  </div>
                </div>

                <div className="floating-input-group">
                  <label htmlFor="whatsapp">WhatsApp Number</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><i className="ri-whatsapp-line"></i></span>
                    <input
                      id="whatsapp"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-twin-row">
                  <div className="floating-input-group">
                    <label htmlFor="vacationType">Vacation Type</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><i className="ri-suitcase-line"></i></span>
                      <select
                        id="vacationType"
                        required
                        value={formData.vacationType}
                        onChange={(e) => setFormData({ ...formData, vacationType: e.target.value })}
                      >
                        <option value="">Select vacation type...</option>
                        <option value="Adventure">Adventure</option>
                        <option value="Relaxation">Relaxation</option>
                        <option value="Cultural">Cultural</option>
                        <option value="Family">Family</option>
                        <option value="Honeymoon">Honeymoon</option>
                      </select>
                    </div>
                  </div>

                  <div className="floating-input-group">
                    <label htmlFor="numberOfPeople">No. of People</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><i className="ri-group-line"></i></span>
                      <input
                        id="numberOfPeople"
                        type="number"
                        min="1"
                        placeholder="1"
                        required
                        value={formData.numberOfPeople}
                        onChange={(e) => setFormData({ ...formData, numberOfPeople: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-twin-row">
                  <div className="floating-input-group">
                    <label htmlFor="date">Departure Date</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><i className="ri-calendar-line"></i></span>
                      <input
                        id="date"
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="floating-input-group">
                    <label>Total Tickets</label>
                    <div className="realtime-qty-picker">
                      <button type="button" className="qty-action" onClick={() => handleQtyChange('dec')} aria-label="Decrease tickets">
                        <i className="ri-subtract-line"></i>
                      </button>
                      <span className="qty-value">{formData.qty}</span>
                      <button type="button" className="qty-action" onClick={() => handleQtyChange('inc')} aria-label="Increase tickets">
                        <i className="ri-add-line"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="checkout-actions">
                  <button type="submit" className="btn-confirm-pay">
                    Securely Confirm Booking &rarr;
                  </button>
                  <button type="button" className="btn-cancel-pay" onClick={handleCancel}>
                    Cancel Checkout
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="realtime-success-panel">
              <div className="success-icon-shield"><i className="ri-check-line"></i></div>
              <h3>Order Reserved Successfully!</h3>
              <p className="success-sub">
                We have generated your slots. Please complete the verified checkout payment layer below.
              </p>

              <div className="receipt-box">
                <div className="receipt-line"><span>Destination:</span> <strong>{place.name}</strong></div>
                <div className="receipt-line"><span>Passenger:</span> <span>{formData.name}</span></div>
                <div className="receipt-line"><span>Date of Tour:</span> <span>{formData.date}</span></div>
                <div className="receipt-line"><span>Total Slotted:</span> <span>{formData.qty} Ticket(s)</span></div>
                <hr className="divider" />
                <div className="receipt-line grand"><span>Amount to Pay:</span> <strong>{formatMoney(grandTotal)}</strong></div>
              </div>

              <div className="receipt-actions">
                <button className="btn-confirm-pay" onClick={handleDone} type="button">
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookModel;
