import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ServicesSection from './components/ServicesSection';
import BeforeAfter from './components/BeforeAfter';
import BookingForm from './components/BookingForm';
import ClientDashboard from './components/ClientDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import Footer from './components/Footer';
import { Booking } from './types';
import { subscribeToBookings, saveBookingToFirestore, updateBookingStatusInFirestore, deleteBookingFromFirestore, deleteClientFromFirestore, clearAllBookingsFromFirestore } from './firebase';

// Helper to seed realistic mock data for preview/demonstration
const seedMockBookings = (): Booking[] => {
  const today = new Date();
  
  // Wednesday booking
  const wednesday = new Date(today);
  wednesday.setDate(today.getDate() + (3 - today.getDay() + 7) % 7);
  const dateWed = wednesday.toISOString().split('T')[0];

  // Saturday booking
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + (6 - today.getDay() + 7) % 7);
  const dateSat = saturday.toISOString().split('T')[0];

  // Monday booking
  const monday = new Date(today);
  monday.setDate(today.getDate() + (1 - today.getDay() + 7) % 7);
  const dateMon = monday.toISOString().split('T')[0];

  return [
    {
      id: 'IC-7K9B2X',
      clientName: 'Carlos Eduardo Silva',
      clientPhone: '(11) 98765-4321',
      clientEmail: 'carlos.silva@exemplo.com',
      serviceId: 'sofa',
      serviceName: 'Higienização de Sofás',
      date: dateSat,
      time: '09:00',
      status: 'pending',
      address: 'Av. Nove de Julho, 1200 - Anhangabaú, Jundiaí - SP',
      street: 'Av. Nove de Julho, 1200',
      neighborhood: 'Anhangabaú',
      notes: 'Sofá retrátil de 3 lugares com manchas de suco de uva e poeira acumulada.',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
    },
    {
      id: 'IC-4M8P5W',
      clientName: 'Mariana Costa Ferreira',
      clientPhone: '(11) 99123-4567',
      clientEmail: 'mariana.costa@exemplo.com',
      serviceId: 'mattress',
      serviceName: 'Higienização de Colchões',
      date: dateWed,
      time: '18:00',
      status: 'approved',
      address: 'Rua do Retiro, 450 - Vila Retiro',
      street: 'Rua do Retiro, 450',
      neighborhood: 'Vila Retiro',
      notes: 'Colchão de casal Queen. Gostaria de focar no tratamento antialérgico completo.',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
    },
    {
      id: 'IC-9R2N3K',
      clientName: 'Roberto Souza Ramos',
      clientPhone: '(11) 97777-8888',
      clientEmail: 'roberto.souza@exemplo.com',
      serviceId: 'car_seats',
      serviceName: 'Higienização de Bancos de Carro',
      date: dateMon,
      time: '18:00',
      status: 'rejected',
      address: 'Av. Jundiaí, 800 - Anhangabaú',
      street: 'Av. Jundiaí, 800',
      neighborhood: 'Anhangabaú',
      notes: 'Bancos em tecido de um Sedan médio. Manchas de café antigas.',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
    }
  ];
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'client' | 'owner'>('client');
  const [selectedServiceId, setSelectedServiceId] = useState('sofa');
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Load and subscribe to bookings from Firestore in real-time
  useEffect(() => {
    const unsubscribe = subscribeToBookings(
      async (firestoreBookings) => {
        // If Firestore is completely empty, seed it with either existing local storage bookings or seed mock bookings
        if (firestoreBookings.length === 0) {
          // If we have already initialized before, we should respect that it was cleared/emptied intentionally.
          const isInitialized = localStorage.getItem('ic_clean_initialized') === 'true';
          if (isInitialized) {
            setBookings([]);
            localStorage.setItem('ic_clean_bookings', JSON.stringify([]));
            return;
          }

          const stored = localStorage.getItem('ic_clean_bookings');
          let bookingsToSeed: Booking[] = [];
          if (stored) {
            try {
              bookingsToSeed = JSON.parse(stored);
            } catch (e) {
              bookingsToSeed = seedMockBookings();
            }
          } else {
            bookingsToSeed = seedMockBookings();
          }

          if (bookingsToSeed.length > 0) {
            console.log("Seeding initial bookings to Firestore...", bookingsToSeed);
            for (const b of bookingsToSeed) {
              await saveBookingToFirestore(b).catch(err => console.error("Error seeding booking:", err));
            }
          }
          localStorage.setItem('ic_clean_initialized', 'true');
        } else {
          // Sort bookings by createdAt descending so newest appear first
          const sorted = [...firestoreBookings]
            .filter(Boolean)
            .sort((a, b) => {
              const timeA = a && a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const timeB = b && b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return timeB - timeA;
            });
          setBookings(sorted);
          localStorage.setItem('ic_clean_bookings', JSON.stringify(sorted));
          localStorage.setItem('ic_clean_initialized', 'true');
        }
      },
      (error) => {
        console.error("Firestore subscription error: ", error);
        // Fallback to local storage if offline or error occurs
        const stored = localStorage.getItem('ic_clean_bookings');
        if (stored) {
          try {
            setBookings(JSON.parse(stored));
          } catch (e) {
            setBookings(seedMockBookings());
          }
        } else {
          setBookings(seedMockBookings());
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const handleBookingCompleted = (newBooking: Booking) => {
    // Add to local state immediately for instant feedback
    setBookings(prev => {
      if (prev.some(b => b.id === newBooking.id)) return prev;
      const updated = [newBooking, ...prev];
      localStorage.setItem('ic_clean_bookings', JSON.stringify(updated));
      localStorage.setItem('ic_clean_initialized', 'true');
      return updated;
    });

    // Smoothly scroll down to client lookup view after a slight delay
    setTimeout(() => {
      const el = document.getElementById('meu-agendamento');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1200);
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: Booking['status']) => {
    // Optimistic UI update
    setBookings(prev => {
      const updated = prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b);
      localStorage.setItem('ic_clean_bookings', JSON.stringify(updated));
      return updated;
    });
    // Persist to Firestore
    try {
      await updateBookingStatusInFirestore(bookingId, newStatus);
    } catch (err) {
      console.error("Error updating status in Firestore:", err);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    // Ensure we mark initialized as true to prevent re-seeding when count reaches 0
    localStorage.setItem('ic_clean_initialized', 'true');
    
    // Find target booking before updating state
    const targetBooking = bookings.find(b => b.id === bookingId);

    // Optimistic UI update
    setBookings(prev => {
      const filtered = prev.filter(b => b.id !== bookingId);
      localStorage.setItem('ic_clean_bookings', JSON.stringify(filtered));
      return filtered;
    });

    // Persist to Firestore
    try {
      await deleteBookingFromFirestore(bookingId);

      // Check if client has any remaining bookings
      if (targetBooking && targetBooking.clientPhone) {
        const phoneDigits = (targetBooking.clientPhone || '').replace(/\D/g, '');
        const remainingForClient = bookings.filter(
          b => b && b.id !== bookingId && (b.clientPhone || '').replace(/\D/g, '') === phoneDigits
        );
        if (remainingForClient.length === 0 && phoneDigits) {
          await deleteClientFromFirestore(phoneDigits, targetBooking.clientPhone);
        }
      }
    } catch (err) {
      console.error("Error deleting booking in Firestore:", err);
    }
  };

  const handleDeleteClient = async (clientPhone: string) => {
    localStorage.setItem('ic_clean_initialized', 'true');
    const phoneDigits = (clientPhone || '').replace(/\D/g, '');

    const clientBookings = bookings.filter(
      b => b && (b.clientPhone || '').replace(/\D/g, '') === phoneDigits
    );

    // Optimistic UI update
    setBookings(prev => {
      const filtered = prev.filter(
        b => b && (b.clientPhone || '').replace(/\D/g, '') !== phoneDigits
      );
      localStorage.setItem('ic_clean_bookings', JSON.stringify(filtered));
      return filtered;
    });

    // Persist to Firestore
    try {
      const deletePromises = clientBookings.map(b => deleteBookingFromFirestore(b.id));
      await Promise.all(deletePromises);
      if (phoneDigits) {
        await deleteClientFromFirestore(phoneDigits, clientPhone);
      }
    } catch (err) {
      console.error("Error deleting client from Firestore:", err);
    }
  };

  const handleClearAllBookings = async () => {
    localStorage.setItem('ic_clean_initialized', 'true');
    try {
      // Clear all existing documents from Firestore collection first
      await clearAllBookingsFromFirestore();
    } catch (err) {
      console.error("Erro ao limpar dados do Firestore:", err);
    }

    const seed = seedMockBookings();
    setBookings(seed);
    localStorage.setItem('ic_clean_bookings', JSON.stringify(seed));
    
    // Save each seed booking back to Firestore
    for (const b of seed) {
      await saveBookingToFirestore(b).catch(err => console.error("Error resetting booking in Firestore:", err));
    }
  };

  const handleSelectServiceAndScroll = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const formElement = document.getElementById('agendar');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNavigateToSection = (sectionId: string) => {
    // If the owner dashboard is active, switch to client layout first
    if (activeTab === 'owner') {
      setActiveTab('client');
      // Wait for React to switch rendering tree before scrolling
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-900">
      
      {/* Universal Sticky Header */}
      <Navbar
        currentTab={activeTab}
        onChangeTab={setActiveTab}
        onNavigateToSection={handleNavigateToSection}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        {activeTab === 'client' ? (
          <div className="animate-in fade-in duration-300">
            {/* Hero Banner */}
            <Hero
              onStartBooking={() => handleSelectServiceAndScroll('sofa')}
              onExploreServices={() => handleNavigateToSection('servicos')}
            />

            {/* Services catalog (Includes prices and machinery highlights) */}
            <ServicesSection onSelectService={handleSelectServiceAndScroll} />

            {/* Before and After slider section */}
            <BeforeAfter />

            {/* Live Interactive Booking form */}
            <BookingForm
              selectedServiceId={selectedServiceId}
              onBookingCompleted={handleBookingCompleted}
              existingBookings={bookings}
            />

            {/* Customer order tracker lookup area */}
            <ClientDashboard bookings={bookings} />
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            {/* Administrative console */}
            <OwnerDashboard
              bookings={bookings}
              onUpdateStatus={handleUpdateStatus}
              onClearAllBookings={handleClearAllBookings}
              onDeleteBooking={handleDeleteBooking}
              onDeleteClient={handleDeleteClient}
              onBackToSite={() => setActiveTab('client')}
            />
          </div>
        )}
      </main>

      {/* Universal Footer */}
      <Footer onNavigateToSection={handleNavigateToSection} />

    </div>
  );
}
