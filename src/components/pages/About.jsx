import React from 'react';

const AboutPage = ({ onNavigate }) => {
  return (
    <main>
      <section className="container split">
        <div className="col">
          <h2>Our Story</h2>
          <p>Founded in 2019 by <strong>Maya Alvarez</strong> and <strong>Jordan Reed</strong> in a restored brick storefront near Sundance Square, The Modern Shear began as two chairs and has grown into a five‑station studio recognized for honest consultations and sustainable product choices.</p>
        </div>
        <div className="col">
          <h2>Philosophy</h2>
          <p>Precision + sustainability + community. Every visit includes a tailored plan for wearability and maintenance so styles look as good at home as they do in the chair.</p>
        </div>
      </section>
      <section className="container team">
        <h2>Meet the Team</h2>
        <ul>
          <li><strong>Maya Alvarez</strong> — Senior Stylist (cuts & bridal)</li>
          <li><strong>Jordan Reed</strong> — Color Director (balayage & color health)</li>
          <li><strong>Avery Chen</strong> — Barber (fades & texture)</li>
          <li><strong>Rosa Martinez</strong> — Colorist & Extensions</li>
        </ul>
      </section>
      <section className="container visit">
        <h2>Visit Us</h2>
        <p>Located near Sundance Square — walk-ins welcome when available; booking recommended.</p>
        <address>
          The Modern Shear<br />
          214 Main Street, Suite B<br />
          Fort Worth, TX 76102
        </address>
        <p><button onClick={() => onNavigate('home')} className="btn">Return to homepage</button></p>
      </section>
    </main>
  );
};

export default AboutPage;