
import { useParams } from 'react-router';
import { people } from '../data/people';
import NotFoundState from './NotFoundState';
import './PersonDetail.css';

function PersonDetail() {
  const { id } = useParams();

  const person = people.find((p) => p.id === id);

  if (!person) {
    return <NotFoundState />;
  }

  return (
    <article className="person-detail">
      <div className="detail-heading">
        <div className="large-avatar">
          {person.name.charAt(0)}
        </div>

        <div>
          <span className="detail-label">TEAM MEMBER PROFILE</span>
          <h2>{person.name}</h2>
          <p>{person.role}</p>
        </div>
      </div>

      <div className="detail-divider"></div>

      <h3>Personal Information</h3>

      <dl className="person-details">
        <dt>Name</dt>
        <dd>{person.name}</dd>

        <dt>Role</dt>
        <dd>{person.role}</dd>

        <dt>Email</dt>
        <dd>{person.email}</dd>

        <dt>Department</dt>
        <dd>{person.department}</dd>

        <dt>Location</dt>
        <dd>{person.location}</dd>

        <dt>Experience</dt>
        <dd>{person.experience}</dd>
      </dl>

      <div className="bio-section">
        <h3>About</h3>
        <p>{person.bio}</p>
      </div>
    </article>
  );
}

export default PersonDetail;
