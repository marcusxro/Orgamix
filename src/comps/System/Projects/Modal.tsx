'use client';

import { useCallback, useEffect, useRef } from 'react';
import FocusTrap from 'focus-trap-react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { Dispatch, SetStateAction } from 'react';

// Types

interface ModalProps {
    children: React.ReactNode;
    showModal: boolean;
    setShowModal: Dispatch<SetStateAction<boolean>>;
    containerClasses?: string;
  }

export default function Modal({
  children,
  showModal,
  setShowModal,
  containerClasses,
}: ModalProps) {
  const desktopModalRef = useRef(null);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowModal(false);
      }
    },
    [setShowModal],
  );

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  return (
    <AnimatePresence>
      {showModal && (
        <>
          <FocusTrap focusTrapOptions={{ initialFocus: false }}>
            <motion.div
              ref={desktopModalRef}
              key="desktop-modal"
              className="fixed inset-0 z-40 p-3 min-h-screen items-center justify-center flex"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onMouseDown={(e) => {
                if (desktopModalRef.current === e.target) {
                  setShowModal(false);
                }
              }}
            >
              <div
                className={clsx(
                  `overflow relative w-full max-w-lg transform rounded-xl text-white border-[#535353] border-[1px] bg-[#313131] p-3 text-left shadow-2xl transition-all`,
                  containerClasses,
                )}
              >
                {children}
              </div>
            </motion.div>
          </FocusTrap>
          <motion.div
            key="desktop-backdrop"
            className="fixed inset-0 z-30  blurred bg-opacity-10 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          />
        </>
      )}
    </AnimatePresence>
  );
}