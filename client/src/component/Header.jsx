import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import profileLogo from "../image/global holiday logo.png";
function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authUser = JSON.parse(localStorage.getItem('registeredUser') || 'null');
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');
    if (adminUser && localStorage.getItem('adminToken')) {
      setUser(adminUser);
      setIsAdmin(true);
    } else if (authUser && localStorage.getItem('authToken')) {
      setUser(authUser);
      setIsAdmin(false);
    } else {
      setUser(null);
      setIsAdmin(false);
    }
    setAvatarLoadFailed(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('registeredUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('isAdminLoggedIn');
    setUser(null);
    setIsAdmin(false);
    navigate('/login');
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setProfileOpen(false);
  };

  const profileName = user?.firstName || user?.username || (isAdmin ? 'Global Holidays' : 'Profile');
  const profileInitial = profileName.slice(0, 1).toUpperCase();
  const shouldShowProfilePhoto = Boolean(user?.profilePicture && !avatarLoadFailed && !isAdmin);

  return (
    <header>
      <a href="#home" className="brand" onClick={closeMenu}>
        <img className="brand-logo" src={profileLogo} alt="Global Holidays" />
        <span className="brand-text">Global Holidays</span>
      </a>
      <div 
        className={`menu-btn ${isMenuOpen ? 'active' : ''}`} 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      ></div>
      <div className={`navigation ${isMenuOpen ? 'active' : ''}`}>
        <div className="navigation-items">
          <a href="#home" onClick={closeMenu}>Home</a>
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#activities" onClick={closeMenu}>Activities</a>
          <a href="#discover" onClick={closeMenu}>Discover</a>
          <a href="#gallery-1" onClick={closeMenu}>Gallery</a>
          <a href="#booking" onClick={closeMenu}>Booking</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>
          {user ? (
            <div className="profile-link" onClick={() => setProfileOpen(!profileOpen)}>
              {isAdmin ? (
                <>
                  <span className="profile-avatar">G</span>
                  <span className="profile-title">Global Holidays</span>
                </>
              ) : (
                <>
                  {shouldShowProfilePhoto ? (
                    <img
                      className="profile-avatar profile-avatar--image"
                      src={user.profilePicture}
                      alt={profileName}
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarLoadFailed(true)}
                    />
                  ) : (
                    <span className="profile-avatar">{profileInitial}</span>
                  )}
                  <span className="profile-title">{profileName}</span>
                </>
              )}
              <span className="profile-arrow" aria-hidden="true"></span>
              {profileOpen && (
                <div className="profile-dropdown">
                  {!isAdmin && <><Link to="/dashboard" onClick={closeMenu}>Dashboard</Link><Link to="/profile" onClick={closeMenu}>My Profile</Link></>}
                  {isAdmin && <Link to="/admindashboard" onClick={closeMenu}>Dashboard</Link>}
                  <button type="button" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to='/login' className="nav-action nav-action--login" onClick={closeMenu}>Login</Link>
              <Link to='/adminlogin' className="nav-action nav-action--admin" onClick={closeMenu}>Admin</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header
