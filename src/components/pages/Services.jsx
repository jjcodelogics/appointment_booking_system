import React from 'react';

const ServicesPage = ({ onNavigate }) => {
  return (
    <main>
      <section id="services-intro" className="container">
        <h2>Our Services</h2>
        <p>At The Modern Shear, we offer a range of services tailored to your needs. From precision cuts to vibrant coloring, our team ensures every visit leaves you looking and feeling your best.</p>
      </section>

      <section id="services" className="container split">
        <div className="col">
          <h3>Men & Women — Cut & Style</h3>
          <p><strong>Price:</strong> Women $45 | Men $15</p>
          <p>Personalized consultations ensure your cut complements your hair texture, face shape, and lifestyle. Includes precision cutting, texturizing, and a styled finish.</p>
        </div>
        <div className="col">
          <h3>Washing & Scalp Care</h3>
          <p><strong>Price:</strong> From $10</p>
          <p>Enjoy a professional shampoo, conditioning, and targeted scalp treatment tailored to your needs. Includes a relaxing massage and product recommendations.</p>
        </div>
      </section>

      <section id="services-more" className="container split">
        <div className="col">
          <h3>Coloring & Color Health</h3>
          <p><strong>Price:</strong> From $80</p>
          <p>From full color to balayage, our services prioritize vibrant results and healthy hair. Consultations focus on tone, maintenance, and aftercare.</p>
        </div>
        <div className="col">
          <h3>Combine Services</h3>
          <p>Combine services like cut and color for a complete transformation. Book through your dashboard for accurate pricing and availability.</p>
          <button onClick={() => onNavigate('login')} className="btn btn-primary">Login to Book</button>
        </div>
      </section>
    </main>
  );
};

export default ServicesPage;