import React from 'react';

const ServicesPage = ({ onNavigate }) => {
  return (
    <main>
      <section id="services" className="container grid">
        <article className="service-card">
          <h3>Men & Women — Cut & Style</h3>
          <p><strong>Price:</strong> Women $45 | Men $15</p>
          <p>Personalized consultations ensure your cut complements your hair texture, face shape, and lifestyle. Includes precision cutting, texturizing, and a styled finish.</p>
        </article>
        <article className="service-card">
          <h3>Washing & Scalp Care</h3>
          <p><strong>Price:</strong> From $10</p>
          <p>Enjoy a professional shampoo, conditioning, and targeted scalp treatment tailored to your needs. Includes a relaxing massage and product recommendations.</p>
        </article>
        <article className="service-card">
          <h3>Coloring & Color Health</h3>
          <p><strong>Price:</strong> From $80</p>
          <p>From full color to balayage, our services prioritize vibrant results and healthy hair. Consultations focus on tone, maintenance, and aftercare.</p>
        </article>
      </section>
      <section className="container" style={{ marginTop: '24px' }}>
        <p>Combine services like cut and color for a complete transformation. Book through your dashboard for accurate pricing and availability.</p>
        <button onClick={() => onNavigate('login')} className="btn btn-primary">Login to Book</button>
      </section>
    </main>
  );
};

export default ServicesPage;