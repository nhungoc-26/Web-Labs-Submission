import { Link, NavLink, Route, Routes } from 'react-router-dom';
import DossierView from './components/DossierView';
import './FairPlayAppealPortal.css';

/**
 * FairPlayAppealPortal — cổng kháng nghị Fair Play.
 * Mỗi thành viên (Himass, TanVuu) có một route hồ sơ riêng.
 * NavLink tự gắn aria-current="page" cho link đang active.
 */
export default function FairPlayAppealPortal() {
  return (
    <div className="portal">
      <a href="#main-content" className="skip-link">
        Bỏ qua, tới nội dung chính
      </a>

      <header className="portal__header">
        <Link to="/" className="portal__brand">
          <span aria-hidden="true">⚖️</span> Fair Play Appeal Portal
        </Link>
        <nav aria-label="Hồ sơ thành viên">
          <ul className="portal__nav">
            <li>
              <NavLink to="/" end>
                Tổng quan
              </NavLink>
            </li>
            <li>
              <NavLink to="/dossier/himass">Hồ sơ Himass</NavLink>
            </li>
            <li>
              <NavLink to="/dossier/tanvuu">Hồ sơ TanVuu</NavLink>
            </li>
          </ul>
        </nav>
      </header>

      <main id="main-content" className="portal__main">
        <Routes>
          <Route path="/" element={<PortalHome />} />

          {/* Multi-Route Dossier routing for team members Himass & TanVuu */}
          <Route path="/dossier/himass" element={<DossierView user="Himass" />} />
          <Route path="/dossier/tanvuu" element={<DossierView user="TanVuu" />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="portal__footer">
        Dữ liệu hồ sơ là dữ liệu mẫu cho bài tập (Homework 3).
      </footer>
    </div>
  );
}

function PortalHome() {
  return (
    <section className="home">
      <h1>Cổng kháng nghị Fair Play</h1>
      <p>
        Mỗi hồ sơ có <strong>ma trận bất tương xứng</strong> (so sánh án phạt thực tế với khung án chuẩn) và{' '}
        <strong>đồng hồ SLA</strong> đếm ngược hạn xử lý kháng nghị, đồng bộ theo đồng hồ server.
      </p>
      <ul className="home__cards">
        <li>
          <Link to="/dossier/himass" className="home__card">
            <span className="home__avatar" aria-hidden="true">
              🛡️
            </span>
            <span>
              <strong>Himass</strong>
              <span className="home__meta">Hạn SLA còn khoảng 36 giờ</span>
            </span>
          </Link>
        </li>
        <li>
          <Link to="/dossier/tanvuu" className="home__card">
            <span className="home__avatar" aria-hidden="true">
              🎯
            </span>
            <span>
              <strong>TanVuu</strong>
              <span className="home__meta">Hạn SLA còn khoảng 45 phút</span>
            </span>
          </Link>
        </li>
      </ul>
    </section>
  );
}

function NotFound() {
  return (
    <section className="home">
      <h1>Không tìm thấy trang</h1>
      <p>
        Đường dẫn này không tồn tại. <Link to="/">Quay về trang tổng quan</Link>.
      </p>
    </section>
  );
}
