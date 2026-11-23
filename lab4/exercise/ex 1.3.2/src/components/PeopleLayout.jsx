
import { NavLink, Outlet } from 'react-router';
import { people } from '../data/people';
import './PeopleLayout.css';

function PeopleLayout() {
  return (
    <div className="directory">
      <header className="directory-header">
        <div>
          <span className="header-label">TEAM MANAGEMENT</span>
          <h1>People Directory</h1>
          <p>Explore our team members and their information.</p>
        </div>

        <div className="member-count">
          <strong>{people.length}</strong>
          <span>Team Members</span>
        </div>
      </header>

      <div className="directory-grid">
        <aside className="people-sidebar">
          <h2>Our Team</h2>
          <p className="sidebar-description">
            Select a person to view their profile.
          </p>

          <div className="people-list">
            {people.map((person) => (
              <NavLink
                key={person.id}
                to={`/people/${person.id}`}
                className={({ isActive }) =>
                  isActive ? 'person-item active' : 'person-item'
                }
              >
                <div className="person-avatar">
                  {person.name.charAt(0)}
                </div>

                <div className="person-summary">
                  <strong>{person.name}</strong>
                  <span>{person.role}</span>
                </div>

                <span className="person-arrow">›</span>
              </NavLink>
            ))}
          </div>
        </aside>

        <section className="detail-panel">
          <Outlet />
        </section>
      </div>
    </div>
  );
}

export default PeopleLayout;
