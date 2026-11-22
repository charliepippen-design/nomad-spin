import { create } from 'zustand';

/** Screens of the sign-in modal. */
export type AuthView = 'signin' | 'signup' | 'check-email' | 'forgot' | 'reset-sent' | 'new-password';

/** Open/close state for the sign-in modal and the saved-picks panel, shared by every page. */
interface AccountUiStore {
  authOpen: boolean;
  /** Screen the modal shows when it opens. */
  authView: AuthView;
  picksOpen: boolean;
  /** Opens (or closes) the modal. Opening without a view starts on "Sign in". */
  setAuthOpen: (open: boolean, view?: AuthView) => void;
  setPicksOpen: (open: boolean) => void;
}

export const useAccountUi = create<AccountUiStore>((set) => ({
  authOpen: false,
  authView: 'signin',
  picksOpen: false,
  setAuthOpen: (authOpen, view = 'signin') => set({ authOpen, authView: view }),
  setPicksOpen: (picksOpen) => set({ picksOpen }),
}));
