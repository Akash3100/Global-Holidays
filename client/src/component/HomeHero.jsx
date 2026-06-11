import { useEffect, useState } from "react";
import Vid1 from "../video/vid-1.mp4";
import Vid2 from "../video/vid 2.mp4";
import Vid3 from "../video/vid 3.mp4";
import Vid5 from "../video/vid 5.mp4";
import Vid6 from "../video/vid 6.mp4";
import "./Home.css";

function HomeHero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const sliderData = [
    {
      video: Vid2,
      h1: "Wonderful.",
      span: "Island",
      p: '"Escape to a breathtaking island paradise where crystal-clear waters meet powdery white sands, and lush greenery sways in the gentle ocean breeze..."',
      link: "https://en.wikipedia.org/wiki/Island",
    },
    {
      video: Vid3,
      h1: "Camping.",
      span: "Enjoy",
      p: '"There is nothing quite like the magic of camping - where crackling campfires, starlit skies, and the whisper of the wilderness replace the noise of everyday life..."',
      link: "https://en.wikipedia.org/wiki/Camping",
    },
    {
      video: Vid1,
      h1: "Adventures.",
      span: "Off Road",
      p: '"Experience the thrill of adventure and the raw power of off-roading like never before! Whether you\'re conquering rugged trails..."',
      link: "https://en.wikipedia.org/wiki/Adventure",
    },
    {
      video: Vid6,
      h1: "Road Trip.",
      span: "Together",
      p: '"Hit the open road and let adventure guide your way! A road trip is the ultimate escape - where every mile brings new sights..."',
      link: "https://en.wikipedia.org/wiki/Road_trip",
    },
    {
      video: Vid5,
      h1: "Feel Nature.",
      span: "Relax",
      p: '"Step into nature\'s embrace and feel the world come alive around you. The rustle of leaves, the scent of rain-kissed earth..."',
      link: "https://en.wikipedia.org/wiki/Nature",
    },
  ];

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((slide) => (slide + 1) % sliderData.length);
    }, 5000);

    return () => clearInterval(slideTimer);
  }, [sliderData.length]);

  return (
    <section className="home" id="home">
      {sliderData.map((slide, index) => (
        <video
          key={index}
          className={`video-slide ${currentSlide === index ? 'active' : ''}`}
          src={slide.video}
          autoPlay
          muted
          loop
        />
      ))}

      {sliderData.map((slide, index) => (
        <div key={index} className={`content ${currentSlide === index ? 'active' : ''}`}>
          <h1>{slide.h1}<br /><span>{slide.span}</span></h1>
          <p>{slide.p}</p>
          <a href={slide.link} target="_blank" rel="noreferrer">
            Read More <i className="ri-arrow-right-line"></i>
          </a>
        </div>
      ))}

      <div className="media-icons">
        <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
          <i className="ri-facebook-fill"></i>
        </a>
        <a href="https://www.instagram.com/team_global_holidays?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" aria-label="Instagram">
          <i className="ri-instagram-line"></i>
        </a>
        <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X">
          <i className="ri-twitter-x-fill"></i>
        </a>
      </div>

      <div className="slider-navigation">
        {sliderData.map((_, index) => (
          <div
            key={index}
            className={`nav-btn ${currentSlide === index ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
          ></div>
        ))}
      </div>
    </section>
  );
}

export default HomeHero;
