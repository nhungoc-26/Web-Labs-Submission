// ============================================================
// appReducer – HÀM THUẦN (pure function)
// - Chỉ nhận (state, action) và trả về state MỚI.
// - KHÔNG side-effect: không đụng DOM (document.dataset),
//   không localStorage, không console, không gọi API.
// - KHÔNG mutate state cũ: luôn trả về object mới bằng spread.
// ============================================================

export const ACTIONS = Object.freeze({
  TOGGLE_THEME: 'TOGGLE_THEME',
  SET_THEME: 'SET_THEME',
  SET_TAB: 'SET_TAB',
});

export const THEMES = Object.freeze(['dark', 'light']);
// Tab 'evidence' chứa phần Exercise 0.2 (pagination + container queries)
export const TABS = Object.freeze(['reels', 'evidence', 'saved']);

export const initialState = Object.freeze({
  theme: 'dark',
  activeTab: 'reels',
});

export function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.TOGGLE_THEME: {
      // FIX bug cũ: logic toggle bị đảo ngược.
      // Đúng: đang 'dark' -> 'light', đang 'light' -> 'dark'.
      return {
        ...state,
        theme: state.theme === 'dark' ? 'light' : 'dark',
      };
    }

    case ACTIONS.SET_THEME: {
      const next = action.payload;
      if (!THEMES.includes(next) || next === state.theme) return state;
      return { ...state, theme: next };
    }

    case ACTIONS.SET_TAB: {
      const next = action.payload;
      // Trả về đúng state cũ (cùng tham chiếu) nếu không đổi
      // -> React bỏ qua re-render.
      if (!TABS.includes(next) || next === state.activeTab) return state;
      return { ...state, activeTab: next };
    }

    default:
      throw new Error(`appReducer: action không hợp lệ "${action.type}"`);
  }
}

// Action creators (tuỳ chọn, giúp code gọn và tránh gõ sai type)
export const toggleTheme = () => ({ type: ACTIONS.TOGGLE_THEME });
export const setTheme = (theme) => ({ type: ACTIONS.SET_THEME, payload: theme });
export const setTab = (tab) => ({ type: ACTIONS.SET_TAB, payload: tab });
