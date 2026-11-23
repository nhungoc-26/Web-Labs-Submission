import SwipeDeck from './SwipeDeck';

export default function App() {
  return (
    <div className="page">
      <header className="page__header">
        <h1>Hẹn Hò Nhưng Không Yêu 💔</h1>
        <p>Quẹt phải để thích (+10), quẹt trái hoặc friendzone thì trừ điểm (−5).</p>
      </header>
      <main>
        <SwipeDeck />
      </main>
    </div>
  );
}
