# Web Application Development – Lab 2 · Lab 3 · Lab 4 · Lab 5

Repo nộp bài gộp toàn bộ Lab 2 đến Lab 5 theo **Slide 34: Complete Continuity Matrix & Repository Submission Tree**.
Mỗi repo cũ được đưa vào một thư mục con và **vẫn giữ nguyên lịch sử commit** (gộp bằng `git subtree add`).

## Continuity Matrix

| Lab | Chủ đề | Nội dung chính | Thư mục |
|-----|--------|----------------|---------|
| **Lab 2** | Foundations & Synchronous State | Quản lý state đồng bộ, cấu trúc UI component, luồng dữ liệu reactive (mini-React tự viết, state machine, TypeScript) | [`lab2/`](lab2) |
| **Lab 3** | Asynchronous Hooks & REST APIs | Custom hook bất đồng bộ, gọi REST API, điều phối side-effect (AbortController, 4-state UI, chống race condition) | [`lab3/`](lab3) |
| **Lab 4** | Full-Stack Contracts & Defense | Code contract end-to-end, React Router, Express + Mongoose 8, WCAG 2.2 AA, đồng hồ zero-drift | [`lab4/`](lab4) |
| **Lab 5** | Reducers, Real-time & Agentic Web | `useReducer` thuần + tách Context, pagination zero-effect, container queries, Sprint 1 evidence dashboard | [`lab5/`](lab5) |

## Repository Submission Tree

```
repository-root/
├── project-rules.md          # Team coding standards & lint rules
├── TASK_DECOMPOSITION.md     # Sprint planning & work breakdown
├── AI_FAILURE_AUDIT.md       # Documented AI hallucinations & manual fixes
├── .env.example              # Environment variable template without secrets
├── README.md
├── lab2/
│   ├── exercise/   ← nhungoc-26/lab-2_Exercise   (Exercise 1–3)
│   └── homework/   ← nhungoc-26/Homework-        (HW1–HW3)
├── lab3/
│   ├── exercise/   ← nhungoc-26/lab3             (Ex1–Ex3)
│   └── homework/   ← nhungoc-26/lab3_HW          (HW1–HW3)
├── lab4/
│   ├── exercise/   ← nhungoc-26/lab4_ex          (ex 1.2 → ex 1.7)
│   └── homework/   ← bài mới                     (hw1–hw3)
└── lab5/
    ├── exercise/   ← bài mới                     (ex 0.1 vs 0.2 - sprint1)
    └── homework/   ← (chưa có)
```

## Chạy một bài bất kỳ

Mỗi bài là một project Vite độc lập, nên phải `cd` vào đúng thư mục của bài đó trước khi chạy:

```bash
cd lab4/homework/hw3
npm install
npm run dev
```

Riêng `lab4/homework/hw2` có backend Express + MongoDB, xem hướng dẫn trong `lab4/homework/hw2/README.md`.
Các biến môi trường cần thiết được liệt kê trong [`.env.example`](.env.example).

## Repo gốc

Các repo cũ vẫn được giữ nguyên trên GitHub, repo này chỉ gộp lại để nộp bài:
[lab-2_Exercise](https://github.com/nhungoc-26/lab-2_Exercise) ·
[Homework-](https://github.com/nhungoc-26/Homework-) ·
[lab3](https://github.com/nhungoc-26/lab3) ·
[lab3_HW](https://github.com/nhungoc-26/lab3_HW) ·
[lab4_ex](https://github.com/nhungoc-26/lab4_ex)
