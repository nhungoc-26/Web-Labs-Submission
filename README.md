# Sprint 1 – #JusticeForHimassTanVuu Evidence Dashboard Shell

Dashboard lưu trữ bằng chứng kỹ thuật cho 2 tuyển thủ PUBG Himass và TanVuu. Project gộp **Exercise 0.1** (AppProvider), **Exercise 0.2** (EvidenceGrid) và **Sprint 1** (UI shell responsive).

> Dữ liệu trong `public/clips.json` là dữ liệu minh hoạ cho bài lab.

## Chạy

```bash
npm install
npm run dev
```

Mở http://localhost:5173, chọn tab **Bằng chứng** rồi bấm **Tải hồ sơ bằng chứng**.

## Cấu trúc

```
src/
├── main.jsx                       # <AppProvider><App/></AppProvider>
├── App.jsx                        # [Sprint 1] shell: header / nav / main
├── index.css                      # theme + 100dvh + @container + 44px
├── reducer/appReducer.js          # [0.1] reducer THUẦN
├── context/AppProvider.jsx        # [0.1] AppStateContext + AppDispatchContext
├── hooks/useRenderLog.js          # log render để kiểm chứng
└── components/
    ├── Header.jsx                 # bọc ThemeToggle trong <Profiler>
    ├── ThemeToggle.jsx            # chỉ dùng dispatch
    ├── ThemeBadge.jsx, TabBar.jsx, TabContent.jsx
    └── evidence/                  # [0.2] KHÔNG có useEffect
        ├── EvidencePanel.jsx      # useState([]), lọc Himass/TanVuu, thống kê
        ├── EvidenceGrid.jsx       # totalPages / visibleItems tính khi render
        ├── EvidenceCard.jsx
        └── Pagination.jsx         # nút 44×44px
```

## Đối chiếu yêu cầu

### Exercise 0.1
| Yêu cầu | Cách làm |
|---|---|
| Tách `FormContext` nguyên khối | `AppStateContext` + `AppDispatchContext` trong `context/AppProvider.jsx` |
| `class=` → `className` | Mọi JSX đều dùng `className` |
| Sửa toggle `dataset.theme` bị ngược | `theme === 'dark' ? 'light' : 'dark'` |
| Không có side-effect trong reducer | Ghi `document.documentElement.dataset.theme` trong `useEffect` của Provider |
| `appReducer(state, action)` thuần | Không mutate, không đụng DOM, trả về đúng state cũ khi không đổi |

### Exercise 0.2
| Yêu cầu | Cách làm |
|---|---|
| Không dùng useEffect: lát cắt trang là derived state | `EvidenceGrid.jsx`. Thư mục `evidence/` không gọi `useEffect` |
| `useState([])` | `EvidencePanel.jsx` |
| `totalPages` / `visibleItems` tính khi render, `key={clip._id}` | `EvidenceGrid.jsx` |
| `100dvh`, `@container`, touch target 44×44px, bỏ 800px | `index.css` |

### Sprint 1
| Checkpoint | Cách làm |
|---|---|
| Tích hợp `AppProvider.jsx` + `EvidenceGrid.jsx` vào shell responsive | `App.jsx`. Container query `shell`: dưới 900px nav nằm ngang, từ 900px trở lên nav thành sidebar |
| Tối thiểu 2 commit atomic | `git log --oneline` (xem bên dưới) |
| ThemeToggle không render khi chuyển trang | Biến `page` nằm cục bộ trong `EvidencePanel`, không đưa lên context. ThemeToggle chỉ dùng `dispatch` (không bao giờ đổi) |

## Kiểm chứng bằng React DevTools Profiler

1. Cài extension **React Developer Tools** cho Chrome hoặc Edge.
2. Chạy `npm run dev`, mở DevTools, chọn tab **⚛ Profiler**.
3. Mở ⚙ Settings và bật **"Highlight updates when components render"** cùng **"Record why each component rendered"**.
4. Vào tab **Bằng chứng**, bấm **Tải hồ sơ bằng chứng**.
5. Bấm **⏺ Record**, chuyển qua lại vài trang (‹ 1 2 3 ›), rồi bấm **Stop**.
6. Xem Flamegraph của từng commit:
   - Có render: `EvidencePanel`, `EvidenceGrid`, `EvidenceCard`, `Pagination`.
   - **`ThemeToggle` có màu xám** ("Did not render"). `Header`, `App`, `TabBar` cũng xám.
7. Chụp màn hình Flamegraph này để nộp minh chứng.

Có thể kiểm chứng thêm qua Console: khi đổi trang, Console **không** in dòng `[Profiler] ThemeToggle`.

## Git

Repo đã có sẵn lịch sử commit:

```bash
git log --oneline
```

Đổi tác giả commit thành tên của bạn:

```bash
git config user.name "Tên Của Bạn"
git config user.email "mssv@gm.uit.edu.vn"
git rebase -r --root --exec "git commit --amend --no-edit --reset-author"
```
