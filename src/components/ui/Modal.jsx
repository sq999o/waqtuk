import { useEffect, useId, useRef } from 'react';
import './Modal.css';

const FIELD_SELECTOR = [
  'input:not([type="hidden"]):not(:disabled)',
  'textarea:not(:disabled)',
  'select:not(:disabled)',
  '[contenteditable="true"]',
  '[data-autofocus]',
].join(', ');

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not(:disabled)',
  'input:not(:disabled):not([type="hidden"])',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function Modal({
  open,
  title,
  onClose,
  footer,
  size = 'md',
  children,
  className = '',
  onClick: onRootClick,
  ...rest
}) {
  const dialogRef = useRef(null);
  const returnFocusRef = useRef(null);
  const titleId = useId();

  // Focus the first field when opening and restore focus when closing.
  useEffect(() => {
    if (open) {
      if (!returnFocusRef.current) {
        returnFocusRef.current = document.activeElement;
      }

      const dialog = dialogRef.current;
      if (!dialog) return;

      const firstField = dialog.querySelector(FIELD_SELECTOR);
      (firstField || dialog).focus();

      return;
    }

    if (returnFocusRef.current?.isConnected) {
      returnFocusRef.current.focus();
    }

    returnFocusRef.current = null;
  }, [open]);

  // Lock page scrolling while the modal is open.
  useEffect(() => {
    if (!open) return undefined;

    const body = document.body;
    const html = document.documentElement;

    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = html.style.overflow;

    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';

    return () => {
      body.style.overflow = previousBodyOverflow;
      html.style.overflow = previousHtmlOverflow;
    };
  }, [open]);

  // Handle Escape and keep keyboard focus inside the modal.
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== 'Tab') return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusableElements = Array.from(
        dialog.querySelectorAll(FOCUSABLE_SELECTOR)
      ).filter(element => element.getClientRects().length > 0);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (!dialog.contains(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? lastElement : firstElement).focus();
      } else if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const modalClassName = [
    'wq-modal',
    `wq-modal--${size === 'sm' ? 'sm' : 'md'}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      {...rest}
      className={modalClassName}
      onClick={event => {
        onRootClick?.(event);

        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <section
        ref={dialogRef}
        className="wq-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex="-1"
      >
        <header className="wq-modal__header">
          <h2 className="wq-modal__title" id={titleId}>
            {title}
          </h2>

          <button
            className="wq-modal__close"
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="wq-modal__body">
          {children}
        </div>

        {footer != null && (
          <footer className="wq-modal__footer">
            {footer}
          </footer>
        )}
      </section>
    </div>
  );
}
