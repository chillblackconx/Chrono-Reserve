
import React from 'react';
import { TimeSlot as TimeSlotType, SlotStatus, DisabledReason } from '../types';

interface TimeSlotProps {
  slot: TimeSlotType;
  onClick: (id: string) => void;
}

const TimeSlot: React.FC<TimeSlotProps> = ({ slot, onClick }) => {
  const { id, status, reason } = slot;
  const time = id;

  const baseClasses = "p-2 w-full h-16 flex items-center justify-center rounded-lg border-2 text-center font-mono transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-cyan-300";

  const statusStyles: { [key in SlotStatus]: string } = {
    [SlotStatus.Available]: "bg-gray-800/50 border-cyan-700 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 cursor-pointer hover:scale-105",
    [SlotStatus.Selected]: "bg-cyan-400 border-cyan-200 text-gray-900 font-bold shadow-[0_0_15px_rgba(72,209,204,0.8)] scale-105 cursor-pointer",
    [SlotStatus.Disabled]: "bg-gray-900/50 border-gray-700 text-gray-600 opacity-60 cursor-not-allowed",
  };

  const disabledContent: { [key in Exclude<DisabledReason, null>]: string } = {
    BOOKED: 'Réservé',
    CLASS_PART: 'Cours',
    BREAK: 'Pause',
    TOO_CLOSE: 'Bloqué',
  };
  
  const content = status === SlotStatus.Disabled && reason ? disabledContent[reason] : time;

  return (
    <button
      onClick={() => onClick(id)}
      disabled={status === SlotStatus.Disabled}
      className={`${baseClasses} ${statusStyles[status]}`}
      aria-label={`${status} à ${time}`}
    >
      <span className="text-lg">{content}</span>
    </button>
  );
};

export default TimeSlot;
