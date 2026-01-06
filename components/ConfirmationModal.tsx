
import React from 'react';

interface ConfirmationModalProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ message, onConfirm, onCancel }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md m-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4">تأكيد الإجراء</h3>
                <p className="text-gray-600 mb-8">{message}</p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-colors"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                    >
                        تأكيد الحذف
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;