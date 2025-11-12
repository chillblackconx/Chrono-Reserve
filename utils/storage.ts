import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
  GoogleAuthProvider,
  MicrosoftAuthProvider,
  signInWithPopup,
  type AuthProvider,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  writeBatch,
  query,
  where,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebase.config';
import { User } from '../types';

// --- Auth ---

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      const name = userDoc.exists() ? userDoc.data().name : firebaseUser.displayName;

      callback({
        uid: firebaseUser.uid,
        username: firebaseUser.email || '',
        name: name || '',
      });
    } else {
      callback(null);
    }
  });
};

export const registerUser = async (name: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName: name });
    
    await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
    });

    return { success: true, message: 'Compte créé avec succès !' };
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      return { success: false, message: 'Cette adresse e-mail est déjà utilisée.' };
    }
    if (error.code === 'auth/weak-password') {
        return { success: false, message: 'Le mot de passe doit contenir au moins 6 caractères.'};
    }
    console.error('Error registering user:', error);
    return { success: false, message: "Une erreur est survenue lors de l'inscription." };
  }
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        const name = userDoc.exists() ? userDoc.data().name : user.displayName;

        return {
            uid: user.uid,
            username: user.email || '',
            name: name || ''
        };
    } catch (error) {
        console.error("Error logging in:", error);
        return null;
    }
};

const handleSocialLogin = async (provider: AuthProvider): Promise<User | null> => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        let name = user.displayName;
        if (userDoc.exists()) {
            name = userDoc.data().name;
        } else {
            await setDoc(doc(db, "users", user.uid), {
                name: user.displayName,
                email: user.email,
            });
        }
        
        return {
            uid: user.uid,
            username: user.email || '',
            name: name || '',
        };

    } catch (error) {
        console.error("Error during social login: ", error);
        return null;
    }
}

export const signInWithGoogle = async (): Promise<User | null> => {
    const provider = new GoogleAuthProvider();
    return handleSocialLogin(provider);
};

export const signInWithMicrosoft = async (): Promise<User | null> => {
    const provider = new MicrosoftAuthProvider();
    return handleSocialLogin(provider);
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

// --- Bookings ---

const getBookingDocId = (date: Date, timeSlot: string) => {
    const dateString = date.toISOString().split('T')[0];
    return `${dateString}_${timeSlot.replace(':', '-')}`;
}

export const getBookingsForDate = async (date: Date): Promise<string[]> => {
  const dateString = date.toISOString().split('T')[0];
  const q = query(collection(db, 'bookings'), where('date', '==', dateString));
  
  try {
    const querySnapshot = await getDocs(q);
    const bookedSlots: string[] = [];
    querySnapshot.forEach((doc) => {
      bookedSlots.push(doc.data().time);
    });
    return bookedSlots;
  } catch (error) {
    console.error("Error fetching bookings: ", error);
    return [];
  }
};

export const addBooking = async (date: Date, timeSlots: string[], user: User): Promise<void> => {
    const batch = writeBatch(db);
    const dateString = date.toISOString().split('T')[0];

    timeSlots.forEach(time => {
        const docId = getBookingDocId(date, time);
        const bookingRef = doc(db, 'bookings', docId);
        batch.set(bookingRef, {
            date: dateString,
            time: time,
            userId: user.uid,
            userName: user.name,
            bookedAt: new Date().toISOString()
        });
    });

    await batch.commit();
};


export const removeBooking = async (date: Date, timeSlot: string): Promise<void> => {
    const docId = getBookingDocId(date, timeSlot);
    const bookingRef = doc(db, 'bookings', docId);
    await deleteDoc(bookingRef);
};


// --- Configs ---
export const getScheduleConfig = () => ({ startHour: 9, endHour: 15 });
export const getGlobalMessage = () => null;