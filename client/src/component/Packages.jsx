import gallery3 from "../image/gallery-3.jpg";
import gallery32 from "../image/gallery-32.jpg";
import "./Packages.css";

function Packages() {
  return (
    <section className="packages-section">
      <h1 className="title">Our Travel Packages</h1>
      <div className="cards-container">
        <div className="card">
          <img src={gallery3} alt="Domestic Package" className="card-img" />
          <div className="card-content">
            <h2>Domestic Package</h2>
            <p>Explore the beauty of India - from the majestic Himalayas to the sunny beaches of Goa. Enjoy curated experiences, comfortable stays, and hassle-free travel.</p>
            <a href="#gallery-1"><button className="btn">View Details</button></a>
          </div>
        </div>

        <div className="card">
          <img src={gallery32} alt="International Package" className="card-img" />
          <div className="card-content">
            <h2>International Package</h2>
            <p>Discover breathtaking international destinations - from Paris to Bali. Experience luxury tours, global cuisines, and unforgettable adventures worldwide.</p>
            <a href="#gallery-2"><button className="btn">View Details</button></a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Packages;
