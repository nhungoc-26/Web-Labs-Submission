// Ghi log mỗi lần component render để kiểm chứng việc tách context.
// Lưu ý: ở chế độ dev, <StrictMode> render 2 lần nên log có thể bị nhân đôi.
// Log nằm trong useEffect (chạy sau commit) nên không làm render bị "không thuần".
import { useEffect } from 'react';

export function useRenderLog(name) {
  useEffect(() => {
    console.log(`%c[render] ${name}`, 'color:#22c55e');
  });
}
