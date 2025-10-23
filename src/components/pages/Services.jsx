import React from 'react';

const ServicesPage = ({ onNavigate }) => {
  return (
    <main>
      <section className="container split">
        <article className="service-card" id="man-female">
          <h3>Men & Women — Cut & Style</h3>
          <p className="meta"><strong>Who it's for:</strong> Short to long hair; men, women, and non-binary clients.</p>
          <p>Personalized consultations ensure the cut fits your hair texture, face shape, and lifestyle. Includes precision cutting, texturizing, and a style finish (blow-dry or matte product for men).</p>
          <p className="note"><strong>Typical time:</strong> 30–75 minutes. <strong>Recommended when:</strong> you want a fresh shape, maintenance trim, or a new look.</p>
        </article>
        <article className="service-card" id="washing">
          <h3>Washing & Scalp Care</h3>
          <p className="meta"><strong>Who it's for:</strong> All clients — add-on to any service or standalone treatment.</p>
          <p>Professional shampoo, conditioning, and targeted scalp treatment tailored to your needs (hydrating, clarifying, or balancing). Includes a gentle massage and product recommendations for home care.</p>
          <p className="note"><strong>Typical time:</strong> 10–25 minutes. <strong>Recommended when:</strong> you want a relaxing prep before a cut or a focused scalp treatment.</p>
        </article>
        <article className="service-card" id="coloring">
          <h3>Coloring & Color Health</h3>
          <p className="meta"><strong>Who it's for:</strong> Clients seeking full color, gloss, highlights, or balayage.</p>
          <p>Color consultations focus on tone, maintenance, and hair health. Services include single-process color, highlights, balayage, and color-refresh glosses. We prioritize bond-protecting products and post-color care plans to keep color vibrant and hair strong.</p>
          <p className="note"><strong>Typical time:</strong> 45–180 minutes depending on service. <strong>Recommended when:</strong> updating your color, covering gray, or adding dimension.</p>
        </article>
      </section>
      <section className="container" style={{ marginTop: '24px' }}>
        <p className="note">For combined services (e.g., cut + color) allow extra time; book through the dashboard to see accurate pricing and staff availability.</p>
        <p><button onClick={() => onNavigate('login')} className="btn btn-primary">Login to book!</button></p>
      </section>
    </main>
  );
};

export default ServicesPage;