import { useEffect, useRef, type MouseEvent } from "react";
import { X } from "lucide-react";
import { HowSteps } from "./HowSteps";

type Props = {
  open: boolean;
  onClose: () => void;
};

export const HowModal = ({ open, onClose }: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const rect = dialog.getBoundingClientRect();
    const isInside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!isInside) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="how-modal"
      aria-labelledby="how-modal-title"
      onClose={onClose}
      onClick={handleBackdropClick}
    >
      <div className="how-panel-head">
        <span className="section-kicker" id="how-modal-title">
          <span>?</span> CÓMO CONSEGUIRLO
        </span>
        <button type="button" onClick={onClose} aria-label="Cerrar instrucciones">
          <X size={18} />
        </button>
      </div>

      <HowSteps />
    </dialog>
  );
};
