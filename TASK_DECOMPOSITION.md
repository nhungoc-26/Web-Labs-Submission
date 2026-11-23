# Task Decomposition: Sprint Planning & Work Breakdown

Mỗi lab là một sprint. Các task bên dưới khớp với commit thật trong lịch sử repo (xem bằng `git log -- lab2/`, `git log -- lab3/`, `git log -- lab4/`).

---

## Sprint 1: Lab 2 · Foundations & Synchronous State

**Mục tiêu:** hiểu React từ gốc bằng cách tự viết mini-React, quản lý state đồng bộ, và áp dụng state machine.

### Exercise (`lab2/exercise`, 16/10/2026)
| # | Task | Commit |
|---|------|--------|
| 1.1 | `createElement` factory | `feat(core): implement createElement factory` |
| 1.2 | `renderToDOM` | `feat(core): implement renderToDOM` |
| 2.1 | `stateStore` + `resetCursor` engine | `feat(state): implement stateStore and resetCursor engine` |
| 2.2 | Dispatcher `useState` reactive | `feat(state): implement reactive useState dispatcher` |
| 2.3 | Event delegation ở root | `feat(events): attach root event delegation listener` |
| 2.4 | Ghép thành ứng dụng todo reactive | `feat(ui): assemble reactive todo application` |
| 3.1 | Component nhiều trạng thái + skeleton | `feat(ui): implement multi-state data component with skeleton feedback` |

### Homework (`lab2/homework`, 20–21/10/2026)
| # | Task | Commit |
|---|------|--------|
| HW1 | Data grid accessible (TypeScript) | `Add HW1 accessible production data grid` |
| HW2 | Hàng đợi FIFO cho audio visualizer | `Add HW2 FIFO audio visualizer queue engine` |
| HW3.1 | Countdown chống drift | `feat(timer): implement anti-drift countdown` |
| HW3.2 | State machine giữ hàng tồn kho | `feat(inventory): implement reservation state machine` |
| HW3.3 | Dashboard tồn kho flash-sale | `feat(ui): add flash-sale inventory dashboard` |
| HW3.4 | Xử lý giữ hàng hết hạn | `feat(lock): implement reservation expiry handling` |
| HW3.5 | Optimistic checkout | `feat(checkout): implement optimistic checkout flow` |
| HW3.6 | Test race condition tồn kho | `test(concurrency): verify inventory race conditions` |
| HW3.7 | AI failure audit | `docs(audit): add AI failure mode audit` |
| HW3.8 | Kiểm tra bản build production | `test(build): verify production flash-sale engine` |

---

## Sprint 2: Lab 3 · Asynchronous Hooks & REST APIs

**Mục tiêu:** component React, xử lý danh sách bất biến, fetch bất đồng bộ có huỷ request, UI 4 trạng thái.

### Exercise (`lab3/exercise`, 01/11/2026)
| # | Task | Commit |
|---|------|--------|
| Ex1 | `DeveloperCard` + CSS Modules | `feat: implement DeveloperCard exercise 1` |
| Ex2.1 | Chuẩn hoá schema `smartPeople`, ID ổn định | `feat(ex2): normalize smartPeople schema with stable IDs` |
| Ex2.2 | Tìm kiếm, lọc IQ, `toSorted` | `feat(ex2): add search, IQ filter & toSorted` |
| Ex2.3 | Xoá / reset + trạng thái live | `feat(ex2): add delete/reset & live status` |
| Ex3.1 | Telemetry 4 trạng thái + `AbortController` | `feat(ex3): implement PUBG VN 4-state telemetry & AbortController` |
| Ex3.2 | Skeleton UI + cảnh báo retry | `feat(ex3): add skeleton UI & retry alert` |

### Homework (`lab3/homework`, 07/11/2026)
| # | Task | Commit |
|---|------|--------|
| HW1 + HW2 | Drum kit (DecibelMeter), Piano studio | `feat: add HW1 drum kit and HW2 piano studio` |
| HW3 | PUBG Airdrop Arena: timer có server offset, claim lock bằng ref, idempotent claim, AI audit | `feat: complete HW3 PUBG Airdrop Arena` |

---

## Sprint 3: Lab 4 · Full-Stack Contracts & Defense

**Mục tiêu:** routing và code splitting, làm đúng code contract end-to-end (frontend + backend), WCAG 2.2 AA, đồng hồ zero-drift.

### Exercise (`lab4/exercise`, 13/11/2026)
| # | Task | Commit |
|---|------|--------|
| 1.2 | Code splitting | `feat: complete Exercise 1.2 code splitting` |
| 1.3 / 1.3.1 | React Router v7 | `feat: complete Exercise 1.3 React Router v7` |
| 1.3.2 | Mở rộng routing | `feat: complete Exercise 1.3.2` |
| 1.6 | Exercise 1.6 | `feat: complete Exercise 1.6` |
| 1.7 / 1.7.1 | Fetch dữ liệu forum + validate API | `feat: complete Exercise 1.7`, `feat: complete exercise 1.7.1 ...` |

### Homework (`lab4/homework`, 22–23/11/2026)

**HW1: `PhotoGalleryLayout.jsx` + native `<dialog>`**
- [x] Đồng bộ `photoId` với URL qua `useSearchParams`
- [x] `useEffect` gọi `showModal()` / `close()`, có guard `!dialog.open`
- [x] `onClose` ghi ngược vào URL, không push history thừa khi bấm Back
- [x] Focus: khi mở thì vào nút Đóng, khi đóng thì trả về đúng thumbnail (kể cả khi vào bằng deep-link)
- [x] Kiểm tra WCAG 2.2 AA: 2.1.2, 2.4.3, 2.4.7, 2.4.11, 2.5.8

**HW2: `SwipeDeck.jsx` + Express/Mongoose 8**
- [x] Bàn phím: ← → ↑ Backspace
- [x] Pointer events, ngưỡng 50px, có guard `startPos === null`
- [x] Undo stack LIFO; thẻ hiện tại là derived state `profiles[history.length]`
- [x] Điểm bất đối xứng: LIKE +10, loại khác −5 (derived)
- [x] Backend: guard `MONGODB_URI`, `mongoose.connect` không dùng cờ cũ, `GET` dùng `.lean()`, `POST` có try/catch (trả 201 hoặc 400)
- [x] Seed dữ liệu, proxy Vite `/api`, fallback khi không có backend

**HW3: `FairPlayAppealPortal.jsx` + `useAppealSLATimer.js`**
- [x] Route `/dossier/himass`, `/dossier/tanvuu` (+ trang tổng quan, 404)
- [x] `computeMatrix` thuần + `useMemo`: ma trận loại vi phạm × mức độ
- [x] Hook SLA: tính theo mốc tuyệt đối, offset server kiểu NTP, `visibilitychange` gọi resync, canh đúng mốc giây
- [x] Mock API gắn vào Vite (`/api/time`, `/api/dossiers/:user`)

**Nộp bài**
- [x] Gộp 5 repo cũ bằng `git subtree` (giữ lịch sử)
- [x] Viết `project-rules.md`, `TASK_DECOMPOSITION.md`, `AI_FAILURE_AUDIT.md`, `.env.example`
- [ ] Chụp ảnh minh chứng cho hw1–hw3 (danh sách ảnh có trong README từng bài)
