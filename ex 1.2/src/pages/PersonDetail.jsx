
import { Link, useParams } from "react-router-dom";
import "./PersonDetail.css";

const people = {
  1: {
    name: "Nguyen Van An",
    email: "an.nguyen@example.com",
    role: "Frontend Developer",
    department: "Engineering",
    location: "Ho Chi Minh City",
  },
  2: {
    name: "Tran Thi Binh",
    email: "binh.tran@example.com",
    role: "UI/UX Designer",
    department: "Design",
    location: "Ha Noi",
  },
  3: {
    name: "Le Minh Cuong",
    email: "cuong.le@example.com",
    role: "Backend Developer",
    department: "Engineering",
    location: "Da Nang",
  },
};

export default function PersonDetail() {
  const { id } = useParams();
  const person = people[id];

  if (!person) {
    return (
      <main className="detail-page">
        <h1>Person Not Found</h1>
        <Link to="/">Back to Home</Link>
      </main>
    );
  }

  return (
    <main className="detail-page">
      <Link to="/" className="back-link">
        ← Back to Directory
      </Link>

      <article className="detail-card">
        <div className="detail-avatar" aria-hidden="true">
          {person.name.charAt(0)}
        </div>

        <h1>{person.name}</h1>
        <p className="detail-role">{person.role}</p>

        <dl className="person-information">
          <div>
            <dt>Email</dt>
            <dd>{person.email}</dd>
          </div>

          <div>
            <dt>Department</dt>
            <dd>{person.department}</dd>
          </div>

          <div>
            <dt>Location</dt>
            <dd>{person.location}</dd>
          </div>
        </dl>
      </article>
    </main>
  );
}
