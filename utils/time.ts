import { TimeSlot, SlotStatus } from '../types';

export const generateTimeSlots = (startHour: number, endHour: number, bookedSlots: string[]): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const today = new Date();
  today.setHours(startHour, 0, 0, 0);

  const end = new Date();
  end.setHours(endHour, 0, 0, 0);

  const bookedTimes = new Set(bookedSlots.map(timeStr => {
    const [hour, minute] = timeStr.split(':').map(Number);
    const d = new Date(today);
    d.setHours(hour, minute, 0, 0);
    return d.getTime();
  }));

  while (today.getTime() < end.getTime()) {
    const timeString = today.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const currentTime = today.getTime();
    const prevHourTime = new Date(currentTime);
    prevHourTime.setHours(prevHourTime.getHours() - 1);

    const isBooked = bookedTimes.has(currentTime);
    // A class is 1h, break is 30m. Total 1h30m.
    // So if a class starts at prevHourTime (e.g. 9:00), it ends at currentTime (10:00)
    // and the break is from 10:00 to 10:30. This means the 10:00 slot is unavailable.
    const isBreakFromPrevious = bookedTimes.has(prevHourTime.getTime());

    const isDisabled = isBooked || isBreakFromPrevious;
    const reason = isBooked ? 'BOOKED' : (isBreakFromPrevious ? 'BREAK' : null);

    slots.push({
      id: timeString,
      startTime: new Date(today.getTime()),
      status: isDisabled ? SlotStatus.Disabled : SlotStatus.Available,
      reason: reason,
    });

    today.setHours(today.getHours() + 1);
  }

  return slots;
};