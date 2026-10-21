import { InventoryStateMachine } from "./inventory-state-machine";

const inventory = new InventoryStateMachine(1);

const firstReservation = inventory.reserve(5_000);

console.assert(firstReservation === true, "First reservation should succeed");

const secondReservation = inventory.reserve(5_000);

console.assert(
  secondReservation === false,
  "Second reservation should fail because inventory is already RESERVED",
);

const firstCheckout = inventory.checkout();

console.assert(firstCheckout === true, "First checkout should succeed");

const secondCheckout = inventory.checkout();

console.assert(
  secondCheckout === false,
  "Second checkout should fail because inventory is already CHECKED_OUT",
);

console.assert(
  inventory.getSnapshot().stock === 0,
  "Stock must not become negative",
);

console.assert(
  inventory.getSnapshot().state === "CHECKED_OUT",
  "Final state should be CHECKED_OUT",
);

console.log("Inventory concurrency tests: PASS");
