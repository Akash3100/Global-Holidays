import React from "react";
import "./style.css";
import Header from "./component/Header";
import HomeHero from "./component/HomeHero";
import About from "./component/About";
import Activities from "./component/Activities";
import Packages from "./component/Packages";
import Discover from "./component/Discover";
import Gallery from "./component/Gallery";
import Contact from "./component/Contact";
import Footer from "./component/Footer";
import Login from "./component/Auth/login";
import Register from "./component/Auth/Register"; 
import CustomerDashboard from "./component/Auth/CustomerDashboard";

import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import Booking from "./component/Auth/Booking";
import LondonTour from "./component/TourPackages/LondonTour";
import BookModel from "./component/TourPackages/bookModel";
import AdminDashboard from "./component/Admin/AdminDashboard";
import AdminLogin from "./component/Admin/AdminLogin";
import AdminCustomers from "./component/Admin/AdminCustomers";
import Profile from "./component/Auth/Profile";

const FloatingWhatsApp = () => (
  <a
    className="floating-whatsapp"
    href="https://wa.me/918883388969"
    target="_blank"
    rel="noreferrer"
    aria-label="Chat with Global Holidays on WhatsApp"
  >
    <i className="ri-whatsapp-fill"></i>
  </a>
);

const LandingPage = () => {
  return (
    <>
      <Header />
      <HomeHero />
      <About />
      <Activities />
      <Packages />
      <Discover />

      
      <section className="hero">
        <div className="section__container hero__container">
          <p> GLOBAL </p>
          <p>Holidays</p>
          <Link className="click" to="/login" state={{ from: "booking" }}>
           Explore Now
          </Link>
        </div>
      </section>

      <Gallery sectionId="gallery-1" title="Domestic Package" />
      <Gallery sectionId="gallery-2" title="International Package" />

      
      <section className="hero" id="booking">
        <div className="section__container hero__container">
          <p> BOOK Now </p>
          <Link className="click" to="/login" state={{ from: "explore" }}>
            Click Here
          </Link>
        </div>
      </section>

      <Contact />
      <Footer />
    </>
  );
};

function RequireAuth({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('authToken');

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname, redirectState: location.state }} replace />;
  }

  return children;
}

function RequireAdmin({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('adminToken');

  if (!token) {
    return <Navigate to="/adminlogin" state={{ from: location.pathname }} replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          
          <Route path="/" element={<LandingPage />} />

          
          <Route path="/login" element={<Login />} />

          
          <Route path="/register" element={<Register />} />

          <Route path="/book" element={<Booking />}></Route>

          <Route path="/londontour" element={<LondonTour />}></Route>
          <Route path="/tour package/london.html" element={<Navigate to="/londontour" replace />}></Route>
          <Route path="/tour%20package/london.html" element={<Navigate to="/londontour" replace />}></Route>
          {/* Payment gateway removed - route disabled */}

          <Route path="/bookmodel" element={
            <RequireAuth>
              <BookModel />
            </RequireAuth>
          }></Route>

          <Route path="/dashboard" element={
            <RequireAuth>
              <CustomerDashboard />
            </RequireAuth>
          }></Route>
          <Route path="/profile" element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }></Route>

          
          <Route path="/admindashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>}></Route>
          <Route path="/adminlogin" element={<AdminLogin />}></Route>
          <Route path="/admin/customers" element={<RequireAdmin><AdminCustomers /></RequireAdmin>}></Route>
        </Routes>
        <FloatingWhatsApp />
      </div>
    </Router>
  );
}
