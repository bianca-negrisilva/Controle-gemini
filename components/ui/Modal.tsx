import React from 'react';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ onClose, children, title }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-stone-200 p-4 z-10">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold font-serif text-stone-800">{title}</h3>
                    <button onClick={onClose} className="text-stone-500 hover:text-stone-800 text-2xl leading-none">&times;</button>
                </div>
            </div>
            <div className="p-6">
              {children}
            </div>
        </div>
    </div>
);

export default Modal;
