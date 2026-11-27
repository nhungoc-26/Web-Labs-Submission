import { createContext, useContext, useEffect, useReducer } from 'react';
import { appReducer, initialState } from '../reducer/appReducer.js';

// ============================================================
// SPLIT CONTEXT
// - AppStateContext   : chứa state (thay đổi thường xuyên)
// - AppDispatchContext: chứa dispatch (tham chiếu ỔN ĐỊNH, không bao giờ đổi)
// Component chỉ cần dispatch -> không re-render khi state đổi.
// ============================================================

export const AppStateContext = createContext(null);
export const AppDispatchContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Side-effect được đưa RA KHỎI reducer, đặt trong useEffect.
  // Đồng bộ theme lên <html data-theme="...">.
  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

// Custom hooks – báo lỗi rõ ràng nếu dùng ngoài <AppProvider>
export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (ctx === null) {
    throw new Error('useAppState phải được dùng bên trong <AppProvider>');
  }
  return ctx;
}

export function useAppDispatch() {
  const ctx = useContext(AppDispatchContext);
  if (ctx === null) {
    throw new Error('useAppDispatch phải được dùng bên trong <AppProvider>');
  }
  return ctx;
}
