import "./style.css";
import { createAntiDriftTimer } from "./anti-drift-timer";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App container not found");
}

app.innerHTML = `
  <main class="flash-sale">
    <section class="sale-card">
      <p class="eyebrow">VIETNAM MEGA SALE · FLASH SALE</p>

      <h1>Midnight Flash Sale</h1>

      <p class="description">
        Săn deal giới hạn trước khi sản phẩm cháy hàng!
      </p>

      <div class="countdown" aria-label="Flash sale countdown">
        <div class="time-box">
          <strong id="hours">00</strong>
          <span>GIỜ</span>
        </div>

        <div class="time-box">
          <strong id="minutes">00</strong>
          <span>PHÚT</span>
        </div>

        <div class="time-box">
          <strong id="seconds">00</strong>
          <span>GIÂY</span>
        </div>

        <div class="time-box milliseconds">
          <strong id="milliseconds">000</strong>
          <span>MILI-GIÂY</span>
        </div>
      </div>

      <p id="status" class="status" aria-live="polite">
        Flash Sale đang chuẩn bị...
      </p>

      <button id="start-button" type="button">
        BẮT ĐẦU FLASH SALE
      </button>
    </section>
  </main>
`;

const hoursElement = document.querySelector<HTMLSpanElement>("#hours");
const minutesElement = document.querySelector<HTMLSpanElement>("#minutes");
const secondsElement = document.querySelector<HTMLSpanElement>("#seconds");
const millisecondsElement =
  document.querySelector<HTMLSpanElement>("#milliseconds");
const statusElement = document.querySelector<HTMLParagraphElement>("#status");
const startButton = document.querySelector<HTMLButtonElement>("#start-button");

if (
  !hoursElement ||
  !minutesElement ||
  !secondsElement ||
  !millisecondsElement ||
  !statusElement ||
  !startButton
) {
  throw new Error("Flash sale UI elements not found");
}

let stopTimer: (() => void) | null = null;

function updateCountdown(remaining: number) {
  const totalSeconds = Math.floor(remaining / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = remaining % 1000;

  hoursElement.textContent = String(hours).padStart(2, "0");
  minutesElement.textContent = String(minutes).padStart(2, "0");
  secondsElement.textContent = String(seconds).padStart(2, "0");
  millisecondsElement.textContent = String(milliseconds).padStart(3, "0");

  if (remaining <= 0) {
    statusElement.textContent = "FLASH SALE ĐÃ BẮT ĐẦU!";
    startButton.disabled = false;
  }
}

startButton.addEventListener("click", () => {
  stopTimer?.();

  startButton.disabled = true;
  statusElement.textContent = "Đang đếm ngược...";

  stopTimer = createAntiDriftTimer(10_000, updateCountdown);
});
