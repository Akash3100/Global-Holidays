import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import socket from '../../utils/socket';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [latestBooking, setLatestBooking] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatMoney = (value = 0) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
  const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : 'N/A');

  const fetchBookings = async () => {
    try {
      const res = await api.get('/api/bookings/mine');
      setBookings(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleRealtimeBooking = (booking) => {
      const currentUser = JSON.parse(localStorage.getItem('registeredUser') || 'null');
      const currentUserId = currentUser?._id || currentUser?.id || null;
      const bookingUserId = booking.user?._id || booking.user;

      if (currentUserId && bookingUserId && bookingUserId.toString() === currentUserId.toString()) {
        setLatestBooking(booking);
        setBookings((prev) => [booking, ...prev.filter((item) => item._id !== booking._id)]);
      }
    };

    const handleStatusUpdate = (updatedBooking) => {
      setBookings((prev) => prev.map((booking) => {
        if (booking._id !== updatedBooking._id && booking._id !== updatedBooking.id) return booking;
        return {
          ...booking,
          ...updatedBooking,
          status: updatedBooking.status || booking.status,
        };
      }));
    };

    socket.on('bookingCreated', handleRealtimeBooking);
    socket.on('bookingStatusUpdated', handleStatusUpdate);
    socket.on('bookingUpdated', handleStatusUpdate);
    fetchBookings();

    return () => {
      socket.off('bookingCreated', handleRealtimeBooking);
      socket.off('bookingStatusUpdated', handleStatusUpdate);
      socket.off('bookingUpdated', handleStatusUpdate);
    };
  }, []);

  const filteredBookings = useMemo(() => (
    bookings
      .filter((booking) => statusFilter === 'all' || booking.status === statusFilter)
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
  ), [bookings, statusFilter]);

  const summary = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((booking) => booking.status === 'pending').length,
    confirmed: bookings.filter((booking) => booking.status === 'confirmed').length,
    cancelled: bookings.filter((booking) => booking.status === 'cancelled').length,
    paid: bookings.reduce((total, booking) => total + Number(booking.grandTotal || 0), 0),
  }), [bookings]);

  const currentUser = useMemo(() => JSON.parse(localStorage.getItem('registeredUser') || 'null'), []);
  const firstName = currentUser?.firstName || currentUser?.username || 'Traveler';
  const bookingCode = (booking) => `${booking?._id || ''}`.slice(-8).toUpperCase() || 'N/A';

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      const res = await api.patch(`/api/bookings/${id}/status`, { status: 'cancelled' });
      const updatedBooking = res.data?.booking || res.data || { _id: id, status: 'cancelled' };
      setBookings((prev) => prev.map((booking) => (
        booking._id === id ? { ...booking, ...updatedBooking, status: 'cancelled' } : booking
      )));
    } catch (err) {
      window.alert(err.response?.data?.message || err.message || 'Unable to cancel booking');
    }
  };

  return (
    <main className="customer-dashboard">
      <section className="customer-dashboard__hero">
        <div className="customer-dashboard__hero-copy">
          <span className="customer-dashboard__eyebrow">Global Holidays Dashboard</span>
          <h2>Hello, {firstName}</h2>
          <p>Your trips, payments and booking status are collected here for easy tracking.</p>
          <div className="customer-dashboard__actions">
            <Link className="dashboard-action dashboard-action--home" to="/">
              <i className="ri-home-5-line"></i>
              Home
            </Link>
            <Link className="dashboard-action dashboard-action--book" to="/book">
              <i className="ri-suitcase-3-line"></i>
              Book Trip
            </Link>
          </div>
        </div>
        <div className="customer-dashboard__hero-panel" aria-label="Dashboard highlight">
          <span className="hero-panel__icon">
            <i className="ri-plane-line"></i>
          </span>
          <strong>{summary.total}</strong>
          <span>Total Bookings</span>
          <p>{summary.confirmed} confirmed trips ready for your next journey.</p>
        </div>
      </section>

      {latestBooking && (
        <div className="booking-alert">
          <i className="ri-notification-3-line"></i>
          <span><strong>Real-time update:</strong> New booking placed for {latestBooking.placeName} ({formatMoney(latestBooking.grandTotal)}).</span>
        </div>
      )}

      <section className="customer-booking-summary" aria-label="Booking summary">
        <div className="summary-card">
          <span className="summary-card__icon"><i className="ri-calendar-check-line"></i></span>
          <strong>{summary.total}</strong>
          <span>Total</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__icon"><i className="ri-time-line"></i></span>
          <strong>{summary.pending}</strong>
          <span>Pending</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__icon"><i className="ri-shield-check-line"></i></span>
          <strong>{summary.confirmed}</strong>
          <span>Confirmed</span>
        </div>
        <div className="summary-card summary-card--value">
          <span className="summary-card__icon"><i className="ri-wallet-3-line"></i></span>
          <strong>{formatMoney(summary.paid)}</strong>
          <span>Total Value</span>
        </div>
      </section>

      <section className="customer-dashboard__toolbar">
        <div>
          <h3>My Bookings</h3>
          <p>{filteredBookings.length} booking{filteredBookings.length === 1 ? '' : 's'} showing</p>
        </div>
        <label>
          <span>Status</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </section>

      {loading ? (
        <div className="customer-dashboard__state">
          <i className="ri-loader-4-line"></i>
          Loading your bookings...
        </div>
      ) : error ? (
        <div className="customer-dashboard__state error">
          <i className="ri-error-warning-line"></i>
          Error: {error}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="customer-dashboard__state customer-dashboard__empty">
          <i className="ri-map-pin-smile-line"></i>
          <h3>No bookings found</h3>
          <p>Start your next trip or choose another status filter.</p>
          <Link className="dashboard-action dashboard-action--book" to="/book">Explore Packages</Link>
        </div>
      ) : (
        <section className="customer-booking-list">
          {filteredBookings.map((booking) => (
            <article className="customer-booking-card" key={booking._id}>
              <div className="customer-booking-card__top">
                <span className="customer-booking-card__icon">
                  <i className="ri-map-pin-2-line"></i>
                </span>
                <div>
                  <h3>{booking.placeName}</h3>
                  <p>{booking.name || booking.email || 'Customer'}</p>
                </div>
                <span className={`status-badge status-${booking.status}`}>{booking.status}</span>
              </div>

              <dl className="booking-meta-grid">
                <div><dt>Date</dt><dd>{formatDate(booking.date)}</dd></div>
                <div><dt>Guests</dt><dd>{booking.qty || 1}</dd></div>
                <div><dt>Amount</dt><dd>{formatMoney(booking.grandTotal)}</dd></div>
                <div><dt>Code</dt><dd>{bookingCode(booking)}</dd></div>
              </dl>

              <div className="booking-actions">
                {booking.status !== 'cancelled' && (
                  <button className="customer-btn customer-btn-primary" type="button" onClick={() => handleCancel(booking._id)}>
                    <i className="ri-close-circle-line"></i>
                    Cancel Booking
                  </button>
                )}
                <button className="customer-btn customer-btn-ghost" type="button" onClick={() => setSelectedBooking(booking)}>
                  <i className="ri-file-list-3-line"></i>
                  Details
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {selectedBooking && (
        <div
          className="booking-detail-overlay"
          role="presentation"
          onClick={() => setSelectedBooking(null)}
        >
          <section
            className="booking-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="booking-detail-close"
              type="button"
              aria-label="Close booking details"
              onClick={() => setSelectedBooking(null)}
            >
              <i className="ri-close-line"></i>
            </button>

            <header className="booking-detail-header">
              <span className="booking-detail-header__icon">
                <i className="ri-map-pin-2-line"></i>
              </span>
              <div>
                <span className="booking-detail-eyebrow">Booking {bookingCode(selectedBooking)}</span>
                <h3 id="booking-detail-title">{selectedBooking.placeName}</h3>
                <p>{selectedBooking.name || selectedBooking.email || 'Customer'}</p>
              </div>
              <span className={`status-badge status-${selectedBooking.status}`}>{selectedBooking.status}</span>
            </header>

            <div className="booking-detail-total">
              <span>Total Amount</span>
              <strong>{formatMoney(selectedBooking.grandTotal)}</strong>
            </div>

            <div className="booking-detail-sections">
              <section className="booking-detail-section">
                <h4><i className="ri-suitcase-3-line"></i> Trip Details</h4>
                <dl>
                  <div><dt>Travel Date</dt><dd>{formatDate(selectedBooking.date)}</dd></div>
                  <div><dt>Guests</dt><dd>{selectedBooking.qty || 1}</dd></div>
                  <div><dt>Destination</dt><dd>{selectedBooking.placeName}</dd></div>
                  <div><dt>Status</dt><dd>{selectedBooking.status || 'pending'}</dd></div>
                </dl>
              </section>

              <section className="booking-detail-section booking-detail-section--payment">
                <h4><i className="ri-wallet-3-line"></i> Payment Summary</h4>
                <dl>
                  <div><dt>Price</dt><dd>{formatMoney(selectedBooking.price)}</dd></div>
                  <div><dt>Subtotal</dt><dd>{formatMoney(selectedBooking.totalPrice)}</dd></div>
                  <div><dt>Tax</dt><dd>{formatMoney(selectedBooking.tax)}</dd></div>
                  <div><dt>Grand Total</dt><dd>{formatMoney(selectedBooking.grandTotal)}</dd></div>
                </dl>
              </section>

              <section className="booking-detail-section booking-detail-section--wide">
                <h4><i className="ri-user-location-line"></i> Customer Information</h4>
                <dl>
                  <div><dt>Name</dt><dd>{selectedBooking.name || 'N/A'}</dd></div>
                  <div><dt>Email</dt><dd>{selectedBooking.email || 'N/A'}</dd></div>
                  <div><dt>Phone</dt><dd>{selectedBooking.phoneNumber || 'N/A'}</dd></div>
                  <div><dt>City</dt><dd>{selectedBooking.cityOfResidence || 'N/A'}</dd></div>
                  <div><dt>Booked On</dt><dd>{formatDate(selectedBooking.createdAt)}</dd></div>
                  <div><dt>Last Updated</dt><dd>{formatDate(selectedBooking.updatedAt)}</dd></div>
                </dl>
              </section>
            </div>

            <div className="booking-detail-footer">
              {selectedBooking.status !== 'cancelled' && (
                <button
                  className="customer-btn customer-btn-primary"
                  type="button"
                  onClick={() => {
                    const bookingId = selectedBooking._id;
                    setSelectedBooking(null);
                    handleCancel(bookingId);
                  }}
                >
                  <i className="ri-close-circle-line"></i>
                  Cancel Booking
                </button>
              )}
              <button className="customer-btn customer-btn-ghost" type="button" onClick={() => setSelectedBooking(null)}>
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default CustomerDashboard;
