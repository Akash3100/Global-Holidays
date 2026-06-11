import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './AuthForm.css';

const passwordRules = [
  {
    label: 'At least 8 characters',
    test: (value) => value.length >= 8,
  },
  {
    label: 'At least one capital letter',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    label: 'At least one special character',
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromContext = location.state?.from;
  const redirectState = location.state?.redirectState;
  const getRedirectPath = () => {
    if (fromContext === 'explore') return '/londontour';
    if (fromContext === 'booking') return '/book';
    if (typeof fromContext === 'string' && fromContext.startsWith('/')) return fromContext;
    return '/dashboard';
  };

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('male');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');
  const isPasswordValid = passwordRules.every((rule) => rule.test(password));
  const showPasswordHelp = showPasswordRules || password.length > 0;

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email || !password || !firstName) {
      alert("Please fill out all necessary details!");
      return;
    }

    if (!isPasswordValid) {
      alert('Password must be at least 8 characters and include one capital letter and one special character.');
      return;
    }

    const userData = {
      firstName,
      lastName,
      gender,
      email: email.toLowerCase().trim(),
      password,
      username,
      dob,
    };

    try {
      const { data } = await axios.post('/api/auth/register', userData);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('registeredUser', JSON.stringify(data.user));
      alert('Account created successfully! You are now logged in.');

      navigate(getRedirectPath(), { replace: true, state: redirectState });
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Unable to create account.');
    }
  };

  return (
    <div className="auth-page-body">
      <div className="auth-container">
        <div className="auth-account-header">
          <h1>Create Account</h1>
        </div>

        <form onSubmit={handleRegister} className="auth-data-form">
          <div className="auth-input-group">
            <h2 className="auth-group-title">Enter Your Name:</h2>
            <div className="auth-twin-box">
              <input 
                className="auth-underline-input" 
                placeholder="First name" 
                type="text" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input 
                className="auth-underline-input" 
                placeholder="Last name" 
                type="text" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-gender-zone">
            <label>Gender :</label>
            <input 
              type="radio" 
              id="male" 
              name="gender" 
              value="male" 
              checked={gender === 'male'}
              onChange={(e) => setGender(e.target.value)}
            />
            <label htmlFor="male">Male</label>

            <input 
              type="radio" 
              id="female" 
              name="gender" 
              value="female" 
              checked={gender === 'female'}
              onChange={(e) => setGender(e.target.value)}
            />
            <label htmlFor="female">Female</label>
          </div>

          <div className="auth-input-group">
            <p>Email</p>
            <input 
              className="auth-underline-input" 
              type="email" 
              id="email" 
              placeholder="example@mail.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="auth-input-group">
            <p>Password</p>
            <input 
              className="auth-underline-input" 
              type="password" 
              placeholder="Enter password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setShowPasswordRules(true)}
              onBlur={() => setShowPasswordRules(false)}
              aria-describedby="password-rules"
              required
            />
            <ul className={`auth-password-rules ${showPasswordHelp ? 'auth-password-rules--visible' : 'auth-password-rules--hidden'}`} id="password-rules">
              {passwordRules.map((rule) => {
                const isMet = rule.test(password);

                return (
                  <li
                    key={rule.label}
                    className={isMet ? 'auth-password-rule auth-password-rule--valid' : 'auth-password-rule'}
                  >
                    <span aria-hidden="true">{isMet ? 'OK' : '!'}</span>
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="auth-input-group">
            <h2 className="auth-group-title">Preferred User Name :</h2>
            <input 
              className="auth-underline-input" 
              placeholder="Username" 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="dob" className="auth-group-title" style={{ display: 'block', marginBottom: '8px' }}>
              Date of Birth:
            </label>
            <input 
              className="auth-underline-input" 
              type="date" 
              id="dob" 
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>

          <div className="auth-sub-actions">
            <button className="auth-btn-primary" type="submit" disabled={password.length > 0 && !isPasswordValid}>Submit</button>
            <button className="auth-btn-secondary" type="reset" onClick={() => window.location.reload()}>Reset</button>
            <Link to="/" className="auth-btn-secondary">Go Back</Link>
          </div>
        </form>
        <div className="auth-footer-redirect">
                  <span>Already have an Account? </span>
                  <Link to="/login" state={{ from: fromContext, redirectState }}>Login here</Link>
                </div>
      </div>
    </div>
  );
};

export default Register;
