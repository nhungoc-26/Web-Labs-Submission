import "./inventory-state-machine.test";
import "./style.css";
import { createAntiDriftTimer } from "./anti-drift-timer";
import { InventoryStateMachine } from "./inventory-state-machine";

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
<div class="inventory-panel">
  <div>
    <span class="inventory-label">TỒN KHO</span>
    <strong id="stock">10</strong>
  </div>

  <div>
    <span class="inventory-label">TRẠNG THÁI</span>
    <strong id="inventory-state">AVAILABLE</strong>
  </div>
</div>

<button id="reserve-button" type="button">
  GIỮ SẢN PHẨM
</button>

<button id="checkout-button" type="button" disabled>
  THANH TOÁN
</button>
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
const stockElement = document.querySelector<HTMLElement>("#stock");
const inventoryStateElement =
  document.querySelector<HTMLElement>("#inventory-state");
const reserveButton =
  document.querySelector<HTMLButtonElement>("#reserve-button");
const checkoutButton =
  document.querySelector<HTMLButtonElement>("#checkout-button");
if (
  !hoursElement ||
  !minutesElement ||
  !secondsElement ||
  !millisecondsElement ||
  !statusElement ||
  !startButton ||
  !stockElement ||
  !inventoryStateElement ||
  !reserveButton ||
  !checkoutButton
) {
  throw new Error("Flash sale UI elements not found");
}

const hours = hoursElement;
const minutes = minutesElement;
const seconds = secondsElement;
const milliseconds = millisecondsElement;
const status = statusElement;
const button = startButton;
const stock = stockElement;
const inventoryState = inventoryStateElement;
const reserve = reserveButton;
const checkout = checkoutButton;

const inventory = new InventoryStateMachine(10);

function updateInventoryUI() {
  const snapshot = inventory.getSnapshot();

  stock.textContent = String(snapshot.stock);
  inventoryState.textContent = snapshot.state;

  checkout.disabled = snapshot.state !== "RESERVED";
  reserve.disabled = snapshot.state !== "AVAILABLE" || snapshot.stock <= 0;
}

let stopTimer: (() => void) | null = null;

function updateCountdown(remaining: number) {
  const totalSeconds = Math.floor(remaining / 1000);

  const hoursValue = Math.floor(totalSeconds / 3600);
  const minutesValue = Math.floor((totalSeconds % 3600) / 60);
  const secondsValue = totalSeconds % 60;
  const millisecondsValue = remaining % 1000;

  hours.textContent = String(hoursValue).padStart(2, "0");
  minutes.textContent = String(minutesValue).padStart(2, "0");
  seconds.textContent = String(secondsValue).padStart(2, "0");
  milliseconds.textContent = String(millisecondsValue).padStart(3, "0");

  if (remaining <= 0) {
    status.textContent = "FLASH SALE ĐÃ BẮT ĐẦU!";
    button.disabled = false;
  }
}

button.addEventListener("click", () => {
  stopTimer?.();

  button.disabled = true;
  status.textContent = "Đang đếm ngược...";

  stopTimer = createAntiDriftTimer(10_000, updateCountdown);
});

reserve.addEventListener("click", () => {
  const success = inventory.reserve(5_000);

  if (success) {
    status.textContent = "Đã giữ sản phẩm trong 5 giây!";
  } else {
    status.textContent = "Không thể giữ sản phẩm.";
  }

  updateInventoryUI();
});

checkout.addEventListener("click", () => {
  const success = inventory.checkout();

  if (success) {
    status.textContent = "THANH TOÁN THÀNH CÔNG!";
  } else {
    status.textContent = "Đơn giữ hàng đã hết hạn.";
  }

  updateInventoryUI();
});

updateInventoryUI();
