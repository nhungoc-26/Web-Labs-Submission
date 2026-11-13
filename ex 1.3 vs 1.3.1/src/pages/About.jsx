function About() {
  return (
    <section className="about-page">
      <span className="eyebrow">ABOUT THIS PROJECT</span>

      <h1>About Us</h1>

      <p className="about-description">
        This project demonstrates modern routing architecture
        using React Router v7.
      </p>

      <div className="about-card">
        <h2>What We Practice</h2>

        <ul>
          <li>Replacing Switch with Routes</li>
          <li>Using the element prop to render components</li>
          <li>Building nested route layouts</li>
          <li>Rendering child routes with Outlet</li>
          <li>Highlighting active navigation links with NavLink</li>
        </ul>
      </div>
    </section>
  );
}

export default About;