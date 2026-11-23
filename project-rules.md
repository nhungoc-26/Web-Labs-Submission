# Project Rules: Coding Standards & Lint Rules

Đây là các quy ước **đang được áp dụng thật** trong repo, rút ra từ code và lịch sử commit của Lab 2 đến Lab 4.

## 1. Cấu trúc repo

- Mỗi lab có 2 thư mục: `exercise/` (bài trên lớp) và `homework/` (bài về nhà).
- Mỗi bài là **một project độc lập**, có `package.json` riêng, chạy bằng `npm install` và `npm run dev` ngay trong thư mục bài đó.
- Không commit `node_modules/`, `dist/`, `.env`. Quy tắc này có trong `.gitignore` ở thư mục gốc và trong từng project.
- Mỗi bài có `README.md` mô tả cách chạy và đối chiếu với code contract của đề.

## 2. Công nghệ

| Phạm vi | Stack |
|---|---|
| Lab 2 exercise | Vanilla JS (mini-React tự viết, không dùng framework) |
| Lab 2 homework | TypeScript `strict` + Vite |
| Lab 3, Lab 4 exercise | React + Vite (ESLint flat config) |
| Lab 4 homework | React 18 + Vite 5, React Router 6, Express 5 + Mongoose 8 (hw2) |

> Lưu ý: Lab 4 homework đang dùng React 18 / Vite 5 / Router 6, trong khi các exercise dùng React 19 / Vite 8 / Router 7. Code tương thích với cả hai bản, nhưng nếu nâng cấp thì cần kiểm tra lại.

## 3. Lint & type-check

- **ESLint flat config** (`eslint.config.js`) cho các project React, gồm:
  - `@eslint/js` → `recommended`
  - `eslint-plugin-react-hooks` → `recommended`: hook chỉ được gọi ở top-level, dependency array phải đầy đủ.
  - `eslint-plugin-react-refresh` → `vite`: mỗi file chỉ export component, để HMR hoạt động đúng.
  - Bỏ qua thư mục `dist`.
  - Chạy lint bằng: `npx eslint .` trong thư mục project.
- **TypeScript** (Lab 2 homework): bật `strict`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`.

## 4. Quy ước code React

1. **Derived state thay vì duplicated state.** Giá trị nào tính được từ state hoặc props thì tính trong lúc render, không lưu thêm vào `useState`. Ví dụ: điểm SwipeDeck tính bằng `history.reduce(...)`, ma trận hw3 tính bằng `useMemo(() => computeMatrix(data), [data])`.
2. **State đặt ở nơi tin cậy nhất.** Trạng thái cần chia sẻ hoặc bookmark được thì đặt lên URL (`useSearchParams`); deadline thì đặt ở server.
3. **Effect luôn có cleanup.** Gỡ event listener, `clearTimeout`, và `AbortController.abort()` cho mọi request `fetch`.
4. **Timer tính theo mốc tuyệt đối:** `remaining = target − (Date.now() + serverOffset)`. Không trừ dần theo từng tick.
5. **Chống race condition** bằng ref lock, request id hoặc AbortController, không dựa vào việc `setState` cập nhật ngay.
6. **Hàm tính toán thuần (pure)** tách ra `lib/`, không gọi API và không đọc `Date.now()` bên trong.

## 5. Accessibility (WCAG 2.2 AA)

- Mọi thao tác đều làm được bằng bàn phím. Viền focus rõ ràng (`:focus-visible`, dày 3px).
- Modal dùng native `<dialog>` + `showModal()`. Khi đóng phải trả focus về phần tử đã mở nó.
- Vùng bấm tối thiểu 24×24px (dự án dùng 44px). Màu luôn đi kèm chữ, không truyền thông tin chỉ bằng màu.
- Nội dung thay đổi động thì thông báo qua `aria-live="polite"`. Đồng hồ dùng `role="timer"`, không đọc lại mỗi giây.

## 6. Bảo mật & cấu hình

- Không hard-code secret. Đọc từ `process.env`, và **throw ngay khi khởi động** nếu thiếu biến bắt buộc.
- Mọi biến môi trường đều phải có trong `.env.example` (không chứa giá trị thật).
- Không dùng cờ đã bị bỏ của Mongoose (`useNewUrlParser`, `useUnifiedTopology`).
- API trả lỗi validate với status `400` kèm `{ error }`, tạo mới thành công trả `201`.

## 7. Git

- Commit theo **Conventional Commits**: `feat(scope): ...`, `fix(scope): ...`, `docs(scope): ...`, `test(scope): ...`, `chore(scope): ...`.
- Mỗi commit làm một việc, scope ghi rõ phần bị thay đổi (ví dụ `feat(timer)`, `feat(ex3)`, `feat(lab4-hw2)`).
- Gộp repo cũ bằng `git subtree add` để giữ lịch sử, không copy file thủ công.
