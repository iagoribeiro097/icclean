import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  onSnapshot 
} from "firebase/firestore";
import { Booking, Client } from "./types";

const firebaseConfig = {
  apiKey: "AIzaSyAB0Ql9TbL2V_VmADoIttkVQO3a7FZjd4s",
  authDomain: "ic-clean-6c4f7.firebaseapp.com",
  projectId: "ic-clean-6c4f7",
  storageBucket: "ic-clean-6c4f7.firebasestorage.app",
  messagingSenderId: "281691676250",
  appId: "1:281691676250:web:f407c38ee73244369a8263"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Firestore Error Handling utilities as specified in firebase-integration skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {}, // No Firebase Auth configured/required in this app's client
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Subscribes to all bookings in real-time from Firestore
 */
export function subscribeToBookings(
  onNext: (bookings: Booking[]) => void, 
  onError?: (error: Error) => void
) {
  const path = 'bookings';
  try {
    const bookingsCollection = collection(db, path);
    return onSnapshot(
      bookingsCollection,
      (snapshot) => {
        const bookingsList: Booking[] = [];
        snapshot.forEach((docSnap) => {
          bookingsList.push({
            id: docSnap.id,
            ...docSnap.data()
          } as Booking);
        });
        onNext(bookingsList);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
        if (onError) onError(error as Error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    throw error;
  }
}

/**
 * Saves a single booking to Firestore
 */
export async function saveBookingToFirestore(booking: Booking): Promise<void> {
  const path = `bookings/${booking.id}`;
  try {
    const docRef = doc(db, 'bookings', booking.id);
    await setDoc(docRef, {
      clientName: booking.clientName,
      clientPhone: booking.clientPhone,
      clientEmail: booking.clientEmail || '',
      serviceId: booking.serviceId,
      serviceName: booking.serviceName,
      date: booking.date,
      time: booking.time,
      status: booking.status,
      address: booking.address,
      street: booking.street || '',
      number: booking.number || '',
      neighborhood: booking.neighborhood || '',
      notes: booking.notes || '',
      createdAt: booking.createdAt
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Updates the status of an existing booking in Firestore
 */
export async function updateBookingStatusInFirestore(
  bookingId: string, 
  status: Booking['status']
): Promise<void> {
  const path = `bookings/${bookingId}`;
  try {
    const docRef = doc(db, 'bookings', bookingId);
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Deletes a booking from Firestore
 */
export async function deleteBookingFromFirestore(bookingId: string): Promise<void> {
  const path = `bookings/${bookingId}`;
  try {
    const docRef = doc(db, 'bookings', bookingId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Deletes all bookings and clients from Firestore
 */
export async function clearAllBookingsFromFirestore(): Promise<void> {
  try {
    const bookingsCollection = collection(db, 'bookings');
    const querySnapshot = await getDocs(bookingsCollection);
    const deletePromises: Promise<void>[] = [];
    querySnapshot.forEach((docSnap) => {
      deletePromises.push(deleteDoc(doc(db, 'bookings', docSnap.id)));
    });
    await Promise.all(deletePromises);

    const clientsCollection = collection(db, 'clients');
    const clientsSnapshot = await getDocs(clientsCollection);
    const deleteClientPromises: Promise<void>[] = [];
    clientsSnapshot.forEach((docSnap) => {
      deleteClientPromises.push(deleteDoc(doc(db, 'clients', docSnap.id)));
    });
    await Promise.all(deleteClientPromises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'bookings/clients');
  }
}

/**
 * Saves or updates a client's profile information in the 'clients' collection in Firestore.
 * If the client ID (phone number) already exists, merges and appends the new data instead of duplicating.
 */
export async function saveClientToFirestore(client: Client): Promise<void> {
  const cleanId = client.id ? client.id.replace(/\D/g, '') : client.id;
  const path = `clients/${cleanId}`;
  try {
    const docRef = doc(db, 'clients', cleanId);
    const existingSnap = await getDoc(docRef);

    const clientData: Record<string, any> = {
      id: cleanId,
      name: client.name,
      phone: client.phone,
      address: client.address,
      updatedAt: new Date().toISOString()
    };

    if (client.email && client.email.trim()) {
      clientData.email = client.email.trim();
    }
    if (client.street && client.street.trim()) {
      clientData.street = client.street.trim();
    }
    if (client.number && client.number.trim()) {
      clientData.number = client.number.trim();
    }
    if (client.neighborhood && client.neighborhood.trim()) {
      clientData.neighborhood = client.neighborhood.trim();
    }

    if (existingSnap.exists()) {
      // Document already exists: preserve original createdAt and merge fields
      const existingData = existingSnap.data();
      clientData.createdAt = existingData.createdAt || client.createdAt;
      if (!clientData.email && existingData.email) clientData.email = existingData.email;
      if (!clientData.street && existingData.street) clientData.street = existingData.street;
      if (!clientData.number && existingData.number) clientData.number = existingData.number;
      if (!clientData.neighborhood && existingData.neighborhood) clientData.neighborhood = existingData.neighborhood;
    } else {
      clientData.createdAt = client.createdAt;
    }

    // Use setDoc with { merge: true } to update/append new data without duplicating IDs
    await setDoc(docRef, clientData, { merge: true });

    // Clean up any duplicate legacy client docs that match this phone number under a different document ID
    if (client.phone) {
      const rawPhone = client.phone;
      const clientsColl = collection(db, 'clients');
      const snapshot = await getDocs(clientsColl);
      snapshot.forEach((docSnap) => {
        if (docSnap.id !== cleanId) {
          const data = docSnap.data();
          const docCleanPhone = (data.phone || '').replace(/\D/g, '');
          if (docSnap.id === rawPhone || docCleanPhone === cleanId) {
            deleteDoc(doc(db, 'clients', docSnap.id)).catch(() => {});
          }
        }
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribes to all clients in real-time from Firestore
 */
export function subscribeToClients(
  onNext: (clients: Client[]) => void,
  onError?: (error: Error) => void
) {
  const path = 'clients';
  try {
    const clientsCollection = collection(db, path);
    return onSnapshot(
      clientsCollection,
      (snapshot) => {
        const clientsList: Client[] = [];
        snapshot.forEach((docSnap) => {
          clientsList.push({
            id: docSnap.id,
            ...docSnap.data()
          } as Client);
        });
        onNext(clientsList);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
        if (onError) onError(error as Error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    throw error;
  }
}

/**
 * Deletes a client profile from Firestore
 */
export async function deleteClientFromFirestore(clientId: string, rawPhone?: string): Promise<void> {
  try {
    const cleanId = clientId ? clientId.replace(/\D/g, '') : '';
    const deletePromises: Promise<void>[] = [];

    // 1. Delete direct document by clean ID
    if (cleanId) {
      deletePromises.push(deleteDoc(doc(db, 'clients', cleanId)).catch(() => {}));
    }
    // 2. Delete direct document by original clientId if different
    if (clientId && clientId !== cleanId) {
      deletePromises.push(deleteDoc(doc(db, 'clients', clientId)).catch(() => {}));
    }
    // 3. Delete direct document by rawPhone if provided
    if (rawPhone && rawPhone !== clientId && rawPhone !== cleanId) {
      deletePromises.push(deleteDoc(doc(db, 'clients', rawPhone)).catch(() => {}));
    }

    // 4. Query all documents in 'clients' collection to remove any matching records
    const clientsColl = collection(db, 'clients');
    const snapshot = await getDocs(clientsColl);
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const docCleanPhone = (data.phone || '').replace(/\D/g, '');
      const docId = docSnap.id.replace(/\D/g, '');
      const dataId = (data.id || '').replace(/\D/g, '');

      const matchesClean = cleanId && (docCleanPhone === cleanId || docId === cleanId || dataId === cleanId);
      const matchesRaw = rawPhone && (data.phone === rawPhone || docSnap.id === rawPhone);

      if (matchesClean || matchesRaw) {
        deletePromises.push(deleteDoc(doc(db, 'clients', docSnap.id)).catch(() => {}));
      }
    });

    await Promise.all(deletePromises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `clients/${clientId}`);
  }
}

