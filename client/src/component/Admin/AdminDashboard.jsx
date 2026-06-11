import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import socket from '../../utils/socket';
import profileLogo from '../../image/global holiday logo.png';
import './AdminDashboard.css';

const statusOptions = ['all', 'pending', 'confirmed', 'cancelled'];

function AdminDashboard() {
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState({ username: 'Admin' });
  const [savingStatusId, setSavingStatusId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const activeHash = location.hash || '#dashboard';

  const formatMoney = (value = 0) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
  const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : 'No date');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/adminlogin');
  };

  const updateBookingStatus = async (bookingId, status) => {
    setSavingStatusId(bookingId);
    try {
      const res = await api.patch(`/api/bookings/${bookingId}/status`, { status });
      const updatedBooking = res.data?.booking || res.data;
      setBookings((prev) => prev.map((booking) => (
        booking._id === bookingId ? { ...booking, ...updatedBooking, status } : booking
      )));
      setSelectedBooking((current) => (
        current?._id === bookingId ? { ...current, ...updatedBooking, status } : current
      ));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to update booking status');
    } finally {
      setSavingStatusId(null);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [customersRes, bookingsRes] = await Promise.all([
        api.get('/api/admin/customers'),
        api.get('/api/bookings'),
      ]);
      setCustomers(customersRes.data || []);
      setBookings(bookingsRes.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem('adminUser') || 'null');
    if (adminData) setAdminInfo(adminData);
  }, []);

  useEffect(() => {
    fetchData();
    socket.on('bookingCreated', fetchData);
    socket.on('bookingStatusUpdated', fetchData);
    socket.on('bookingUpdated', fetchData);
    return () => {
      socket.off('bookingCreated', fetchData);
      socket.off('bookingStatusUpdated', fetchData);
      socket.off('bookingUpdated', fetchData);
    };
  }, []);

  const totalCustomers = customers.length;
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.grandTotal || 0), 0);
  const pendingBookings = bookings.filter((booking) => booking.status === 'pending').length;
  const confirmedBookings = bookings.filter((booking) => booking.status === 'confirmed').length;
  const cancelledBookings = bookings.filter((booking) => booking.status === 'cancelled').length;

  const packageStats = useMemo(() => Object.values(
    bookings.reduce((acc, booking) => {
      const key = booking.placeName || 'Unknown Package';
      if (!acc[key]) acc[key] = { placeName: key, count: 0, revenue: 0 };
      acc[key].count += 1;
      acc[key].revenue += booking.grandTotal || 0;
      return acc;
    }, {})
  ).sort((a, b) => b.count - a.count).slice(0, 3), [bookings]);

  const upcomingBookings = bookings
    .filter((booking) => new Date(booking.date) >= new Date())
    .filter((booking) => filter === 'all' || booking.status === filter)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const messages = bookings
    .filter((booking) => booking.status !== 'confirmed')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((booking) => ({
      id: booking._id,
      title: `${booking.name || booking.email || 'Customer'} - ${booking.status}`,
      description: `${booking.placeName || 'Package'} - ${formatMoney(booking.grandTotal)} - ${formatDate(booking.date)}`,
      status: booking.status,
    }));

  const filteredBookings = bookings
    .filter((booking) => {
      if (filter !== 'all' && booking.status !== filter) return false;
      const term = search.trim().toLowerCase();
      if (!term) return true;
      return [booking.name, booking.placeName, booking.email, booking.status]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const bookingCode = (booking) => `${booking?._id || ''}`.slice(-8).toUpperCase() || 'N/A';
  const bookingUserId = (booking) => booking?.user?._id || booking?.user || null;
  const selectedCustomerRecord = selectedBooking ? customers.find((item) => {
    const itemUser = item.user || {};
    const selectedUserId = bookingUserId(selectedBooking);
    if (selectedUserId && itemUser._id && itemUser._id.toString() === selectedUserId.toString()) return true;
    return selectedBooking.email && itemUser.email && itemUser.email.toLowerCase() === selectedBooking.email.toLowerCase();
  }) : null;
  const selectedCustomer = selectedCustomerRecord?.user || {};
  const selectedCustomerBookings = selectedBooking ? [...(
    selectedCustomerRecord?.bookings?.length
      ? selectedCustomerRecord.bookings
      : bookings.filter((booking) => {
        const selectedUserId = bookingUserId(selectedBooking);
        const currentUserId = bookingUserId(booking);
        if (selectedUserId && currentUserId && selectedUserId.toString() === currentUserId.toString()) return true;
        return selectedBooking.email && booking.email && selectedBooking.email.toLowerCase() === booking.email.toLowerCase();
      })
  )].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)) : [];

  return (
    <div className="dashboard-container" id="dashboard">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <i className="ri-map-pin-2-fill brand-icon"></i>
          <h2>Global Holidays</h2>
        </div>

        <ul className="admin-sidebar__links">
          <li><Link to="/admindashboard#dashboard" className={activeHash === '#dashboard' ? 'active' : ''}><i className="ri-dashboard-line"></i><span>Dashboard</span></Link></li>
          <li><a href="#packages" className={activeHash === '#packages' ? 'active' : ''}><i className="ri-handbag-line"></i><span>Packages</span></a></li>
          <li><a href="#bookings" className={activeHash === '#bookings' ? 'active' : ''}><i className="ri-bookmark-3-line"></i><span>Bookings</span></a></li>
          <li><a href="#calendar" className={activeHash === '#calendar' ? 'active' : ''}><i className="ri-calendar-todo-line"></i><span>Calendar</span></a></li>
          <li><Link to="/admin/customers"><i className="ri-group-line"></i><span>Customers</span></Link></li>
          <li><a href="#messages" className={activeHash === '#messages' ? 'active' : ''}><i className="ri-chat-3-line"></i><span>Messages</span><span className="badge-count">{messages.length}</span></a></li>
        </ul>

        <div className="admin-sidebar__upgrade-card">
          <p>Manage package flow, customer checks and booking follow-up.</p>
          <button type="button" className="upgrade-btn">Upgrade Panel</button>
        </div>
      </aside>

      <main className="admin-main-content">
        <nav className="admin-dashboard-navbar" aria-label="Admin dashboard navigation">
          <button type="button" className="admin-home-button" onClick={() => navigate('/')}>
            <i className="ri-home-5-line"></i>
            <span>Home</span>
          </button>
          <label className="admin-search-bar">
            <i className="ri-search-line"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookings, packages, customers"
            />
          </label>
          <button type="button" className="admin-notification-bell" aria-label="Notifications">
            <i className="ri-notification-3-line"></i>
            {messages.length > 0 && <span className="dot"></span>}
          </button>
          <div className="admin-user-menu">
            <button type="button" className="admin-user-profile" onClick={() => setIsProfileOpen((open) => !open)}>
              <img className="admin-avatar admin-avatar--image" src={profileLogo} alt="Global Holidays" />
              <div className="user-info">
                <h4>Global Holidays</h4>
                <p>{adminInfo.username || 'Admin'}</p>
              </div>
              <i className="ri-arrow-down-s-line"></i>
            </button>
            {isProfileOpen && (
              <div className="admin-profile-dropdown">
                <button type="button" onClick={() => navigate('/admin/customers')}><i className="ri-group-line"></i>Customers</button>
                <button type="button" className="dropdown-logout" onClick={handleLogout}><i className="ri-logout-box-r-line"></i>Logout</button>
              </div>
            )}
          </div>
          <button type="button" className="admin-logout-button" onClick={handleLogout}>
            <i className="ri-logout-box-r-line"></i>
            Logout
          </button>
        </nav>

        <div className="admin-dashboard-header">
          <div className="admin-header__top">
            <div className="admin-header__title">
              <span className="admin-eyebrow">Global Holidays Control Room</span>
              <h1>Admin Dashboard</h1>
              <p>Live booking, customer and package insights in one responsive workspace.</p>
            </div>
          </div>

          <div className="admin-hero-strip" aria-label="Admin overview">
            <div className="admin-hero-card">
              <span><i className="ri-time-line"></i></span>
              <strong>{loading ? '...' : pendingBookings}</strong>
              <small>Pending approvals</small>
            </div>
            <div className="admin-hero-card">
              <span><i className="ri-shield-check-line"></i></span>
              <strong>{loading ? '...' : confirmedBookings}</strong>
              <small>Confirmed trips</small>
            </div>
            <div className="admin-hero-card">
              <span><i className="ri-close-circle-line"></i></span>
              <strong>{loading ? '...' : cancelledBookings}</strong>
              <small>Cancelled bookings</small>
            </div>
          </div>
        </div>

        {error && <div className="admin-error">Error loading dashboard data: {error}</div>}

        {activeHash === '#dashboard' && (
          <div className="kpi-cards" aria-label="Admin metrics">
            <div className="kpi-card kpi-card--bookings">
              <span className="kpi-card__icon"><i className="ri-calendar-check-line"></i></span>
              <div className="kpi-card__header"><span><i className="ri-calendar-check-line"></i>Total Bookings</span></div>
              <h2>{loading ? '...' : totalBookings}</h2>
              <span className="trend positive"><i className="ri-arrow-right-up-line"></i>{loading ? 'Loading' : `${totalBookings} loaded`}</span>
            </div>
            <div className="kpi-card kpi-card--customers">
              <span className="kpi-card__icon"><i className="ri-group-line"></i></span>
              <div className="kpi-card__header"><span><i className="ri-group-line"></i>Total Customers</span></div>
              <h2>{loading ? '...' : totalCustomers}</h2>
              <span className="trend neutral"><i className="ri-user-follow-line"></i>{loading ? 'Loading' : `${totalCustomers} active records`}</span>
            </div>
            <div className="kpi-card kpi-card--earnings">
              <span className="kpi-card__icon"><i className="ri-wallet-3-line"></i></span>
              <div className="kpi-card__header"><span><i className="ri-wallet-3-line"></i>Total Earnings</span></div>
              <h2>{loading ? '...' : formatMoney(totalRevenue)}</h2>
              <span className="trend positive"><i className="ri-arrow-right-up-line"></i>{loading ? 'Loading' : 'from loaded bookings'}</span>
            </div>
          </div>
        )}

        {activeHash !== '#dashboard' && (
          <div className="dashboard-grid">
            {(activeHash === '#calendar' || activeHash === '#bookings') && (
              <div className="grid__left-column">
                {activeHash === '#calendar' && (
                  <div className="chart-container" id="calendar">
                    <div className="chart-header">
                      <h3>Upcoming Bookings</h3>
                      <select className="dropdown-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>{status === 'all' ? 'All statuses' : status}</option>
                        ))}
                      </select>
                    </div>
                    <div className="calendar-list">
                      {loading ? (
                        <p>Loading upcoming bookings...</p>
                      ) : upcomingBookings.length === 0 ? (
                        <p>No upcoming bookings scheduled.</p>
                      ) : (
                        upcomingBookings.map((booking) => (
                          <div key={booking._id} className="calendar-item">
                            <span className="calendar-item__icon">
                              <i className="ri-map-pin-2-line"></i>
                            </span>
                            <div className="calendar-item__content">
                              <h4>{booking.placeName}</h4>
                              <small>{booking.name || booking.email || 'Customer'}</small>
                            </div>
                            <div className="booking-row-actions">
                              <span className="calendar-date">{formatDate(booking.date)}</span>
                              <span className={`status-tag ${booking.status}`}>{booking.status}</span>
                              {booking.status === 'pending' && (
                                <button
                                  type="button"
                                  className="status-action approve"
                                  disabled={savingStatusId === booking._id}
                                  onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                                >
                                  Approve
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeHash === '#bookings' && (
                  <div className="table-section" id="bookings">
                    <div className="table-section__header">
                      <h3>Bookings</h3>
                      <div className="table-actions">
                        <label className="table-search">
                          <i className="ri-search-line"></i>
                          <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name or package"
                          />
                        </label>
                        <select className="btn-filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>{status === 'all' ? 'All statuses' : status}</option>
                          ))}
                        </select>
                        <button type="button" className="btn-add-booking" onClick={() => navigate('/bookmodel')}>
                          <i className="ri-add-line"></i>Add Booking
                        </button>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Booking Code</th>
                            <th>Package</th>
                            <th>Guests</th>
                            <th>Date</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            <tr><td colSpan="8">Loading bookings...</td></tr>
                          ) : filteredBookings.length === 0 ? (
                            <tr><td colSpan="8">No bookings match the current filter.</td></tr>
                          ) : (
                            filteredBookings.slice(0, 10).map((booking) => (
                              <tr
                                key={booking._id}
                                className="booking-click-row"
                                tabIndex="0"
                                role="button"
                                onClick={() => setSelectedBooking(booking)}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    setSelectedBooking(booking);
                                  }
                                }}
                              >
                                <td><strong>{booking.name || booking.email || 'Customer'}</strong></td>
                                <td>{bookingCode(booking)}</td>
                                <td>{booking.placeName}</td>
                                <td>{booking.qty || 1}</td>
                                <td>{formatDate(booking.date)}</td>
                                <td>{formatMoney(booking.grandTotal)}</td>
                                <td><span className={`status-tag ${booking.status}`}>{booking.status}</span></td>
                                <td>
                                  <div className="table-status-actions">
                                    <button
                                      type="button"
                                      className="status-action view"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        setSelectedBooking(booking);
                                      }}
                                    >
                                      View
                                    </button>
                                    {booking.status !== 'confirmed' && (
                                      <button
                                        type="button"
                                        className="status-action approve"
                                        disabled={savingStatusId === booking._id}
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          updateBookingStatus(booking._id, 'confirmed');
                                        }}
                                      >
                                        Approve
                                      </button>
                                    )}
                                    {booking.status !== 'cancelled' && (
                                      <button
                                        type="button"
                                        className="status-action cancel"
                                        disabled={savingStatusId === booking._id}
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          updateBookingStatus(booking._id, 'cancelled');
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(activeHash === '#packages' || activeHash === '#messages') && (
              <aside className="grid__right-column">
                {activeHash === '#packages' && (
                  <div className="packages-card" id="packages">
                    <div className="packages-header">
                      <h3>Top Packages</h3>
                      <i className="ri-more-fill"></i>
                    </div>
                    <p className="package-summary">{loading ? 'Loading package analytics...' : `${packageStats.length} popular packages`}</p>
                    <ul className="package-list">
                      {loading ? (
                        <li>Loading packages...</li>
                      ) : packageStats.length === 0 ? (
                        <li>No package data available.</li>
                      ) : (
                        packageStats.map((pkg, index) => (
                          <li key={pkg.placeName}>
                            <span className={`progress-badge color-${index + 1}`}>{Math.round((pkg.count / (totalBookings || 1)) * 100)}%</span>
                            <div className="p-info">
                              <h4>{pkg.placeName}</h4>
                              <p>{pkg.count} bookings - {formatMoney(pkg.revenue)}</p>
                              <span className="package-meter">
                                <span style={{ width: `${Math.round((pkg.count / (totalBookings || 1)) * 100)}%` }}></span>
                              </span>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}

                {activeHash === '#messages' && (
                  <div className="messages-card" id="messages">
                    <div className="packages-header">
                      <h3>Recent Messages</h3>
                      <i className="ri-mail-line"></i>
                    </div>
                    <div className="message-list">
                      {loading ? (
                        <p>Listening for admin messages...</p>
                      ) : messages.length === 0 ? (
                        <p>No recent messages or alerts.</p>
                      ) : (
                        messages.map((message) => (
                          <div key={message.id} className="message-item">
                            <span className="message-item__icon">
                              <i className={message.status === 'cancelled' ? 'ri-close-circle-line' : 'ri-time-line'}></i>
                            </span>
                            <div className="message-item__content">
                              <h4>{message.title}</h4>
                              <p>{message.description}</p>
                              <div className="message-actions">
                                <span className={`message-status ${message.status}`}>{message.status}</span>
                                {message.status === 'pending' && (
                                  <button
                                    type="button"
                                    className="status-action approve"
                                    disabled={savingStatusId === message.id}
                                    onClick={() => updateBookingStatus(message.id, 'confirmed')}
                                  >
                                    Approve
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </aside>
            )}
          </div>
        )}

        {selectedBooking && (
          <div
            className="admin-booking-detail-overlay"
            role="presentation"
            onClick={() => setSelectedBooking(null)}
          >
            <div
              className="admin-booking-detail-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-booking-detail-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="admin-booking-detail-close"
                aria-label="Close booking details"
                onClick={() => setSelectedBooking(null)}
              >
                <i className="ri-close-line"></i>
              </button>

              <div className="admin-booking-detail-hero">
                <span className="admin-booking-detail-icon"><i className="ri-file-list-3-line"></i></span>
                <div>
                  <span className="admin-booking-detail-eyebrow">Booking {bookingCode(selectedBooking)}</span>
                  <h2 id="admin-booking-detail-title">{selectedBooking.placeName}</h2>
                  <p>{selectedBooking.name || selectedBooking.email || 'Customer'} · {formatDate(selectedBooking.date)}</p>
                </div>
                <span className={`status-tag ${selectedBooking.status}`}>{selectedBooking.status}</span>
              </div>

              <div className="admin-booking-detail-total">
                <span>Total Amount</span>
                <strong>{formatMoney(selectedBooking.grandTotal)}</strong>
              </div>

              <div className="admin-booking-detail-grid">
                <div className="admin-detail-card">
                  <h3><i className="ri-user-3-line"></i>Customer Details</h3>
                  <dl>
                    <div><dt>Name</dt><dd>{selectedBooking.name || `${selectedCustomer.firstName || ''} ${selectedCustomer.lastName || ''}`.trim() || 'N/A'}</dd></div>
                    <div><dt>Email</dt><dd>{selectedBooking.email || selectedCustomer.email || 'N/A'}</dd></div>
                    <div><dt>Phone</dt><dd>{selectedBooking.phoneNumber || 'N/A'}</dd></div>
                    <div><dt>City</dt><dd>{selectedBooking.cityOfResidence || 'N/A'}</dd></div>
                  </dl>
                </div>

                <div className="admin-detail-card">
                  <h3><i className="ri-suitcase-3-line"></i>Trip Details</h3>
                  <dl>
                    <div><dt>Package</dt><dd>{selectedBooking.placeName || 'N/A'}</dd></div>
                    <div><dt>Travel Date</dt><dd>{formatDate(selectedBooking.date)}</dd></div>
                    <div><dt>Guests</dt><dd>{selectedBooking.qty || 1}</dd></div>
                    <div><dt>Status</dt><dd><span className={`status-tag ${selectedBooking.status}`}>{selectedBooking.status}</span></dd></div>
                  </dl>
                </div>

                <div className="admin-detail-card">
                  <h3><i className="ri-wallet-3-line"></i>Payment Summary</h3>
                  <dl>
                    <div><dt>Price</dt><dd>{formatMoney(selectedBooking.price)}</dd></div>
                    <div><dt>Subtotal</dt><dd>{formatMoney(selectedBooking.totalPrice)}</dd></div>
                    <div><dt>Tax</dt><dd>{formatMoney(selectedBooking.tax)}</dd></div>
                    <div><dt>Grand Total</dt><dd>{formatMoney(selectedBooking.grandTotal)}</dd></div>
                  </dl>
                </div>

                <div className="admin-detail-card">
                  <h3><i className="ri-time-line"></i>Record Info</h3>
                  <dl>
                    <div><dt>Booking Code</dt><dd>{bookingCode(selectedBooking)}</dd></div>
                    <div><dt>Booked On</dt><dd>{formatDate(selectedBooking.createdAt)}</dd></div>
                    <div><dt>Last Updated</dt><dd>{formatDate(selectedBooking.updatedAt)}</dd></div>
                    <div><dt>Total Bookings</dt><dd>{selectedCustomerBookings.length}</dd></div>
                  </dl>
                </div>
              </div>

              <div className="admin-customer-history">
                <div className="admin-customer-history__header">
                  <h3>Customer Booking History</h3>
                  <span>{selectedCustomerBookings.length} booking{selectedCustomerBookings.length === 1 ? '' : 's'}</span>
                </div>
                <div className="admin-customer-history__list">
                  {selectedCustomerBookings.length === 0 ? (
                    <p>No other booking records found for this customer.</p>
                  ) : (
                    selectedCustomerBookings.map((booking) => (
                      <div key={booking._id} className={booking._id === selectedBooking._id ? 'active' : ''}>
                        <strong>{booking.placeName}</strong>
                        <span>{bookingCode(booking)}</span>
                        <span>{formatDate(booking.date)}</span>
                        <span>{formatMoney(booking.grandTotal)}</span>
                        <span className={`status-tag ${booking.status}`}>{booking.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="admin-booking-detail-footer">
                {selectedBooking.status !== 'confirmed' && (
                  <button
                    type="button"
                    className="status-action approve"
                    disabled={savingStatusId === selectedBooking._id}
                    onClick={() => updateBookingStatus(selectedBooking._id, 'confirmed')}
                  >
                    Approve Booking
                  </button>
                )}
                {selectedBooking.status !== 'cancelled' && (
                  <button
                    type="button"
                    className="status-action cancel"
                    disabled={savingStatusId === selectedBooking._id}
                    onClick={() => updateBookingStatus(selectedBooking._id, 'cancelled')}
                  >
                    Cancel Booking
                  </button>
                )}
                <button type="button" className="status-action view" onClick={() => setSelectedBooking(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
