import React from 'react';

interface DateSelectorProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  currentWeekStart: Date;
  setCurrentWeekStart: (date: Date) => void;
}

const getWeekDays = (startDate: Date): Date[] => {
    const days: Date[] = [];
    const date = new Date(startDate);
    for (let i = 0; i < 7; i++) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
};

const formatDate = (date: Date, options: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat('fr-FR', options).format(date);
};

const isSameDay = (d1: Date, d2: Date | null): boolean => {
    if (!d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateSelect, currentWeekStart, setCurrentWeekStart }) => {
    const weekDays = getWeekDays(currentWeekStart);

    const goToPreviousWeek = () => {
        const newWeekStart = new Date(currentWeekStart);
        newWeekStart.setDate(newWeekStart.getDate() - 7);
        setCurrentWeekStart(newWeekStart);
    };

    const goToNextWeek = () => {
        const newWeekStart = new Date(currentWeekStart);
        newWeekStart.setDate(newWeekStart.getDate() + 7);
        setCurrentWeekStart(newWeekStart);
    };

    const weekStartStr = formatDate(weekDays[0], { day: 'numeric', month: 'long' });
    const weekEndStr = formatDate(weekDays[6], { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 mb-6">
            <div className="flex items-center justify-between mb-4">
                <button onClick={goToPreviousWeek} className="px-4 py-2 rounded-md bg-cyan-700 hover:bg-cyan-600 transition-colors">&lt; Préc.</button>
                <h2 className="text-lg font-semibold text-cyan-300 text-center">{weekStartStr} - {weekEndStr}</h2>
                <button onClick={goToNextWeek} className="px-4 py-2 rounded-md bg-cyan-700 hover:bg-cyan-600 transition-colors">Suiv. &gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-2">
                {weekDays.map(day => {
                    const isSelected = isSameDay(day, selectedDate);
                    const dayClasses = `
                        p-2 rounded-md flex flex-col items-center justify-center aspect-square transition-all duration-200 cursor-pointer
                        ${isSelected ? 'bg-cyan-500 text-gray-900 font-bold scale-105 shadow-[0_0_15px_rgba(72,209,204,0.8)]' : 'bg-gray-700 hover:bg-gray-600'}
                    `;
                    return (
                        <div key={day.toISOString()} onClick={() => onDateSelect(day)} className={dayClasses}>
                            <span className="text-xs uppercase opacity-80">{formatDate(day, { weekday: 'short' })}</span>
                            <span className="text-xl font-bold">{formatDate(day, { day: 'numeric' })}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DateSelector;
