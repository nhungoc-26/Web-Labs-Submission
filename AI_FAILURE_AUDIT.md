# AI Failure Audit: Documented AI Hallucinations & Manual Fixes

File này tổng hợp các lỗi do AI gây ra (code AI sinh ra, code mẫu trong đề, hoặc hướng dẫn của AI) đã được phát hiện trong cả 3 lab, kèm cách sửa thủ công.
Audit chi tiết của từng bài:

- Lab 2 · HW3: [`lab2/homework/HW3/AI_FAILURE_AUDIT.md`](lab2/homework/HW3/AI_FAILURE_AUDIT.md)
- Lab 3 · HW3: [`lab3/homework/HW3/AI_FAILURE_AUDIT.md`](lab3/homework/HW3/AI_FAILURE_AUDIT.md)

Mỗi mục ghi theo 3 phần: **AI đề xuất / code contract**, **lỗi xảy ra**, **cách sửa**.

---

## Lab 2: Foundations & Synchronous State

| # | AI đề xuất | Lỗi | Cách sửa |
|---|---|---|---|
| L2-1 | Countdown dùng `setInterval`, mỗi tick trừ một lượng cố định | `setInterval` không chạy đúng giờ, sai số cộng dồn | Tính theo mốc tuyệt đối: `targetTime - Date.now()` |
| L2-2 | Kiểm tra tồn kho rồi trừ, không có state machine | Bán vượt số lượng, tồn kho âm, một lượt giữ hàng mua được nhiều lần | `InventoryStateMachine`: `AVAILABLE → RESERVED → CHECKED_OUT` |
| L2-3 | Lượt giữ hàng không có hạn | Hàng bị khoá vĩnh viễn | Thêm `reservedUntil`, quá hạn thì chuyển `EXPIRED` rồi trả về `AVAILABLE` |
| L2-4 | UI cho bấm checkout nhiều lần | Trừ tồn kho 2 lần | `checkout()` chỉ chạy được khi đang ở trạng thái `RESERVED`; có test concurrency |

## Lab 3: Asynchronous Hooks & REST APIs

| # | AI đề xuất | Lỗi | Cách sửa |
|---|---|---|---|
| L3-1 | Countdown dùng `setInterval` | Bị trôi khi tab ẩn | `Math.max(0, targetEpochMs - (Date.now() + serverOffsetMs))` + resync khi `visibilitychange` |
| L3-2 | Chặn double-click bằng state `isClaiming` | `setState` cập nhật bất đồng bộ, click nhanh vẫn lọt | Khoá bằng `useRef` (`claimLockRef`), chặn được ngay lập tức |
| L3-3 | Kiểm tra claim ID đã xử lý chưa rồi mới chạy | 2 request trùng ID đến cùng lúc thì cả hai cùng chạy | 2 Map: `processedClaims` và `pendingClaims` (dùng lại promise đang chạy) |
| L3-4 | Trừ kho mà không kiểm tra còn hàng | Kho âm | Kiểm tra kho phía server, hết hàng thì throw `ClaimConflictError` (409), UI chuyển sang `LOOTED_OUT` |

## Lab 4: Full-Stack Contracts & Defense

Các lỗi dưới đây là **lỗi thật** nằm trong code contract của đề hoặc bản nháp đầu tiên của AI, phát hiện được khi cài đặt.

### L4-1 · HW1: `onClose` push thêm history khi bấm Back
- **Contract:** `<dialog onClose={() => setSearchParams({})}>`
- **Lỗi:** Khi người dùng bấm Back, URL mất `photoId`, effect gọi `close()`, sự kiện `close` chạy và lại gọi `setSearchParams({})`. Kết quả là history bị **push thêm một entry thừa**.
- **Sửa:** Chỉ ghi URL khi URL còn `photoId`: `if (searchParams.has('photoId')) setSearchParams({})`.

### L4-2 · HW1: `showModal()` ném `InvalidStateError`
- **Contract:** `if (selectedPhotoId) dialogRef.current?.showModal();`
- **Lỗi:** Gọi `showModal()` khi dialog đang mở ở dạng non-modal sẽ ném lỗi. Thêm nữa, StrictMode chạy effect 2 lần.
- **Sửa:** Thêm guard `if (!dialog.open) dialog.showModal()`. Đồng thời không mở modal khi `photoId` không hợp lệ, và dọn URL bằng `replace`.

### L4-3 · HW1: Không trả được focus khi vào bằng deep-link
- **Lỗi:** Khi vào thẳng bằng `?photoId=5`, trước đó chưa có phần tử nào được focus, nên đóng modal xong focus rơi về `<body>` (vi phạm WCAG 2.4.3).
- **Sửa:** Lưu ref của từng thumbnail. Trong `onClose`, focus vào đúng thumbnail của ảnh vừa xem.

