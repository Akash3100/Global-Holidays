import about from "../image/about.jpg"
import "./about.css"
function About() {
  return (
    <section className="about" id="about">
      <div className="section__container about__container">
        <div className="about__content">
          <h1 className="section__header">About us</h1>
          <p className="section__subheader">
            Our mission is to ignite the spirit of discovery in every traveler's
            heart, offering meticulously crafted itineraries that blend
            adrenaline-pumping activities with awe-inspiring landscapes. With a
            team of seasoned globetrotters, we ensure that every expedition is
            infused with excitement, grace our planet. Embark on a voyage of a
            lifetime with us, as we redefine the art of exploration.
          </p>
          <div className="about__flex">
            <div className="about__card">
              <h4>268</h4>
              <p>Completed Trips</p>
            </div>
            <div className="about__card">
              <h4>176</h4>
              <p>Tour Guides</p>
            </div>
            <div className="about__card">
              <h4>153</h4>
              <p>Destinations</p>
            </div>
          </div>
          <a href="https://en.wikipedia.org/wiki/Travel" target="_blank" rel="noreferrer">
            <button className="btn">
              Read More <i className="ri-arrow-right-line"></i>
            </button>
          </a>
        </div>
        <div className="about__image">
          <img src={about} alt="about" />
        </div>
      </div>
    </section>
  );
}

export default About