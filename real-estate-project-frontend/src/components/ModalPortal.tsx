import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * ModalPortal renders its children into document.body via a React portal,
 * completely escaping any parent stacking contexts (z-index, backdrop-filter,
 * overflow-hidden, transforms) that would otherwise clip or obscure fixed modals.
 */
export default function ModalPortal({ children }: { children: React.ReactNode }) {
  const elRef = useRef<HTMLDivElement | null>(null);

  if (!elRef.current) {
    elRef.current = document.createElement('div');
    elRef.current.setAttribute('data-modal-portal', 'true');
  }

  useEffect(() => {
    const el = elRef.current!;
    document.body.appendChild(el);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.removeChild(el);
      document.body.style.overflow = '';
    };
  }, []);

  return createPortal(children, elRef.current);
}
