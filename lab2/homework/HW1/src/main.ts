import "./style.css";
import { createDataGrid } from "./data-grid";

interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
  salary: number;
}

const employees: Employee[] = [
  {
    id: 1,
    name: "Alice Johnson",
    department: "Engineering",
    position: "Frontend Developer",
    salary: 3200,
  },
  {
    id: 2,
    name: "Benjamin Lee",
    department: "Marketing",
    position: "Marketing Manager",
    salary: 4100,
  },
  {
    id: 3,
    name: "Chloe Nguyen",
    department: "Engineering",
    position: "Backend Developer",
    salary: 3600,
  },
  {
    id: 4,
    name: "Daniel Smith",
    department: "Finance",
    position: "Financial Analyst",
    salary: 3900,
  },
  {
    id: 5,
    name: "Emma Wilson",
    department: "Human Resources",
    position: "HR Specialist",
    salary: 2800,
  },
  {
    id: 6,
    name: "Felix Tran",
    department: "Engineering",
    position: "QA Engineer",
    salary: 3000,
  },
  {
    id: 7,
    name: "Grace Miller",
    department: "Marketing",
    position: "Content Strategist",
    salary: 3100,
  },
  {
    id: 8,
    name: "Henry Pham",
    department: "Finance",
    position: "Accountant",
    salary: 3300,
  },
  {
    id: 9,
    name: "Isabella Brown",
    department: "Human Resources",
    position: "Recruiter",
    salary: 2900,
  },
  {
    id: 10,
    name: "Jack Nguyen",
    department: "Engineering",
    position: "Tech Lead",
    salary: 5200,
  },
  {
    id: 11,
    name: "Liam Davis",
    department: "Marketing",
    position: "SEO Specialist",
    salary: 3050,
  },
  {
    id: 12,
    name: "Mia Taylor",
    department: "Finance",
    position: "Finance Manager",
    salary: 4700,
  },
];

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App root element was not found.");
}

const heading = document.createElement("header");
heading.className = "page-heading";

const eyebrow = document.createElement("p");
eyebrow.className = "eyebrow";
eyebrow.textContent = "WORKFORCE MANAGEMENT";

const title = document.createElement("h1");
title.textContent = "Employee Directory";

const description = document.createElement("p");
description.className = "page-description";
description.textContent =
  "Search, sort, navigate, and select employee records using your mouse or keyboard.";

heading.append(eyebrow, title, description);

const summary = document.createElement("p");
summary.className = "selection-summary";
summary.setAttribute("role", "status");
summary.setAttribute("aria-live", "polite");
summary.textContent = "No employee selected yet.";

const grid = createDataGrid<Employee>({
  data: employees,
  ariaLabel: "Employee directory data grid",
  columns: [
    { header: "Employee", accessorKey: "name", sortable: true },
    { header: "Department", accessorKey: "department", sortable: true },
    { header: "Position", accessorKey: "position", sortable: true },
    { header: "Salary (USD)", accessorKey: "salary", sortable: true },
  ],
  onRowSelect: (employee) => {
    summary.textContent = `Selected: ${employee.name} — ${employee.department}`;
  },
});

const main = document.createElement("main");
main.className = "main-content";

const card = document.createElement("section");
card.className = "grid-card";
card.setAttribute("aria-label", "Employee data table");
card.append(grid);

main.append(heading, summary, card);
app.replaceChildren(main);
