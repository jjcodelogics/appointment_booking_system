import React from 'react';

const ContactPage = ({ onNavigate }) => {
  return (
    <main>
      <section className="container contact-grid" aria-label="Contact information and map">
        <div className="contact-card studio-info">
          <h2>Studio & Hours</h2>
          <div className="contact-meta">
            <div><strong>Address</strong><br />The Modern Shear<br />214 Main Street, Suite B<br />Fort Worth, TX 76102</div>
            <div><strong>Phone</strong><br />(817) 555-0198</div>
            <div><strong>Email</strong><br />hello@themodernshear.com</div>
            <div><strong>Hours</strong><br />Tue–Fri: 9:00 AM – 7:00 PM<br />Sat: 8:00 AM – 5:00 PM<br />Sun–Mon: Closed</div>
          </div>
          <h2 style={{ marginTop: '20px' }}>Social</h2>
          <ul className="social-list">
            <li><a href="#" aria-label="Instagram">@themodernshear</a></li>
            <li><a href="#" aria-label="Facebook">Facebook</a></li>
            <li><a href="#" aria-label="X">X</a></li>
          </ul>
          <div className="directions">
            <h2 style={{ marginTop: '20px' }}>Directions & Parking</h2>
            <p style={{ margin: 0 }}>Located near Sundance Square. Street parking, metered spots and nearby paid lots. Accessible entrance on Main Street; request assistance when booking.</p>
          </div>
          <button onClick={() => onNavigate('login')} className="btn-inline" style={{ marginTop: '20px' }}>Book an Appointment</button>
        </div>
        <div className="contact-card map-card">
          <h2>Find Us</h2>
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3355.3693048446326!2d-97.33497302487919!3d32.75593398506412!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864e7140dd81ce55%3A0x383ee717bb86c234!2s214%20Main%20St%20b%2C%20Fort%20Worth%2C%20TX%2076102%2C%20USA!5e0!3m2!1sen!2s!4v1760682218189!5m2!1sen!2s" width="100%" height="450" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
          <p style={{ marginTop: '12px', marginBottom: 0 }}><strong>Address</strong><br />214 Main Street, Suite B, Fort Worth, TX 76102</p>
          <p style={{ margin: '8px 0 0 0', color: '#555' }}>Tap the map to open in Google Maps for step-by-step directions.</p>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;