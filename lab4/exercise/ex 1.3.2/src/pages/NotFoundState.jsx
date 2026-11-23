
import { Link } from 'react-router';

function NotFoundState() {
  return (
    <div className="not-found">
      <div className="not-found-icon">🔍</div>

      <h2>Person Not Found</h2>

      <p>
        Sorry, we couldn't find a team member with this ID.
        The person may have been removed or the URL is invalid.
      </p>

      <Link to="/people/1" className="back-button">
        Back to Directory
      </Link>
    </div>
  );
}

export default NotFoundState;
