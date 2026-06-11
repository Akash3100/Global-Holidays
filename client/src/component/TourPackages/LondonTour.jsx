import React from 'react';
import { Link } from 'react-router-dom';
import './london.css'; 
import l1 from "../../image/london-1.avif";
import l2 from "../../image/london 2.avif";
import l3 from "../../image/london 3.webp";
import l4 from "../../image/london 4.jpg";
import l5 from "../../image/london 5.avif";

const LondonTour = () => {
  const tourPlaces = [
    { id: 1, name: "London Eye", desc: "Enjoy panoramic views of London from the iconic observation wheel on the South Bank.", duration: "30 min", price: 80000, displayPrice: "₹80,000 / Couple", img: l1 },
    { id: 2, name: "Tower of London", desc: "Discover 1,000 years of history, Crown Jewels and dramatic stories inside this ancient fortress.", duration: "Guided visit", price: 99999, displayPrice: "₹99,999 / Couple", img: l2 },
    { id: 3, name: "British Museum", desc: "Amazing collections from around the world. Free general admission.", duration: "Self-guided", price: 89999, displayPrice: "₹89,999 / Couple", img: l3 },
    { id: 4, name: "Natural History Museum", desc: "Explore distinct collections from various segments of natural history.", duration: "Self-guided", price: 89999, displayPrice: "₹89,999 / Couple", img: l4 },
    { id: 5, name: "Madame Tussauds", desc: "Millions and millions of people have flocked through the doors of Madame Tussauds.", duration: "Self-guided", price: 120000, displayPrice: "₹1,20,000 / Couple", img: l5 }
  ];

  return (
    <>
      <header className="site-header">
        <div className="header">
          <h1>Global Holidays – Visit London</h1>
          <p className="tagline">Top tourist places & easy booking</p>
        </div>
      </header>

      <main className="grid-container">
        <section className="grid" id="places">
          {tourPlaces.map((place) => (
            <article className="card" key={place.id}>
              <img alt={place.name} src={place.img} />
              <div className="card-body">
                <h2>{place.name}</h2>
                <p>{place.desc}</p>
                <div className="meta">
                  <span>Duration: {place.duration}</span>
                  <strong>Price: {place.displayPrice}</strong>
                </div>
                
               
                <Link 
                  to="/bookmodel" 
                  state={{ name: place.name, price: place.price }}
                  className="btn book-btn"
                  style={{ textDecoration: 'none' }}
                >
                  Book Now
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="info-box">
          <h3>Plan your trip</h3>
          <p>Choose a place, click "Book Now" and complete the simple booking form.</p>
        </section>
      </main>
    </>
  );
};

export default LondonTour;
