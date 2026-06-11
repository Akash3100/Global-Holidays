import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../utils/api';
import "./AdminLogin.css";
import login from "../../image/admin login img.jpg";
import gallery from "../../image/global holiday logo.png";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/admin/login', { username, password });
      const { token, admin } = res.data;
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(admin));
      localStorage.setItem('isAdminLoggedIn', 'true');
      alert('Login Successful!');
      navigate('/admindashboard');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Invalid credentials');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="left-panel">
          <img src={login} alt="London Expeditions" />
          <div className="image-overlay">
            <div className="overlay-content">
              <h2>Global Holidays</h2>
              <p>Exclusive Access for Travel Administrators & Researchers.</p>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="login-box">
            <div className="login-header">
              <img src={gallery} alt="Global Holidays Logo" className="logo" />
              <h2>Welcome to Global Holidays</h2>
              <h3>Admin Login</h3>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="input-group">
                <label htmlFor="username">Username <span>*</span></label>
                <input
                  type="text"
                  id="username"
                  placeholder="Enter Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="password">Password <span>*</span></label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="action-buttons">
                <button type="submit" className="signin-btn">Sign in</button>
                <button type="button" className="forgot-btn">Forgot Password?</button>
              </div>
            </form>

            <footer className="login-footer">
              <p>Copyright &copy; 2012 - 2026 | All rights reserved</p>
              <p>Powered by <b>Global Holidays</b></p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
