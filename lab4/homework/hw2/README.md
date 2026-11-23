# Homework 2: SwipeDeck — "Hẹn Hò Nhưng Không Yêu" Edition

Bài gồm 2 phần:

- **Frontend** (`client/`): React + Vite, component chính là `src/SwipeDeck.jsx`.
- **Backend** (`server/`): Express + Mongoose 8, file chính là `server.js`.

## Cấu trúc thư mục

```
homework/
├── hw1/
└── hw2/
    ├── README.md
    ├── client/
    │   ├── index.html
    │   ├── package.json
    │   ├── vite.config.js           # proxy /api -> http://localhost:5000
    │   └── src/
    │       ├── main.jsx
    │       ├── App.jsx
    │       ├── index.css
    │       ├── SwipeDeck.jsx        # ⭐ Code contract frontend
    │       ├── SwipeDeck.css
    │       └── data/fallbackProfiles.js
    └── server/
        ├── package.json
        ├── .env.example             # copy thành .env
        ├── server.js                # ⭐ Code contract backend
        ├── seed.js                  # nạp dữ liệu mẫu
        └── models/
            ├── Profile.js
            └── Swipe.js
```

## Cách chạy

### 0. Chuẩn bị MongoDB (chọn 1 trong 2 cách)

- **Cài trên máy:** cài *MongoDB Community Server* (Windows). Cài xong MongoDB tự chạy ở `mongodb://127.0.0.1:27017`.
- **MongoDB Atlas (cloud, miễn phí):** tạo cluster, rồi lấy connection string dạng `mongodb+srv://...`.

### 1. Backend (terminal thứ nhất)

```powershell
cd homework\hw2\server
copy .env.example .env      # rồi mở .env, sửa MONGODB_URI nếu cần
npm install
npm run seed                # nạp 8 hồ sơ mẫu (chỉ cần chạy 1 lần)
npm run dev                 # chạy server ở http://localhost:5000
```

Thấy 2 dòng `✅ Đã kết nối MongoDB` và `🚀 Server chạy tại http://localhost:5000` là backend đã chạy.
Kiểm tra nhanh bằng cách mở http://localhost:5000/api/profiles trên trình duyệt: sẽ thấy JSON danh sách hồ sơ.

### 2. Frontend (terminal thứ hai)

```powershell
cd homework\hw2\client
npm install
npm run dev
```

Mở http://localhost:5173.

> Nếu backend chưa chạy, frontend vẫn hoạt động với dữ liệu mẫu, kèm thông báo màu vàng "Không kết nối được backend". Trường hợp này lượt quẹt không được lưu vào database.

## Đối chiếu Code Contract — Frontend (`SwipeDeck.jsx`)

| Yêu cầu | Cài đặt |
|---------|---------|
| **Keyboard Navigation Mapping** | `handleKeyDown`: `ArrowLeft` → `swipe('left')`, `ArrowRight` → `swipe('right')`, `ArrowUp` → `swipe('up')`, `Backspace` → `undoLastSwipe()`. Gắn vào `<div onKeyDown={handleKeyDown} tabIndex={0}>`. Có thêm `preventDefault()` để mũi tên không cuộn trang và Backspace không làm trình duyệt quay lại trang trước. |
| **Pointer Event Gesture Tracking** | `const [startPos, setStartPos] = useState(null)`. `handlePointerDown` lưu `{ x: e.clientX, y: e.clientY }`. `handlePointerUp` tính `dx`: lớn hơn 50 → right, nhỏ hơn −50 → left. Có thêm guard `startPos === null`, `setPointerCapture`, kéo lên quá 50px → up, và hiệu ứng thẻ đi theo tay khi kéo. |
| **LIFO Undo Stack** | `const [history, setHistory] = useState([])`. Mỗi lần swipe thì push `[...prev, action]`. Undo thì `setHistory(prev => prev.slice(0, -1))`, tức là bỏ phần tử vào sau cùng (Last In, First Out). |
| **Asymmetric Score Derived State** | `score = history.reduce(...)`: `LIKE` được **+10**, các loại còn lại (`NOPE`, `FRIENDZONE`) bị **−5**. Không có `useState` nào cho điểm, điểm được tính lại mỗi lần render. |

**Mapping hướng quẹt sang loại hành động:**

| Hướng | Phím | `type` | Điểm |
|-------|------|--------|------|
| right | → | `LIKE` | +10 |
| left | ← | `NOPE` | −5 |
| up | ↑ | `FRIENDZONE` | −5 |

**Thẻ hiện tại cũng là derived state:** `currentProfile = profiles[history.length]`. Nhờ vậy khi undo (pop stack), thẻ vừa quẹt tự quay lại và điểm tự tính lại, không cần đồng bộ thêm state nào.

## Đối chiếu Code Contract — Backend (`server.js`)

| # | Yêu cầu | Cài đặt |
|---|---------|---------|
| 1 | Bảo vệ biến môi trường | `if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing');`. Connection string nằm trong `.env`, file này được `.gitignore` bỏ qua, không bị commit. |
| 2 | Cú pháp kết nối hiện đại | `await mongoose.connect(process.env.MONGODB_URI);`, **không có** `useNewUrlParser` / `useUnifiedTopology` (2 cờ này đã bị bỏ từ Mongoose 6, đến Mongoose 8 thì không còn). Dùng top-level `await` vì project là ES Module (`"type": "module"`). |
| 3 | GET async/await + `.lean()` | `GET /api/profiles` → `Profile.find().lean()`, trả về plain object, nhanh hơn khi chỉ cần đọc. |
| 4 | POST async/await + try/catch | `POST /api/swipe` → `Swipe.create(req.body)`. Thành công trả **201**, lỗi validate (thiếu `profileId`, `type` sai enum...) trả **400** `{ error }`. |

## Checklist tự test

**Frontend**
1. Nhấn → : điểm +10, thẻ tiếp theo hiện ra.
2. Nhấn ← hoặc ↑ : điểm −5.
3. Nhấn Backspace : thẻ vừa quẹt quay lại, điểm tính lại đúng. Undo nhiều lần sẽ đi ngược đúng thứ tự LIFO (mở mục "Undo stack" để xem).
4. Dùng chuột kéo thẻ sang phải hoặc trái quá 50px rồi thả : quẹt. Kéo ít hơn 50px : thẻ bật về chỗ cũ.
5. Quẹt hết thẻ : hiện "Hết người để hẹn hò rồi 😅" kèm tổng điểm.

**Backend**
6. Mở http://localhost:5000/api/profiles : thấy JSON.
7. Quẹt vài thẻ, rồi mở MongoDB Compass xem collection `swipes` : có bản ghi mới.
8. F12 → tab Network, quẹt một thẻ : request `POST /api/swipe` trả status **201**.
9. Đổi tên file `.env` thành tên khác rồi chạy `npm run dev` : server dừng ngay với lỗi `MONGODB_URI missing`.
10. Gửi body sai (thiếu `profileId`) bằng Postman/Thunder Client : nhận status **400** và `{ "error": "..." }`.

> Ghi chú: undo chỉ xử lý ở frontend (đúng như contract). Lượt quẹt đã gửi lên server vẫn nằm trong collection `swipes` như một log lịch sử.
