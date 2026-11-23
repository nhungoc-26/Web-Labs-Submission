# Homework 3: FairPlayAppealPortal.jsx & useAppealSLATimer.js

Cổng kháng nghị Fair Play, gồm:
- **Hồ sơ nhiều route** cho 2 thành viên Himass và TanVuu.
- **Ma trận bất tương xứng** (Disproportionality Matrix), tính trong lúc render.
- **Đồng hồ SLA không trôi** (zero-drift), dùng Page Visibility API.

## Cấu trúc thư mục

```
homework/
├── hw1/
├── hw2/
└── hw3/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── README.md
    ├── mock-api/
    │   ├── plugin.js                 # API giả lập gắn vào Vite: /api/time, /api/dossiers/:user
    │   └── dossiers.js               # Dữ liệu mẫu 2 hồ sơ
    └── src/
        ├── main.jsx                  # BrowserRouter
        ├── FairPlayAppealPortal.jsx  # ⭐ Routes: /dossier/himass, /dossier/tanvuu
        ├── FairPlayAppealPortal.css
        ├── hooks/
        │   └── useAppealSLATimer.js  # ⭐ Hook đếm ngược zero-drift + visibilitychange
        ├── lib/
        │   └── computeMatrix.js      # ⭐ Hàm thuần tính ma trận
        └── components/
            ├── DossierView.jsx       # ⭐ useMemo(() => computeMatrix(dossierData), [dossierData])
            ├── DisproportionalityMatrix.jsx
            └── SlaCountdown.jsx
```

## Cách chạy

Bài này **không cần MongoDB và không cần chạy server riêng**: API giả lập được gắn thẳng vào Vite dev server.

```powershell
cd homework\hw3
npm install
npm run dev
```

Mở http://localhost:5173.

Các đường dẫn:
- `/` : trang tổng quan
- `/dossier/himass` : hồ sơ Himass (hạn SLA còn khoảng **36 giờ**, mức "còn trong hạn")
- `/dossier/tanvuu` : hồ sơ TanVuu (hạn SLA còn khoảng **45 phút**, mức "khẩn cấp")
- `/api/time` : giờ của server (JSON)

> Hạn SLA được tính từ **lúc khởi động `npm run dev`**. Nhấn F5 không làm reset đồng hồ vì deadline là mốc tuyệt đối do server giữ. Tắt rồi chạy lại `npm run dev` thì deadline được tính lại từ đầu.

## Đối chiếu Code Contract

### 1. Multi-Route Dossier routing (`FairPlayAppealPortal.jsx`)

```jsx
<Route path="/dossier/himass" element={<DossierView user="Himass" />} />
<Route path="/dossier/tanvuu" element={<DossierView user="TanVuu" />} />
```

Phần làm thêm:
- Thanh điều hướng dùng `NavLink`, link đang mở tự có `aria-current="page"`.
- Có route `*` cho trang 404 và link "Bỏ qua, tới nội dung chính" (skip link).
- Khi chuyển giữa Himass và TanVuu, React **dùng lại cùng một component** `DossierView`. Vì vậy `DossierView` reset dữ liệu cũ và huỷ request cũ bằng `AbortController`, để hồ sơ của người này không hiện nhầm sang người kia.
- Khi đổi route, tiêu đề tab được cập nhật và focus chuyển về tiêu đề `<h1>` của trang (hỗ trợ người dùng bàn phím và screen reader).

### 2. Disproportionality Derived Matrix (`DossierView.jsx` + `lib/computeMatrix.js`)

```jsx
const matrix = useMemo(() => computeMatrix(dossierData), [dossierData]);
```

- `computeMatrix` là **hàm thuần**: cùng input thì luôn cho cùng output, không gọi API, không đọc giờ hệ thống.
- Ma trận là **derived state**: không lưu vào `useState`. `useMemo` chỉ tính lại khi `dossierData` thay đổi, còn đồng hồ SLA render lại mỗi giây cũng **không** làm ma trận bị tính lại.
- Cách tính:
  - Mỗi vụ: `ratio = án thực tế / án chuẩn` theo mức độ vi phạm. Khung án chuẩn: mức 1 = 1 ngày, 2 = 3, 3 = 7, 4 = 14, 5 = 30.
  - `ratio > 1.5` là **Quá nặng**, `ratio < 0.67` là **Quá nhẹ**, còn lại là **Tương xứng**.
  - **Ma trận 2 chiều**: hàng là *loại vi phạm*, cột là *mức độ 1–5*. Mỗi ô = tổng án thực tế ÷ tổng án chuẩn của các vụ thuộc ô đó.
  - **Tổng hợp**: chỉ số tổng, số ngày dư so với khung, tỉ lệ vụ quá nặng, và đánh giá cơ sở kháng nghị (Mạnh / Trung bình / Yếu).

Kết quả với dữ liệu mẫu:

| Hồ sơ | Chỉ số tổng | Quá nặng | Cơ sở kháng nghị |
|---|---|---|---|
| Himass | ×2.08 (Quá nặng) | 2/4 vụ | Mạnh |
| TanVuu | ×1.47 (Tương xứng) | 2/5 vụ | Trung bình |

### 3. Zero-Drift Appeal SLA Countdown (`hooks/useAppealSLATimer.js`)

```js
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') resyncTimerWithServer();
  else clearTimeout(timeoutRef.current);
};
document.addEventListener('visibilitychange', handleVisibilityChange);
return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
```

