# AI Failure Mode Audit

## 1. Timer Drift Risk

### AI-generated approach

A simple `setInterval()` countdown could subtract a fixed amount of time on every interval.

### Failure

`setInterval()` does not guarantee exact execution timing. Browser scheduling delays can accumulate and cause the displayed countdown to drift from real time.

### Fix

The implementation calculates the remaining time from an absolute target timestamp:

`targetTime - Date.now()`

This makes the countdown resilient to timer scheduling delays.

---

## 2. Inventory Overselling Risk

### AI-generated approach

A basic implementation could check stock and then decrement it during checkout without enforcing a strict state transition.

### Failure

Multiple checkout attempts could potentially modify the same inventory incorrectly and cause stock to become negative or allow multiple purchases from one reservation.

### Fix

The `InventoryStateMachine` restricts transitions to valid states:

`AVAILABLE → RESERVED → CHECKED_OUT`

A reservation can only be checked out while it is still in the `RESERVED` state.

---

## 3. Reservation Expiry Risk

### AI-generated approach

A reservation could remain in `RESERVED` indefinitely if expiry is not explicitly handled.

### Failure

Expired reservations could block inventory permanently and prevent other users from purchasing the product.

### Fix

Each reservation stores a `reservedUntil` timestamp. The state machine checks the timestamp and transitions an expired reservation to `EXPIRED`, then releases it back to `AVAILABLE`.

---

## 4. Double Checkout Risk

### AI-generated approach

The UI could allow repeated checkout requests without checking the current inventory state.

### Failure

A second checkout request after the first successful checkout could incorrectly decrease stock again.

### Fix

`checkout()` only succeeds when the current state is `RESERVED`. Once checkout succeeds, the state becomes `CHECKED_OUT`, preventing another checkout.

---

## 5. Concurrency Test

A dedicated concurrency test verifies that:

- A second reservation fails while inventory is already reserved.
- A second checkout fails after the first checkout succeeds.
- Inventory stock never becomes negative.
- The final state is correctly `CHECKED_OUT`.

Test result:

`Inventory concurrency tests: PASS`
