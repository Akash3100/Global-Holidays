import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem('registeredUser') || 'null');
    setUser(profile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('registeredUser');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="auth-page-body profile-page">
        <div className="auth-container profile-card profile-card--empty">
          <span className="profile-avatar-large">
            <i className="ri-user-line"></i>
          </span>
          <h2>User not signed in</h2>
          <p>Please log in to view your profile.</p>
          <button className="auth-btn-primary" type="button" onClick={() => navigate('/login')}>
            Login
          </button>
        </div>
      </div>
    );
  }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Traveler';
  const profileInitial = fullName.slice(0, 1).toUpperCase();

  return (
    <div className="auth-page-body profile-page">
      <div className="auth-container profile-card">
        <div className="profile-hero">
          {user.profilePicture ? (
            <img
              className="profile-avatar-large"
              src={user.profilePicture}
              alt={fullName}
            />
          ) : (
            <span className="profile-avatar-large">{profileInitial}</span>
          )}
          <div>
            <span className="profile-eyebrow">Global Holidays Member</span>
            <h1>My Profile</h1>
            <p>Manage your account details and booking activity.</p>
          </div>
        </div>

        <div className="profile-summary">
          <div className="profile-row">
            <span className="profile-row__icon"><i className="ri-user-smile-line"></i></span>
            <div>
              <strong>Name</strong>
              <span>{fullName}</span>
            </div>
          </div>
          <div className="profile-row">
            <span className="profile-row__icon"><i className="ri-mail-line"></i></span>
            <div>
              <strong>Email</strong>
              <span>{user.email}</span>
            </div>
          </div>
          {user.username && (
            <div className="profile-row">
              <span className="profile-row__icon"><i className="ri-at-line"></i></span>
              <div>
                <strong>Username</strong>
                <span>{user.username}</span>
              </div>
            </div>
          )}
          {user.gender && (
            <div className="profile-row">
              <span className="profile-row__icon"><i className="ri-user-heart-line"></i></span>
              <div>
                <strong>Gender</strong>
                <span>{user.gender}</span>
              </div>
            </div>
          )}
          {user.dob && (
            <div className="profile-row">
              <span className="profile-row__icon"><i className="ri-calendar-event-line"></i></span>
              <div>
                <strong>Birthday</strong>
                <span>{new Date(user.dob).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="auth-sub-actions profile-actions">
          <button className="auth-btn-primary" type="button" onClick={() => navigate('/dashboard')}>
            <i className="ri-dashboard-3-line"></i>
            View My Bookings
          </button>
          <button className="auth-btn-secondary" type="button" onClick={handleLogout}>
            <i className="ri-logout-box-r-line"></i>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
