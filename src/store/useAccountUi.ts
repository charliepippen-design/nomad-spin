import { create } from 'zustand';

/** Open/close state for the sign-in modal and the saved-picks panel, shared by every page. */
interface AccountUiStore {
  authOpen: boolean;
  picksOpen: boolean;
  setAuthOpen: (open: boolean) => void;
  setPicksOpen: (open: boolean) => void;
}

export const useAccountUi = create<AccountUiStore>((set) => ({
  authOpen: false,
  picksOpen: false,
  setAuthOpen: (authOpen) => set({ authOpen }),
  setPicksOpen: (picksOpen) => set({ picksOpen }),
}));
