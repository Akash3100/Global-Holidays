import { Link } from "react-router-dom"
import discover1 from "../image/discover-1.jpg"
import discover2 from "../image/discover-2.jpg"
import discover3 from "../image/discover-3.jpg"
import "./Discover.css"
function Discover() {
  const locations = [
    { name: "Norway", img: discover1, text: "Discover the untamed beauty of Norway, a land where rugged mountains, and enchanting northern lights paint a surreal backdrop." },
    { name: "London", img: discover2, text: "From urban rock climbing to twilight cycling through royal parks, London beckons adventure enthusiasts to embrace opportunities." },
    { name: "Japan", img: discover3, text: "From scaling the iconic peaks of Mount Fuji to immersing in the serenity, Japan offers adventurers a captivating cultural treasures." }
  ];

  return (
    <section className="discover" id="discover">
      <div className="section__container discover__container">
        <h2 className="section__header">Discover the most engaging places</h2>
        <p className="section__subheader">Let's see the world with us with you and your family.</p>
        <div className="discover__grid">
          {locations.map((loc, idx) => (
            <div key={idx} className="discover__card">
              <div className="discover__image">
                <img src={loc.img} alt={loc.name} />
              </div>
              <div className="discover__card__content">
                <h4>{loc.name}</h4>
                <p>{loc.text}</p>
                <Link to="/londontour">
                  <button type="button" className="discover__btn">
                    Discover More <i className="ri-arrow-right-line"></i>
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Discover
