import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import socket from '../../utils/socket';
import './AdminCustomers.css';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/customers');
      setCustomers(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    socket.on('bookingCreated', fetchCustomers);
    socket.on('bookingStatusUpdated', fetchCustomers);
    socket.on('bookingUpdated', fetchCustomers);
    return () => {
      socket.off('bookingCreated', fetchCustomers);
      socket.off('bookingStatusUpdated', fetchCustomers);
      socket.off('bookingUpdated', fetchCustomers);
    };
  }, []);

  const totalCustomers = customers.length;
  const totalBookings = customers.reduce((sum, item) => sum + (item.bookings?.length || 0), 0);
  const totalRevenue = customers.reduce(
    (sum, item) => sum + (item.bookings?.reduce((inner, booking) => inner + (booking.grandTotal || 0), 0) || 0),
    0
  );
  const confirmedBookings = customers.reduce(
    (sum, item) => sum + (item.bookings?.filter((booking) => booking.status === 'confirmed').length || 0),
    0
  );
  const formatMoney = (value = 0) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
  const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : 'No date');
  const bookingCode = (booking) => `${booking?._id || ''}`.slice(-8).toUpperCase() || 'N/A';
  const initials = (user) => `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'GH';
  const customerRevenue = (item) => item.bookings?.reduce((sum, booking) => sum + Number(booking.grandTotal || 0), 0) || 0;
  const customerConfirmedCount = (item) => item.bookings?.filter((booking) => booking.status === 'confirmed').length || 0;
  const customerLatestBooking = (item) => [...(item.bookings || [])].sort(
    (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
  )[0];

  if (loading) {
    return (
      <div className="admin-customers">
        <div className="admin-customers__state">
          <i className="ri-loader-4-line"></i>
          <h2>Customers & Bookings</h2>
          <p>Loading customer records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-customers">
        <div className="admin-customers__state error">
          <i className="ri-error-warning-line"></i>
          <h2>Customers & Bookings</h2>
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-customers">
      <div className="admin-customers__header">
        <div>
          <span className="admin-customers__eyebrow">Customer Control</span>
          <h2>Customers & Bookings</h2>
          <p>Review each customer, package and booking status.</p>
        </div>
        <nav>
          <Link to="/admindashboard#dashboard"><i className="ri-dashboard-line"></i>Dashboard</Link>
          <Link to="/admindashboard#bookings"><i className="ri-bookmark-3-line"></i>Bookings</Link>
        </nav>
      </div>

      <div className="customer-summary">
        <div className="summary-cards">
          <div className="summary-card">
            <span className="summary-card__icon"><i className="ri-group-line"></i></span>
            <div>
              <strong>{totalCustomers}</strong>
              <span>Customers</span>
            </div>
          </div>
          <div className="summary-card">
            <span className="summary-card__icon"><i className="ri-calendar-check-line"></i></span>
            <div>
              <strong>{totalBookings}</strong>
              <span>Bookings</span>
            </div>
          </div>
          <div className="summary-card">
            <span className="summary-card__icon"><i className="ri-shield-check-line"></i></span>
            <div>
              <strong>{confirmedBookings}</strong>
              <span>Confirmed Trips</span>
            </div>
          </div>
          <div className="summary-card summary-card--revenue">
            <span className="summary-card__icon"><i className="ri-wallet-3-line"></i></span>
            <div>
              <strong>{formatMoney(totalRevenue)}</strong>
              <span>Revenue</span>
            </div>
          </div>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="admin-customers__empty">
          <i className="ri-user-search-line"></i>
          <h3>No customer records available</h3>
          <p>New customer and booking records will appear here automatically.</p>
        </div>
      ) : (
        <div className="customer-list">
          {customers.map((item) => (
            <div
              key={item.user._id}
              className="customer-card"
              role="button"
              tabIndex="0"
              onClick={() => setSelectedCustomer(item)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSelectedCustomer(item);
                }
              }}
            >
              <div className="customer-card__header">
                <div className="customer-card__identity">
                  <span className="customer-avatar">{initials(item.user)}</span>
                  <div>
                    <h3>{item.user.firstName} {item.user.lastName}</h3>
                    <p>{item.user.email}</p>
                  </div>
                </div>
                <span className="customer-booking-count">{item.bookings?.length || 0} bookings</span>
              </div>
              <div className="admin-customer-booking-list">
                {item.bookings.length === 0 ? (
                  <div className="customer-no-bookings">
                    <i className="ri-suitcase-line"></i>
                    <span>No bookings yet.</span>
                  </div>
                ) : (
                  item.bookings.map((booking) => (
                    <div key={booking._id} className="booking-item">
                      <div className="booking-item__package">
                        <strong>{booking.placeName}</strong>
                        <small>Booking {bookingCode(booking)}</small>
                      </div>
                      <span><i className="ri-calendar-line"></i>{formatDate(booking.date)}</span>
                      <span><i className="ri-wallet-3-line"></i>{formatMoney(booking.grandTotal)}</span>
                      <span className={`status-tag ${booking.status}`}>{booking.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCustomer && (
        <div
          className="customer-detail-overlay"
          role="presentation"
          onClick={() => setSelectedCustomer(null)}
        >
          <section
            className="customer-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="customer-detail-close"
              aria-label="Close customer details"
              onClick={() => setSelectedCustomer(null)}
            >
              <i className="ri-close-line"></i>
            </button>

            <header className="customer-detail-hero">
              <span className="customer-detail-avatar">{initials(selectedCustomer.user)}</span>
              <div>
                <span className="customer-detail-eyebrow">Customer Profile</span>
                <h2 id="customer-detail-title">{selectedCustomer.user.firstName} {selectedCustomer.user.lastName}</h2>
                <p>{selectedCustomer.user.email}</p>
              </div>
              <span className="customer-booking-count">{selectedCustomer.bookings?.length || 0} bookings</span>
            </header>

            <div className="customer-detail-stats">
              <div>
                <span>Total Spend</span>
                <strong>{formatMoney(customerRevenue(selectedCustomer))}</strong>
              </div>
              <div>
                <span>Confirmed Trips</span>
                <strong>{customerConfirmedCount(selectedCustomer)}</strong>
              </div>
              <div>
                <span>Latest Booking</span>
                <strong>{customerLatestBooking(selectedCustomer)?.placeName || 'No bookings'}</strong>
              </div>
            </div>

            <div className="customer-detail-grid">
              <section className="customer-detail-card">
                <h3><i className="ri-user-3-line"></i>Account Details</h3>
                <dl>
                  <div><dt>First Name</dt><dd>{selectedCustomer.user.firstName || 'N/A'}</dd></div>
                  <div><dt>Last Name</dt><dd>{selectedCustomer.user.lastName || 'N/A'}</dd></div>
                  <div><dt>Email</dt><dd>{selectedCustomer.user.email || 'N/A'}</dd></div>
                  <div><dt>Username</dt><dd>{selectedCustomer.user.username || 'N/A'}</dd></div>
                </dl>
              </section>

              <section className="customer-detail-card">
                <h3><i className="ri-bar-chart-box-line"></i>Booking Summary</h3>
                <dl>
                  <div><dt>Total Bookings</dt><dd>{selectedCustomer.bookings?.length || 0}</dd></div>
                  <div><dt>Confirmed</dt><dd>{customerConfirmedCount(selectedCustomer)}</dd></div>
                  <div><dt>Revenue</dt><dd>{formatMoney(customerRevenue(selectedCustomer))}</dd></div>
                  <div><dt>Last Travel Date</dt><dd>{formatDate(customerLatestBooking(selectedCustomer)?.date)}</dd></div>
                </dl>
              </section>
            </div>

            <section className="customer-detail-bookings">
              <div className="customer-detail-bookings__header">
                <h3>Bookings</h3>
                <span>{selectedCustomer.bookings?.length || 0} records</span>
              </div>
              {selectedCustomer.bookings?.length ? (
                <div className="customer-detail-booking-list">
                  {selectedCustomer.bookings.map((booking) => (
                    <div key={booking._id}>
                      <div>
                        <strong>{booking.placeName}</strong>
                        <small>Booking {bookingCode(booking)}</small>
                      </div>
                      <span>{formatDate(booking.date)}</span>
                      <span>{formatMoney(booking.grandTotal)}</span>
                      <span className={`status-tag ${booking.status}`}>{booking.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="customer-no-bookings customer-no-bookings--modal">
                  <i className="ri-suitcase-line"></i>
                  <span>No bookings yet.</span>
                </div>
              )}
            </section>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
