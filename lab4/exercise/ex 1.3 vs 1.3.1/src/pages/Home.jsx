function Home() {
  return (
    <section className="hero">
      <div className="hero-content">
        <span className="eyebrow">WELCOME TO OUR WEBSITE</span>

        <h1>
          Build Modern Apps with
          <span> React Router v7</span>
        </h1>

        <p>
          Explore declarative routing, nested layouts, and dynamic
          navigation with React Router.
        </p>

        <a href="/about" className="hero-button">
          Explore About →
        </a>
      </div>

      <div className="feature-grid">
        <div className="feature-card">
          <div className="feature-icon">🧭</div>
          <h3>Declarative Routing</h3>
          <p>Organize application routes using Routes and Route.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🏗️</div>
          <h3>Nested Layouts</h3>
          <p>Reuse shared layouts with the Outlet component.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">✨</div>
          <h3>Active Navigation</h3>
          <p>Highlight the current page using NavLink.</p>
        </div>
      </div>
    </section>
  );
}

export default Home;