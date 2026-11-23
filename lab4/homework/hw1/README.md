# Homework 1: PhotoGalleryLayout.jsx & Native HTML5 `<dialog>` Modal

Bài này nâng cấp gallery ảnh: modal đồng bộ với URL qua `useSearchParams`, và quản lý focus đạt WCAG 2.2 AA.

## Cấu trúc thư mục

```
homework/
└── hw1/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── README.md
    └── src/
        ├── main.jsx                  # BrowserRouter + Route
        ├── PhotoGalleryLayout.jsx    # Component chính (code contract)
        ├── PhotoGalleryLayout.css
        └── data/
            └── photos.js             # Dữ liệu ảnh mẫu
```

## Cách chạy

```bash
cd homework/hw1
npm install
npm run dev
```

Mở `http://localhost:5173`. Thử deep-link: `http://localhost:5173/?photoId=3`.

## Đối chiếu với Code Contract

| # | Yêu cầu | Chỗ cài đặt trong `PhotoGalleryLayout.jsx` |
|---|---------|---------------------------------------------|
| 1 | Đồng bộ query string trên URL | `const [searchParams, setSearchParams] = useSearchParams();` |
| 2 | Trạng thái modal suy ra trực tiếp từ URL | `const selectedPhotoId = searchParams.get('photoId');` (không dùng `useState` cho trạng thái mở/đóng) |
| 3 | Gắn ref cho `<dialog>` | `const dialogRef = useRef(null);` và `<dialog ref={dialogRef}>` |
| 4 | Focus trap & mở modal | `useEffect(() => { ... showModal() / close() }, [selectedPhotoId])` |
| 5 | Close handler ghi ngược vào URL | `<dialog onClose={handleClose}>`, trong đó gọi `setSearchParams({})` |

### Mấy chỗ làm kỹ hơn contract gốc (để tránh bug)

- **Guard `!dialog.open` trước `showModal()`**: gọi `showModal()` khi dialog đang mở dạng non-modal sẽ ném `InvalidStateError`. Guard này cũng giúp chạy ổn dưới React StrictMode (effect chạy 2 lần).
- **`onClose` chỉ gọi `setSearchParams({})` khi URL còn `photoId`**: nếu người dùng bấm **Back**, URL đã mất `photoId`, effect gọi `close()` rồi `onClose` bắn ra. Nếu vẫn gọi `setSearchParams({})` thì sẽ bị push thêm một history entry thừa.
- **`photoId` không hợp lệ** (vd `?photoId=abc`): URL được dọn bằng `replace` và modal không mở ra trống.
- **Chuyển ảnh trong modal** (nút hoặc phím ← →) dùng `{ replace: true }` để history không bị phình ra.

## WCAG 2.2 AA – Focus Management

| Tiêu chí | Cách đáp ứng |
|----------|--------------|
| **2.1.1 Keyboard** | Mọi thao tác (mở, chuyển ảnh, đóng) đều làm được bằng bàn phím: Tab/Enter, ← →, Esc. |
| **2.1.2 No Keyboard Trap** | Focus được giữ trong modal (do `showModal()` làm nền thành inert), nhưng luôn thoát được bằng **Esc** hoặc nút Đóng. |
| **2.4.3 Focus Order** | Khi mở: focus vào nút **Đóng**. Khi đóng: focus **trả về đúng thumbnail** đã mở (lưu bằng `thumbnailRefs` + `lastOpenedIdRef`), kể cả khi mở từ deep-link. |
| **2.4.7 Focus Visible** | `:focus-visible` có outline 3px, offset 3px, màu `#0b5fff`. |
| **2.4.11 Focus Not Obscured (Minimum)** | Thumbnail đang focus được nâng `z-index`; nền phía sau bị inert nên focus không lọt xuống dưới backdrop. |
| **2.5.8 Target Size (Minimum)** | Các nút trong modal tối thiểu 44×44px (yêu cầu ≥ 24×24px). |
| **1.4.3 / 1.4.11 Contrast** | Chữ ≥ 4.5:1, viền focus và viền nút ≥ 3:1. |
| **4.1.2 Name, Role, Value** | `<dialog>` native có role dialog; `aria-labelledby` trỏ vào tiêu đề, `aria-describedby` trỏ vào chú thích; nút icon có `aria-label`. Thumbnail có `aria-haspopup="dialog"`. |
| **1.1.1 Non-text Content** | Mọi `<img>` đều có `alt`. |

Ngoài ra: tiêu đề modal có `aria-live="polite"` để screen reader đọc khi chuyển ảnh; trang bị khoá scroll khi modal mở (`html:has(dialog[open])`); hiệu ứng hover bị tắt khi người dùng bật `prefers-reduced-motion`.

## Checklist tự test

1. Tab tới một ảnh, Enter → modal mở, URL có `?photoId=...`, focus ở nút Đóng.
2. Tab/Shift+Tab nhiều lần → focus chỉ chạy trong modal.
3. Nhấn ← / → → ảnh đổi, URL đổi theo, số thứ tự (x/12) cập nhật.
4. Nhấn Esc → modal đóng, URL hết `photoId`, focus quay về thumbnail vừa mở.
5. Click vào vùng tối (backdrop) → modal đóng.
6. Mở ảnh rồi bấm **Back** của trình duyệt → modal đóng, không có history entry thừa.
7. Truy cập thẳng `/?photoId=5` → modal mở ảnh 5; đóng → focus về thumbnail số 5.
8. Truy cập `/?photoId=abc` → không mở modal, URL được dọn sạch.
9. Bật screen reader (NVDA/VoiceOver) → modal được đọc là "dialog" kèm tiêu đề ảnh.
