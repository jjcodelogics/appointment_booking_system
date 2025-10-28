import React from 'react';

const HomePage = ({ onNavigate }) => {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1>Elegance in Every Cut</h1>
          <p className="lead">
            Discover modern hairdressing with a touch of timeless sophistication.
          </p>
          <button onClick={() => onNavigate('login')} className="btn btn-primary">
            Login to Book an Appointment
          </button>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
