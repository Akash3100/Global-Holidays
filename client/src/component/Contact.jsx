import "./Contact.css"
function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="section__container contact__container">
        <div className="contact__col">
          <h4>Contact a travel researcher</h4>
          <p>We always aim to reply within 24 hours.</p>
        </div>
        <div className="contact__col">
          <div className="contact__card">
            <a
              className="contact__icon-link"
              href="https://wa.me/918883388969"
              target="_blank"
              rel="noreferrer"
              aria-label="Contact Global Holidays on WhatsApp"
            >
              <i className="ri-phone-fill"></i>
            </a>
            <h4>Call us</h4>
            <h5><a href="tel:+918883388969">+91 8883388969</a></h5>
            <p>We are online now</p>
          </div>
        </div>
        <div className="contact__col">
          <div className="contact__card">
            <a
              className="contact__icon-link"
              href="https://mail.google.com/mail/?view=cm&fs=1&to=vinith.mariyan97@gmail.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Email Global Holidays in Gmail"
            >
              <i className="ri-mail-fill"></i>
            </a>
            <h4>Send us an enquiry</h4>
            <h5><a href="mailto:vinith.mariyan97@gmail.com">vinith.mariyan97@gmail.com</a></h5>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact
