
import { Navigate, Route, Routes } from 'react-router';
import PeopleLayout from './components/PeopleLayout';
import PersonDetail from './pages/PersonDetail';

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/people/1" replace />}
      />

      <Route path="/people" element={<PeopleLayout />}>
        <Route index element={<Navigate to="/people/1" replace />} />
        <Route path=":id" element={<PersonDetail />} />
      </Route>

      <Route
        path="*"
        element={<h1 className="page-not-found">404 - Page Not Found</h1>}
      />
    </Routes>
  );
}

export default App;
