
import React from 'react';
import { TimeSlot } from '../types';

interface BookingConfirmationProps {
    selectedSlots: TimeSlot[];
    onConfirm: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ selectedSlots, onConfirm }) => {
    if (selectedSlots.length === 0) {
        return null;
    }
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-t-2 border-cyan-800 p-4 shadow-2xl shadow-cyan-500/20 z-10">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                    <h3 className="text-lg font-bold text-cyan-300">Vos sessions sélectionnées :</h3>
                    <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                        {selectedSlots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime()).map(slot => (
                            <span key={slot.id} className="bg-cyan-500 text-gray-900 font-bold px-3 py-1 rounded-full text-sm">
                                {slot.id}
                            </span>
                        ))}
                    </div>
                </div>
                <button
                    onClick={onConfirm}
                    className="w-full sm:w-auto flex-shrink-0 bg-green-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-400 transition-colors shadow-[0_0_15px_rgba(52,211,153,0.6)] hover:shadow-[0_0_25px_rgba(52,211,153,0.8)]"
                >
                    Confirmer {selectedSlots.length} session(s)
                </button>
            </div>
        </div>
    );
};

export default BookingConfirmation;
