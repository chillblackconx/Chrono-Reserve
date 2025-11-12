import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { TimeSlot as TimeSlotType, SlotStatus, User } from './types';
import { generateTimeSlots } from './utils/time';
import * as storage from './utils/storage';
import Header from './components/Header';
import TimeSlotGrid from './components/TimeSlotGrid';
import BookingConfirmation from './components/BookingConfirmation';
import DateSelector from './components/DateSelector';
import AuthScreen from './components/AuthScreen';

type View = 'loading' | 'auth' | 'booking';

const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('loading');
  
  const [globalMessage] = useState(() => storage.getGlobalMessage());
  const [scheduleConfig] = useState(() => storage.getScheduleConfig());

  const [currentWeekStart, setCurrentWeekStart] = useState(() => getStartOfWeek(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [allSlots, setAllSlots] = useState<TimeSlotType[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bookingMessage, setBookingMessage] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const unsubscribe = storage.onAuthChange((user) => {
        if (user) {
            setUser(user);
            setView('booking');
        } else {
            setUser(null);
            setView('auth');
        }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setAllSlots([]);
      return;
    }

    const fetchSlots = async () => {
        setSlotsLoading(true);
        const bookedSlots = await storage.getBookingsForDate(selectedDate);
        const generated = generateTimeSlots(scheduleConfig.startHour, scheduleConfig.endHour, bookedSlots);
        setAllSlots(generated);
        setSelectedIds([]);
        setSlotsLoading(false);
    };

    fetchSlots();
  }, [selectedDate, scheduleConfig]);

  const processedSlots = useMemo(() => {
    return allSlots.map(slot => {
        if (selectedIds.includes(slot.id)) {
            return { ...slot, status: SlotStatus.Selected };
        }
        return slot;
    });
  }, [selectedIds, allSlots]);

  const handleSlotClick = useCallback((clickedId: string) => {
    const clickedSlot = processedSlots.find(s => s.id === clickedId);
    if (!clickedSlot || clickedSlot.status === SlotStatus.Disabled) return;

    setSelectedIds(prev =>
      prev.includes(clickedId)
        ? prev.filter(id => id !== clickedId)
        : [...prev, clickedId]
    );
  }, [processedSlots]);

  const handleConfirmBooking = useCallback(async () => {
    if (selectedIds.length > 0 && selectedDate && user) {
      setIsBooking(true);
      await storage.addBooking(selectedDate, selectedIds, user);
      const message = `Réservation confirmée pour ${selectedIds.length} créneau(x) !`;
      setBookingMessage(message);
      
      setTimeout(async () => {
        setBookingMessage('');
        // Refetch slots to show updated state
        const bookedSlots = await storage.getBookingsForDate(selectedDate);
        const updatedSlots = generateTimeSlots(scheduleConfig.startHour, scheduleConfig.endHour, bookedSlots);
        setAllSlots(updatedSlots);
        setSelectedIds([]);
        setIsBooking(false);
      }, 3000);
    }
  }, [selectedIds, selectedDate, scheduleConfig, user]);

  const selectedSlots = useMemo(() => {
    return processedSlots.filter(slot => slot.status === SlotStatus.Selected);
  }, [processedSlots]);
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleLogout = async () => {
      await storage.logoutUser();
      // The onAuthChange listener will handle setting user and view
  };
  
  const handleLoginSuccess = (loggedInUser: User) => {
    // The onAuthChange listener now handles this state change
    setUser(loggedInUser);
    setView('booking');
  };

  if (view === 'loading') {
    return <div className="min-h-screen flex items-center justify-center"><p>Chargement de l'application...</p></div>;
  }
  
  if (view === 'auth') {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col pb-32">
      <Header user={user} onLogout={handleLogout} />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4">
        {globalMessage && (
            <div className="bg-cyan-900/50 border border-cyan-700 text-cyan-200 p-4 rounded-lg text-center mb-6">
                <p>{globalMessage}</p>
            </div>
        )}
        <DateSelector
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          currentWeekStart={currentWeekStart}
          setCurrentWeekStart={setCurrentWeekStart}
        />
        {selectedDate && (
          <div className="mt-4">
             <h3 className="text-xl text-center text-gray-300 mb-4">
                Créneaux disponibles pour le <span className="font-bold text-cyan-300">{selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </h3>
            {slotsLoading ? (
                <div className="text-center p-8 text-cyan-300">Chargement des créneaux...</div>
            ) : (
                <TimeSlotGrid slots={processedSlots} onSlotClick={handleSlotClick} />
            )}
          </div>
        )}
      </main>
      <BookingConfirmation selectedSlots={selectedSlots} onConfirm={handleConfirmBooking} isBooking={isBooking} />
      {bookingMessage && (
        <div className="fixed top-5 right-5 bg-green-500 text-white p-4 rounded-lg shadow-lg animate-pulse z-50">
          {bookingMessage}
        </div>
      )}
       {isBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg text-white text-lg flex items-center gap-4 shadow-2xl shadow-cyan-500/20">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Réservation en cours...
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
