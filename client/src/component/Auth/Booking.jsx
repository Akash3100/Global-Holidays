import React from 'react';
import './Booking.css';
import { Link } from 'react-router-dom';

const Booking = () => {
  return (
    <div className="container wide-panel">
      

      <section style={{ padding: '0', fontSize: '1rem' }}>
        <div className="navebar">
          <div className="nav" style={{ fontSize: '2.5rem' }}>Welcome...</div>
          <h2 style={{ color: '#ffffff', fontSize: '1.8rem', marginBottom: '10px' }}>Explore Your Amazing City</h2>
          <p style={{ marginBottom: '20px' }}>Find Great places to stay, eat, shop or visit from local experts</p>
        </div>

        
        <div className="booking-grid">
          <div className="search-controls">
            <div>
              <p style={{ marginBottom: '10px' }}>Search Query</p>
              <input className="input-field" placeholder="Ex: Food, Services, Hotel" type="text" />
            </div>
            
            <div>
              <p style={{ marginBottom: '10px' }}>Location</p>
              <input className="input-field" placeholder="Where to go?" type="text" />
            </div>

            <Link to="/londontour" className="btn-primary" type="button" style={{ width: '180px' }}>
              View London Packages
            </Link>

            <div className="highlights-panel">
              <p>Or Browse The Highlights</p>
              <div className="categories-container">
                <div className="category-tag"><i className="fa-solid fa-utensils"></i> Restaurant</div>
                <div className="category-tag"><i className="fa-solid fa-hotel"></i> Hotel</div>
                <div className="category-tag"><i className="fa-solid fa-place-of-worship"></i> Place</div>
                <div className="category-tag"><i className="fa-solid fa-bag-shopping"></i> Shopping</div>
              </div>
            </div>
          </div>

          
          <div className="map-wrapper">
            <iframe
              title="Google Maps Presentation Track"
              src="https://maps.google.com/maps?q=London&t=&z=13&ie=UTF8&iwloc=&output=embed"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Booking;