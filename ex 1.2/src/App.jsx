
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Skeleton from "./components/Skeleton";
import "./App.css";

// Dynamic imports: chỉ tải component khi cần
const PersonDetail = lazy(() =>
  import("./pages/PersonDetail")
);

function App() {
  return (
    <div className="app">
      <Suspense
        fallback={
          <Skeleton />
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/person/:id"
            element={<PersonDetail />}
          />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
