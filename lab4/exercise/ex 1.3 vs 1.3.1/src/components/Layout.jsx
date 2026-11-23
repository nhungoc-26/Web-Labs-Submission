
import { NavLink, Outlet } from 'react-router';
import './Layout.css';

function Layout() {
  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <NavLink to="/" end className="logo">
            React Router
          </NavLink>

          <div className="nav-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              About
            </NavLink>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>© 2026 React Router v7 Practice. All rights reserved.</p>
      </footer>
    </>
  );
}

export default Layout;