### L4-4 · HW2: `handlePointerUp` crash khi `startPos` là `null`
- **Contract:** `const dx = e.clientX - startPos.x;`
- **Lỗi:** Nếu `pointerup` xảy ra mà trước đó không có `pointerdown` trên thẻ (ví dụ nhấn chuột ngoài thẻ rồi thả lên thẻ), sẽ bị **TypeError: Cannot read properties of null**.
- **Sửa:** Thêm `if (!startPos) return;`, dùng `setPointerCapture`, và reset `startPos` sau khi thả. Trên CSS thêm `touch-action: none` để vuốt được trên màn hình cảm ứng.

### L4-5 · HW2: Phím mũi tên làm cuộn trang, Backspace làm quay lại trang trước
- **Lỗi:** `handleKeyDown` trong contract không chặn hành vi mặc định của trình duyệt.
- **Sửa:** Gọi `e.preventDefault()` cho 4 phím ← → ↑ Backspace.

### L4-6 · HW2: Cờ Mongoose đã bị bỏ
- **AI hay đề xuất (theo kiến thức cũ):** `mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })`
- **Lỗi:** Hai cờ này không còn tác dụng từ Mongoose 6 và đã bị bỏ hẳn ở Mongoose 8.
- **Sửa:** Chỉ gọi `await mongoose.connect(process.env.MONGODB_URI)`, đặt sau guard `if (!process.env.MONGODB_URI) throw ...`.

### L4-7 · HW3: Listener `visibilitychange` viết inline không gỡ được
- **Contract:** `document.addEventListener('visibilitychange', () => { ... })`
- **Lỗi:** Arrow function inline không thể `removeEventListener`. Mỗi lần component mount lại sẽ cộng thêm một listener, dẫn tới rò rỉ bộ nhớ và resync bị gọi nhiều lần.
- **Sửa:** Đặt tên handler (`handleVisibilityChange`) và gỡ nó trong hàm cleanup của `useEffect`. Khi tab bị ẩn thì cũng dừng tick luôn.

### L4-8 · HW3: Chuyển route giữa 2 hồ sơ bị hiện dữ liệu cũ
- **Lỗi:** `/dossier/himass` và `/dossier/tanvuu` render cùng một component `<DossierView>` ở cùng vị trí, nên React **dùng lại instance cũ**. Dữ liệu của Himass hiện thoáng qua trên trang TanVuu, và request cũ có thể về sau, ghi đè dữ liệu mới.
- **Sửa:** Effect phụ thuộc vào `slug`, reset `dossierData` về `null`, và `AbortController.abort()` request cũ.

### L4-9 · HW3: Các lần resync chạy chồng nhau
- **Lỗi:** StrictMode cộng với việc chuyển tab liên tục tạo ra nhiều request `/api/time` cùng lúc. Request về sau cùng có thể là request cũ, ghi đè offset mới hơn.
- **Sửa:** Dùng `syncIdRef`, chỉ nhận kết quả của lần sync mới nhất.

### L4-10 · Hướng dẫn của AI gây lỗi khi chạy trên máy (đã sửa thủ công)
| Tình huống | Lỗi | Cách sửa |
|---|---|---|
| AI ghi lệnh `cd đường-dẫn\homework\...` có **chữ giữ chỗ** | Người dùng chạy nguyên văn, PowerShell báo `Cannot find path` | Thay bằng đường dẫn thật, hoặc tìm bằng `Get-ChildItem -Recurse -Filter package.json` |
| Windows *Extract All* tạo thêm một lớp thư mục | Đường dẫn thật là `homework\homework\hw1` | `cd homework\hw1` |
| Đường dẫn có dấu cách và `(1)` | `A positional parameter cannot be found` | Bọc đường dẫn trong dấu nháy kép `"..."` |
| Trang tải MongoDB có nhiều mục | Tải nhầm `mongot` (search engine, chỉ có bản Linux) | Chọn đúng mục **Community Server**, Windows x64, gói `.msi` |
| Cài MongoDB nhưng chưa bật service | Compass báo `ECONNREFUSED 127.0.0.1:27017` | Gỡ ra cài lại, tick **Install MongoDB as a Service** |
| DevTools Network đang lọc **JS** | Không thấy request `POST /api/swipe` | Chuyển bộ lọc sang **Fetch/XHR** |

---

## Bài học rút ra

1. **Không tin tuyệt đối vào code contract của đề.** Contract cho biết *phải làm gì*, nhưng thường thiếu guard, cleanup và xử lý trường hợp biên (L4-1, L4-4, L4-7).
2. **Timer luôn tính theo mốc tuyệt đối** (L2-1, L3-1, HW3 Lab 4). Lỗi này lặp lại ở cả 3 lab.
3. **`setState` không khoá được ngay lập tức.** Cần ref lock, request id hoặc AbortController (L3-2, L4-8, L4-9).
4. **AI dễ đưa ra API đã lỗi thời** (L4-6). Luôn kiểm tra lại với tài liệu của đúng phiên bản thư viện đang dùng.
5. **Hướng dẫn chạy phải dùng đường dẫn thật**, và phải tính tới đặc thù của Windows/PowerShell (L4-10).
