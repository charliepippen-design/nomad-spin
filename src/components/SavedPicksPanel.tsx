import * as Dialog from '@radix-ui/react-dialog';
import { Bookmark, X } from 'lucide-react';
import SavedSpins from '@/components/SavedSpins';
import { useSpinStore } from '@/store/useSpinStore';
import { useAccountUi } from '@/store/useAccountUi';

/** Side panel listing the saved cities. Opening or closing it never touches the session. */
export default function SavedPicksPanel() {
  const open = useAccountUi((s) => s.picksOpen);
  const setOpen = useAccountUi((s) => s.setPicksOpen);
  const count = useSpinStore((s) => s.savedSpins.length);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/60 pointer-events-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-[91] flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-lg pointer-events-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <Dialog.Title className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Bookmark className="h-4 w-4 text-primary" /> My picks
            </Dialog.Title>
            <Dialog.Close
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close my picks"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Cities you saved.</Dialog.Description>
          <div className="flex-1 overflow-y-auto pb-6">
            {count === 0 ? (
              <p className="px-5 pt-6 text-sm leading-relaxed text-muted-foreground">
                No saved cities yet. Save a city from a spin result or a destination page and it shows up here.
              </p>
            ) : (
              <SavedSpins />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