Contract viết hàm xử lý inline (arrow function). Ở đây mình đặt tên cho hàm (`handleVisibilityChange`) để có thể **gỡ listener khi component unmount**, tránh rò rỉ bộ nhớ.

**Vì sao đồng hồ này không bị trôi:**

1. **Không trừ dần 1 giây.** Khi tab bị ẩn, máy sleep hoặc CPU bận, trình duyệt làm chậm `setInterval`/`setTimeout`, nên cách `remaining -= 1000` sẽ cộng dồn sai số. Hook này mỗi lần tick đều **tính lại từ mốc tuyệt đối**:
   ```
   remaining = deadline − (Date.now() + serverOffset)
   ```
2. **Đồng bộ với server kiểu NTP** (`resyncTimerWithServer`): gọi `/api/time`, đo round-trip time (RTT) bằng `performance.now()`, rồi tính
   ```
   offset = serverTime + RTT/2 − clientTime
   ```
   Nhờ vậy, kể cả khi người dùng chỉnh sai giờ máy, countdown vẫn đếm theo giờ server.
3. **Page Visibility API**: tab ẩn thì ngừng tick (tiết kiệm CPU và pin). Tab hiện lại thì đồng bộ lại với server và tính lại ngay, nên số hiện ra đúng tức thì, không bị trễ.
4. **Canh đúng mốc giây**: `delay = remaining % 1000`, nên số giây đổi đúng lúc và không nhảy cóc 2 giây.
5. **Chống request chồng nhau**: dùng `syncIdRef` để bỏ qua kết quả của những lần đồng bộ cũ. Trường hợp này xảy ra khi StrictMode chạy effect 2 lần, hoặc người dùng chuyển tab liên tục.
6. **Mất mạng** thì giữ nguyên offset cũ và tiếp tục đếm theo đồng hồ máy, đồng thời hiện trạng thái 🔴.

**Mức cảnh báo** (derived từ `remainingMs`):

| Mức | Điều kiện |
|---|---|
| ok | còn ≥ 24 giờ |
| warning | còn < 24 giờ |
| critical | còn < 1 giờ |
| breached | đã hết hạn |

**Accessibility:**
- Đồng hồ dùng `role="timer"` (mặc định `aria-live="off"`), nên screen reader không bị đọc lại mỗi giây.
- Chỉ thông báo qua vùng `aria-live="polite"` khi **đổi mức cảnh báo**.
- Màu luôn đi kèm chữ ("Quá nặng", "Khẩn cấp"…), không truyền thông tin chỉ bằng màu.

## Checklist tự test

**Routing**
1. Bấm "Hồ sơ Himass" rồi "Hồ sơ TanVuu": URL đổi, nội dung đổi, link đang mở có nền trắng.
2. Gõ thẳng `localhost:5173/dossier/tanvuu` vào thanh địa chỉ: vào thẳng hồ sơ TanVuu.
3. Gõ `localhost:5173/abc`: hiện trang "Không tìm thấy trang".
4. Bấm Back / Forward của trình duyệt: chuyển đúng giữa các hồ sơ.

**Ma trận**
5. Hồ sơ Himass: ô "Ngôn từ độc hại × Mức 2" màu đỏ, ghi **×4.67 Quá nặng**.
6. Hồ sơ TanVuu: ô "Phá game × Mức 3" màu xanh dương, ghi **×0.43 Quá nhẹ**.

**Đồng hồ SLA**
7. Đồng hồ chạy từng giây, dòng trạng thái báo 🟢 "Đã đồng bộ với server".
8. **Test chống trôi:** ghi lại số giây đang hiện, chuyển sang tab khác khoảng 1 phút, rồi quay lại. Số hiện ra ngay phải đúng (đã trừ khoảng 60 giây) và "Lần đồng bộ cuối" cập nhật thành giờ vừa quay lại.
9. F12 → **Network** → lọc **Fetch/XHR**, rồi chuyển tab đi và quay lại: mỗi lần quay lại có thêm một request `time`.
10. F5: đồng hồ **không** bị reset về 36:00:00 hoặc 45:00.
11. *(Nâng cao)* Chỉnh giờ Windows sai đi 5 phút rồi quay lại trang: "Lệch đồng hồ" hiện khoảng ±300000 ms, nhưng countdown vẫn đúng.
12. Hồ sơ TanVuu: viền đỏ, nhãn "Khẩn cấp (dưới 1 giờ)". Để đủ 45 phút sẽ chuyển sang "Đã quá hạn SLA".

## Gợi ý chụp minh chứng

| # | Ảnh | Chứng minh |
|---|---|---|
| 1 | Trang `/dossier/himass`, thấy URL + thanh nav | Route Himass |
| 2 | Trang `/dossier/tanvuu`, thấy URL + đồng hồ đỏ | Route TanVuu + mức critical |
| 3 | Bảng ma trận của Himass | Derived matrix |
| 4 | F12 → Network (Fetch/XHR) có nhiều request `time` sau khi chuyển tab | Resync qua visibilitychange |
| 5 | Phần đồng bộ: lệch đồng hồ, RTT, lần đồng bộ cuối | Đồng bộ kiểu NTP |
| 6 | Code `useAppealSLATimer.js`, đoạn `tick` + `visibilitychange` | Zero-drift |
| 7 | Code `DossierView.jsx`, dòng `useMemo` + `computeMatrix.js` | Derived state |
| 8 | Code `FairPlayAppealPortal.jsx`, đoạn `<Routes>` | Multi-route |
