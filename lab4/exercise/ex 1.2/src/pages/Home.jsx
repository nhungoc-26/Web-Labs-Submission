
import { Link } from "react-router-dom";
import "./Home.css";

const people = [
  {
    id: 1,
    name: "Nguyen Van An",
    email: "an.nguyen@example.com",
    role: "Frontend Developer",
  },
  {
    id: 2,
    name: "Tran Thi Binh",
    email: "binh.tran@example.com",
    role: "UI/UX Designer",
  },
  {
    id: 3,
    name: "Le Minh Cuong",
    email: "cuong.le@example.com",
    role: "Backend Developer",
  },
];

export default function Home() {
  return (
    <main className="home-page">
      <header className="page-header">
        <p className="eyebrow">PERSON MANAGEMENT</p>
        <h1>People Directory</h1>
        <p>Explore our team members and their information.</p>
      </header>

      <section className="people-list" aria-label="People directory">
        {people.map((person) => (
          <article className="person-card" key={person.id}>
            <div>
              <h2>{person.name}</h2>
              <p>{person.email}</p>
              <span>{person.role}</span>
            </div>

            <Link
              to={`/person/${person.id}`}
              className="detail-link"
            >
              View Details →
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
