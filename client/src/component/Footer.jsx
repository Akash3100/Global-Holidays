import "./Footer.css";

function Footer() {
  return (
    <section className="footer">
      <div className="section__container footer__container">
        <h1>Global Holidays</h1>
        <div className="footer__socials">
          <span><a href="https://www.facebook.com" target="_blank" rel="noreferrer"><i className="ri-facebook-fill"></i></a></span>
          <span><a href="https://www.instagram.com/team_global_holidays?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer"><i className="ri-instagram-fill"></i></a></span>
          <span><a href="https://x.com" target="_blank" rel="noreferrer"><i className="ri-twitter-x-fill"></i></a></span>
        </div>
        <p>
          Cheap Romantic Vacations. Many people feel that there is a limited
          amount of abundance, wealth, or chance to succeed in life.
        </p>
        <ul className="footer__nav">
          <li className="footer__link"><a href="#home">Home</a></li>
          <li className="footer__link"><a href="#about">About</a></li>
          <li className="footer__link"><a href="#activities">Activities</a></li>
          <li className="footer__link"><a href="#discover">Discover</a></li>
          <li className="footer__link"><a href="#gallery-1">Gallery</a></li>
          <li className="footer__link"><a href="#contact">Contact</a></li>
        </ul>
      </div>
      <div className="footer__bar">
        Copyright &copy; 2025 Global Holidays. All rights reserved.
      </div>
    </section>
  );
}

export default Footer;
