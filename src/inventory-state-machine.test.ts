import { InventoryStateMachine } from "./inventory-state-machine";

const inventory = new InventoryStateMachine(2);

console.assert(
  inventory.getSnapshot().state === "AVAILABLE",
  "Initial state should be AVAILABLE",
);

console.assert(
  inventory.getSnapshot().stock === 2,
  "Initial stock should be 2",
);

const reserved = inventory.reserve(5000);

console.assert(reserved === true, "Reservation should succeed");

console.assert(
  inventory.getSnapshot().state === "RESERVED",
  "State should become RESERVED",
);

const checkedOut = inventory.checkout();

console.assert(
  checkedOut === true,
  "Checkout should succeed before lock expiry",
);

console.assert(
  inventory.getSnapshot().state === "CHECKED_OUT",
  "State should become CHECKED_OUT",
);

console.assert(
  inventory.getSnapshot().stock === 1,
  "Stock should decrease after checkout",
);

const secondInventory = new InventoryStateMachine(1);

console.assert(
  secondInventory.reserve(1) === true,
  "Second reservation should succeed",
);

setTimeout(() => {
  const expired = secondInventory.expireReservation();

  console.assert(
    expired === true,
    "Reservation should expire after lock duration",
  );

  console.assert(
    secondInventory.getSnapshot().state === "EXPIRED",
    "State should become EXPIRED",
  );

  const released = secondInventory.releaseExpiredReservation();

  console.assert(released === true, "Expired reservation should be released");

  console.assert(
    secondInventory.getSnapshot().state === "AVAILABLE",
    "State should return to AVAILABLE",
  );

  console.log("Inventory State Machine tests: PASS");
}, 10);
