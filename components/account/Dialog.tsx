'use client';

import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';

/**
 * A modal on the native <dialog>: focus is trapped, Esc and the backdrop close it, and focus goes
 * back to the opener on close.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-window border border-line bg-surface p-0 text-ink shadow-pop backdrop:bg-ink/40"
    >
      {open ? (
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 id={titleId} className="text-section font-extrabold">
              {title}
            </h2>
            <button type="button" onClick={onClose} aria-label="قفل" className="-me-2 -mt-2 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-ink-3 hover:bg-sunken hover:text-ink">
              <X aria-hidden className="size-5" />
            </button>
          </div>
          {children}
          {footer ? <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div> : null}
        </div>
      ) : null}
    </dialog>
  );
}
