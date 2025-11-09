
import React from 'react';
import { TimeSlot as TimeSlotType } from '../types';
import TimeSlot from './TimeSlot';

interface TimeSlotGridProps {
    slots: TimeSlotType[];
    onSlotClick: (id: string) => void;
}

const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({ slots, onSlotClick }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 p-4 md:p-8 max-w-7xl mx-auto">
        {slots.map(slot => (
            <TimeSlot key={slot.id} slot={slot} onClick={onSlotClick} />
        ))}
    </div>
  );
};

export default TimeSlotGrid;
