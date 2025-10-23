import React from 'react';

const HomePage = ({ onNavigate }) => {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1>Elegance in Every Cut.</h1>
          <p className="lead">Experience modern hairdressing with a touch of classic sophistication.</p>
          <button onClick={() => onNavigate('login')} className="btn btn-primary">Login to book an Appointment!</button>
        </div>
      </section>
    </main>
  );
};

export default HomePage;