import React from 'react';

const AboutPage = ({ onNavigate }) => {
  return (
    <main>
      <section id="our-story" className="container split">
        <div className="col">
          <h2>Our Story</h2>
          <p>
            Founded in 2019 by Maya Alvarez and Jordan Reed, The Modern Shear began as a two-chair
            studio and has grown into a five-station salon known for honest consultations and
            sustainable practices.
          </p>
        </div>
        <div className="col">
          <h2>Our Philosophy</h2>
          <p>
            Precision, sustainability, and community. Every visit includes a tailored plan to ensure
            your style is wearable, maintainable, and uniquely yours.
          </p>
        </div>
      </section>
      <section id="team-visit" className="container split">
        <div className="col">
          <h2>Meet the Team</h2>
          <ul>
            <li>Maya Alvarez — Senior Stylist</li>
            <li>Jordan Reed — Color Director</li>
            <li>Avery Chen — Barber</li>
            <li>Rosa Martinez — Colorist & Extensions Specialist</li>
          </ul>
        </div>
        <div className="col">
          <h2>Visit Us</h2>
          <p>
            Located near Sundance Square, we welcome walk-ins when available. Booking is
            recommended.
          </p>
          <address>
            The Modern Shear
            <br />
            214 Main Street, Suite B<br />
            Fort Worth, TX 76102
          </address>
          <button onClick={() => onNavigate('home')} className="btn btn-primary">
            Return to Homepage
          </button>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
