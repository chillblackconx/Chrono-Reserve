import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase.config';
import { TimeSlot as TimeSlotType, SlotStatus, User } from './types';
import { generateTimeSlots } from './utils/time';
import * as storage from './utils/storage';
import Header from './components/Header';
import TimeSlotGrid from './components/TimeSlotGrid';
import BookingConfirmation from './components/BookingConfirmation';
import SplashScreen from './components/SplashScreen';
import DateSelector from './components/DateSelector';
import AuthScreen from './components/AuthScreen';

type View = 'loading' | 'auth' | 'splash' | 'booking';

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
  
  const [splashConfig] = useState(() => storage.getSplashConfig());
  const [globalMessage] = useState(() => storage.getGlobalMessage());
  const [scheduleConfig] = useState(() => storage.getScheduleConfig());

  const [currentWeekStart, setCurrentWeekStart] = useState(() => getStartOfWeek(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [allSlots, setAllSlots] = useState<TimeSlotType[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bookingMessage, setBookingMessage] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const appUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Utilisateur',
          email: firebaseUser.email || 'N/A',
        };
        setUser(appUser);
        setView(v => (v === 'auth' || v === 'loading' ? 'splash' : v));
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
    const bookedSlots = storage.getBookingsForDate(selectedDate);
    const generated = generateTimeSlots(scheduleConfig.startHour, scheduleConfig.endHour, bookedSlots);
    setAllSlots(generated);
    setSelectedIds([]);
  }, [selectedDate, scheduleConfig]);

  const processedSlots = useMemo(() => {
    const selectedTimes = new Set<number>();
    selectedIds.forEach(id => {
      const slot = allSlots.find(s => s.id === id);
      if (slot) selectedTimes.add(slot.startTime.getTime());
    });

    return allSlots.map(slot => {
      if (slot.status === SlotStatus.Disabled) return slot;

      const time = slot.startTime.getTime();
      if (selectedTimes.has(time)) {
        return { ...slot, status: SlotStatus.Selected };
      }
      
      return { ...slot, status: SlotStatus.Available };
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

  const handleConfirmBooking = useCallback(() => {
    const numBooked = selectedIds.length;
    if (numBooked > 0 && selectedDate) {
      storage.addBooking(selectedDate, selectedIds);
      const message = `Réservation confirmée pour ${numBooked} créneau(x) !`;
      setBookingMessage(message);
      
      setTimeout(() => {
        setBookingMessage('');
        const bookedSlots = storage.getBookingsForDate(selectedDate);
        const updatedSlots = generateTimeSlots(scheduleConfig.startHour, scheduleConfig.endHour, bookedSlots);
        setAllSlots(updatedSlots);
        setSelectedIds([]);
      }, 3000);
    }
  }, [selectedIds, selectedDate, scheduleConfig]);

  const selectedSlots = useMemo(() => {
    return processedSlots.filter(slot => slot.status === SlotStatus.Selected);
  }, [processedSlots]);
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleLogout = () => {
      signOut(auth).catch(error => console.error("Erreur de déconnexion:", error));
  };
  
  const handleLoginSuccess = () => {
    setView('splash');
  };

  if (view === 'loading') {
    return <div className="min-h-screen flex items-center justify-center"><p>Chargement...</p></div>;
  }
  
  if (view === 'auth') {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }
  
  if (view === 'splash') {
    return <SplashScreen config={splashConfig} onEnter={() => setView('booking')} />;
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
            <TimeSlotGrid slots={processedSlots} onSlotClick={handleSlotClick} />
          </div>
        )}
      </main>
      <BookingConfirmation selectedSlots={selectedSlots} onConfirm={handleConfirmBooking} />
      {bookingMessage && (
        <div className="fixed top-5 right-5 bg-green-500 text-white p-4 rounded-lg shadow-lg animate-pulse z-50">
          {bookingMessage}
        </div>
      )}
    </div>
  );
};

export default App;
