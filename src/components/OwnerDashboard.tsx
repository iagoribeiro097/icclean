import React, { useState, useMemo } from 'react';
import { Booking } from '../types';
import { ShieldAlert, Users, CheckCircle2, XCircle, AlertCircle, Phone, Mail, MapPin, Calendar, Clock, Lock, KeyRound, Sparkles, Filter, RefreshCw, Trash2, UserCheck, ChevronLeft, ChevronRight, CalendarDays, MessageCircle, PhoneCall, ArrowLeft } from 'lucide-react';

interface OwnerDashboardProps {
  bookings: Booking[];
  onUpdateStatus: (bookingId: string, newStatus: Booking['status']) => void;
  onClearAllBookings?: () => void;
  onDeleteBooking?: (bookingId: string) => void;
  onDeleteClient?: (clientPhone: string) => void;
}

export default function OwnerDashboard({ bookings, onUpdateStatus, onClearAllBookings, onDeleteBooking, onDeleteClient }: OwnerDashboardProps) {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [activeSection, setActiveSection] = useState<'bookings' | 'calendar' | 'clients'>('bookings');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingClientPhone, setDeletingClientPhone] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Calendar State
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'Lulu0987*') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Senha administrativa inválida.');
    }
  };

  // Stats calculation
  const totalBookings = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const approvedCount = bookings.filter(b => b.status === 'approved').length;
  const rejectedCount = bookings.filter(b => b.status === 'rejected').length;

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  // Unique clients extraction from bookings
  interface ClientData {
    name: string;
    phone: string;
    email: string;
    lastAddress: string;
    totalBookings: number;
    bookings: Booking[];
  }

  const clientsMap = new Map<string, ClientData>();
  bookings.forEach(b => {
    const key = b.clientPhone.replace(/\D/g, '') || b.clientName.trim().toLowerCase();
    if (!clientsMap.has(key)) {
      clientsMap.set(key, {
        name: b.clientName,
        phone: b.clientPhone,
        email: b.clientEmail,
        lastAddress: b.address,
        totalBookings: 1,
        bookings: [b]
      });
    } else {
      const existing = clientsMap.get(key)!;
      existing.totalBookings += 1;
      existing.bookings.push(b);
      if (!existing.email && b.clientEmail) {
        existing.email = b.clientEmail;
      }
    }
  });
  const clientsList = Array.from(clientsMap.values());

  // STRICT FILTER: Only bookings confirmed/approved by owner are shown on the calendar
  const approvedBookings = useMemo(() => {
    return bookings.filter(b => b.status === 'approved');
  }, [bookings]);

  // Map approved bookings by normalized date key YYYY-MM-DD
  const approvedBookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    approvedBookings.forEach(b => {
      if (!b.date) return;
      let dateKey = b.date;
      if (b.date.includes('/')) {
        const parts = b.date.split('/');
        if (parts.length === 3 && parts[2].length === 4) {
          dateKey = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      } else {
        const parts = b.date.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
          dateKey = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        }
      }
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(b);
    });
    return map;
  }, [approvedBookings]);

  // Calendar calculations
  const monthNamesPortuguese = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const calYear = currentMonthDate.getFullYear();
  const calMonth = currentMonthDate.getMonth();
  const currentMonthName = monthNamesPortuguese[calMonth];

  const firstDayOfMonth = new Date(calYear, calMonth, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();

  const calendarGrid = useMemo(() => {
    const grid: Array<{
      dateKey: string;
      dayNum: number;
      isCurrentMonth: boolean;
      bookings: Booking[];
    }> = [];

    // Prev month padding
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const pDay = daysInPrevMonth - i;
      const prevDate = new Date(calYear, calMonth - 1, pDay);
      const yyyy = prevDate.getFullYear();
      const mm = String(prevDate.getMonth() + 1).padStart(2, '0');
      const dd = String(pDay).padStart(2, '0');
      const dateKey = `${yyyy}-${mm}-${dd}`;
      grid.push({
        dateKey,
        dayNum: pDay,
        isCurrentMonth: false,
        bookings: approvedBookingsByDate[dateKey] || []
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const yyyy = calYear;
      const mm = String(calMonth + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dateKey = `${yyyy}-${mm}-${dd}`;
      grid.push({
        dateKey,
        dayNum: d,
        isCurrentMonth: true,
        bookings: approvedBookingsByDate[dateKey] || []
      });
    }

    // Next month padding to complete 7-day rows
    const totalSoFar = grid.length;
    const remaining = (7 - (totalSoFar % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(calYear, calMonth + 1, d);
      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dateKey = `${yyyy}-${mm}-${dd}`;
      grid.push({
        dateKey,
        dayNum: d,
        isCurrentMonth: false,
        bookings: approvedBookingsByDate[dateKey] || []
      });
    }

    return grid;
  }, [calYear, calMonth, startingDayOfWeek, daysInMonth, daysInPrevMonth, approvedBookingsByDate]);

  const todayStr = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const handlePrevMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentMonthDate(now);
    setSelectedCalendarDate(todayStr);
  };

  // Filter confirmed bookings for display in calendar detail panel
  const selectedDateBookings = useMemo(() => {
    if (selectedCalendarDate) {
      return approvedBookings.filter(b => {
        let dateKey = b.date;
        if (b.date.includes('/')) {
          const parts = b.date.split('/');
          if (parts.length === 3 && parts[2].length === 4) {
            dateKey = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }
        return dateKey === selectedCalendarDate;
      });
    }
    const activeMonthPrefix = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
    return approvedBookings.filter(b => {
      let dateKey = b.date;
      if (b.date.includes('/')) {
        const parts = b.date.split('/');
        if (parts.length === 3 && parts[2].length === 4) {
          dateKey = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
      return dateKey.startsWith(activeMonthPrefix);
    });
  }, [selectedCalendarDate, approvedBookings, calYear, calMonth]);

  // If not logged in, show lock screen
  if (!isAuthenticated) {
    return (
      <section id="area-dono" className="py-20 bg-slate-950 text-white min-h-[500px] flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-slate-900 border border-blue-900/50 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500"></div>
            
            <button
              onClick={() => {
                const el = document.getElementById('servicos');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-xs font-bold transition-all cursor-pointer mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-blue-400" />
              <span>Voltar ao Site</span>
            </button>

            <div className="mx-auto w-12 h-12 bg-blue-500/15 border border-blue-500/30 rounded-full flex items-center justify-center text-blue-400">
              <Lock className="h-6 w-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold tracking-tight">Painel do Dono (Administração)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Área reservada para o administrador aceitar ou rejeitar agendamentos e visualizar informações completas de contato dos clientes.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Senha de Acesso</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Digite a senha"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  />
                </div>
                {loginError && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1.5">{loginError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/15"
              >
                Entrar no Painel
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="area-dono" className="py-16 bg-slate-950 text-white border-t border-blue-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title with Log Out button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-slate-800">
          <div>
            <button
              onClick={() => {
                const el = document.getElementById('servicos');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-blue-500 text-slate-300 hover:text-white rounded-full text-xs font-bold transition-all cursor-pointer mb-3"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-blue-400" />
              <span>Voltar ao Site</span>
            </button>
            <div className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-bold uppercase tracking-wider mb-1 block">
              <Sparkles className="h-4 w-4 inline mr-1" />
              Sessão Administrativa Ativa
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Controle de Agendamentos</h2>
          </div>
          
          <div className="flex items-center gap-3">
            {onClearAllBookings && bookings.length > 0 && (
              <>
                {showResetConfirm ? (
                  <div className="flex items-center gap-1.5 bg-rose-950/60 border border-rose-900/60 p-1.5 rounded-xl text-xs">
                    <span className="text-rose-200 font-bold px-1">Resetar tudo?</span>
                    <button
                      onClick={() => {
                        onClearAllBookings();
                        setShowResetConfirm(false);
                      }}
                      className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold cursor-pointer"
                    >
                      Sim
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold cursor-pointer"
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="px-3.5 py-2 border border-rose-900/60 hover:bg-rose-950/40 text-rose-400 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Resetar Dados
                  </button>
                )}
              </>
            )}
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Sair do Painel
            </button>
          </div>
        </div>

        {/* Dashboard Stats Panel */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Total */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Solicitações</p>
              <p className="text-2xl font-black">{totalBookings}</p>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Pendentes</p>
              <p className="text-2xl font-black">{pendingCount}</p>
            </div>
          </div>

          {/* Approved */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Aprovados</p>
              <p className="text-2xl font-black">{approvedCount}</p>
            </div>
          </div>

          {/* Rejected */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Recusados</p>
              <p className="text-2xl font-black">{rejectedCount}</p>
            </div>
          </div>

        </div>

        {/* Navigation Tabs for Owner Dashboard */}
        <div className="flex flex-wrap border-b border-slate-800 mb-8 gap-2">
          <button
            onClick={() => setActiveSection('bookings')}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeSection === 'bookings' 
                ? 'border-blue-500 text-blue-400 font-extrabold' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="h-4.5 w-4.5" />
            Solicitações ({totalBookings})
          </button>
          <button
            onClick={() => setActiveSection('clients')}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeSection === 'clients' 
                ? 'border-blue-500 text-blue-400 font-extrabold' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            Clientes Cadastrados ({clientsList.length})
          </button>
          <button
            onClick={() => setActiveSection('calendar')}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeSection === 'calendar' 
                ? 'border-emerald-500 text-emerald-400 font-extrabold' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarDays className="h-4.5 w-4.5 text-emerald-400" />
            Calendário de Higienizações ({approvedCount})
          </button>
        </div>

        {activeSection === 'bookings' ? (
          <>
            {/* Controls Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Filter className="h-4 w-4" />
                Filtrar por Status:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'Todos', color: 'bg-slate-800 text-slate-200' },
                  { id: 'pending', label: 'Pendentes', color: 'bg-amber-500/20 text-amber-300' },
                  { id: 'approved', label: 'Aprovados', color: 'bg-emerald-500/20 text-emerald-300' },
                  { id: 'rejected', label: 'Recusados', color: 'bg-rose-500/20 text-rose-300' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      filter === f.id ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings List */}
            {filteredBookings.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    className={`bg-slate-900 border rounded-2xl p-6 space-y-5 shadow-lg relative overflow-hidden transition-all hover:border-slate-700 ${
                      b.status === 'approved' ? 'border-emerald-900/50 hover:border-emerald-800' :
                      b.status === 'rejected' ? 'border-rose-900/50 hover:border-rose-800' : 'border-slate-800'
                    }`}
                  >
                    {/* Visual side-marker status bar */}
                    <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                      b.status === 'approved' ? 'bg-emerald-500' :
                      b.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                    }`}></div>

                    {/* Main Client Info Header */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-lg font-black text-slate-100 line-clamp-1">{b.clientName}</h3>
                        <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full ${
                          b.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' :
                          b.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                        }`}>
                          {b.status === 'approved' ? 'Aprovado' :
                           b.status === 'rejected' ? 'Recusado' : 'Pendente'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-blue-400 font-bold">{b.serviceName}</p>
                        <span className="text-[9px] font-mono text-slate-500">ID: {b.id}</span>
                      </div>
                    </div>

                    {/* Complete details block (Saves owner and shows ALL info) */}
                    <div className="space-y-3 pt-3 border-t border-slate-800 text-xs text-slate-300">
                      {/* Date and hour */}
                      <div className="flex items-center gap-2.5">
                        <Calendar className="h-4.5 w-4.5 text-blue-500 shrink-0" />
                        <span>
                          <strong className="text-slate-100">Data agendada:</strong> {b.date.split('-').reverse().join('/')}
                        </span>
                        <span className="text-slate-500">|</span>
                        <Clock className="h-4.5 w-4.5 text-blue-500 shrink-0" />
                        <span>{b.time}</span>
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-2.5">
                        <MapPin className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-slate-100">Endereço completo:</strong> {b.address}
                        </span>
                      </div>

                      {/* Telephone / WhatsApp contact */}
                      <div className="flex items-center gap-2.5">
                        <Phone className="h-4.5 w-4.5 text-blue-500 shrink-0" />
                        <div className="flex items-center gap-2">
                          <span><strong className="text-slate-100">Celular:</strong> {b.clientPhone}</span>
                          <a
                            href={`https://wa.me/55${b.clientPhone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(b.clientName)},%20sou%20da%20IC%20CLEAN%20e%20gostaria%20de%20falar%20sobre%20seu%20agendamento.`}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            className="px-2 py-0.5 bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-400 font-black rounded text-[9px]"
                          >
                            Chamar no WhatsApp
                          </a>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex items-center gap-2.5">
                        <Mail className="h-4.5 w-4.5 text-blue-500 shrink-0" />
                        <span>
                          <strong className="text-slate-100">E-mail:</strong> {b.clientEmail || 'Não informado'}
                        </span>
                      </div>

                      {/* Customer Notes */}
                      {b.notes && (
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                          <p className="text-[10px] uppercase text-blue-400 font-black">Observações do Cliente:</p>
                          <p className="text-slate-300 italic">{b.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions buttons */}
                    <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-2 justify-end items-center">
                      {onDeleteBooking && (
                        <div className="mr-auto">
                          {deletingId === b.id ? (
                            <div className="flex items-center gap-1.5 bg-rose-950/50 border border-rose-900/40 p-1.5 rounded-xl text-[11px] animate-in fade-in zoom-in-95 duration-150">
                              <span className="text-rose-200 font-bold px-1">Excluir permanentemente?</span>
                              <button
                                onClick={async () => {
                                  await onDeleteBooking(b.id);
                                  setDeletingId(null);
                                }}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-black cursor-pointer"
                              >
                                Sim
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold cursor-pointer"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingId(b.id)}
                              className="px-3 py-2 border border-rose-900/60 hover:bg-rose-950 text-rose-500 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                              title="Excluir Agendamento"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Excluir</span>
                            </button>
                          )}
                        </div>
                      )}

                      {b.status !== 'approved' && (
                        <button
                          onClick={() => onUpdateStatus(b.id, 'approved')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Aceitar Agendamento
                        </button>
                      )}
                      {b.status !== 'rejected' && (
                        <button
                          onClick={() => onUpdateStatus(b.id, 'rejected')}
                          className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Recusar / Cancelar
                        </button>
                      )}
                      {b.status !== 'pending' && (
                        <button
                          onClick={() => onUpdateStatus(b.id, 'pending')}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Voltar para Pendente
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 border border-slate-800 bg-slate-900 rounded-3xl text-center text-slate-400 space-y-3">
                <ShieldAlert className="h-10 w-10 text-slate-500 mx-auto" />
                <p className="font-bold text-lg text-slate-200">Nenhum agendamento nesta categoria</p>
                <p className="text-xs max-w-sm mx-auto">
                  Até o momento, não foram registradas solicitações que correspondam ao filtro selecionado.
                </p>
              </div>
            )}
          </>
        ) : activeSection === 'clients' ? (
          /* Clients CRM list */
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Base de Clientes Cadastrados
              </h3>
              <p className="text-xs text-slate-400">
                Estes são os clientes únicos cadastrados no banco de dados através das solicitações de higienização.
              </p>
            </div>

            {clientsList.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clientsList.map((client, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg hover:border-slate-700 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3">
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2.5 py-1 rounded-full font-bold">
                        {client.totalBookings} {client.totalBookings === 1 ? 'Agendamento' : 'Agendamentos'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-lg font-black text-slate-100 flex items-center gap-2 pr-16">
                        <UserCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                        <span className="truncate">{client.name}</span>
                      </h4>

                      <div className="space-y-1.5 pt-2 text-xs text-slate-300 border-t border-slate-800">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          <a href={`tel:${client.phone}`} className="hover:underline text-blue-400 font-medium">
                            {client.phone}
                          </a>
                        </div>
                        {client.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                          <span>
                            {client.lastAddress}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <a
                        href={`https://wa.me/55${client.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(client.name)},%20tudo%20bem?`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>Chamar no WhatsApp</span>
                      </a>

                      {client.phone && (
                        <button
                          onClick={() => setDeletingClientPhone(client.phone)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 rounded-xl transition-all cursor-pointer shrink-0"
                          title="Excluir este cliente e seus agendamentos"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 border border-slate-800 bg-slate-900 rounded-3xl text-center text-slate-400 space-y-3">
                <Users className="h-10 w-10 text-slate-500 mx-auto" />
                <p className="font-bold text-lg text-slate-200">Nenhum cliente cadastrado</p>
                <p className="text-xs max-w-sm mx-auto">
                  Os clientes aparecerão aqui assim que realizarem o primeiro agendamento.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Calendar View for Confirmed Sanitization Services */
          <div className="space-y-8">
            {/* Calendar Header Notice */}
            <div className="bg-slate-900 border border-emerald-900/40 p-6 rounded-3xl space-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <CalendarDays className="h-6 w-6 text-emerald-400" />
                    Calendário de Higienizações Agendadas
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Exibindo <strong className="text-emerald-400 font-bold">apenas as solicitações confirmadas/aprovadas</strong> pelo dono.
                  </p>
                </div>
                
                {/* Month navigation controls */}
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors cursor-pointer"
                    title="Mês Anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-sm font-extrabold px-3 text-slate-100 min-w-[140px] text-center">
                    {currentMonthName} {calYear}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors cursor-pointer"
                    title="Próximo Mês"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleToday}
                    className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/30 transition-all cursor-pointer ml-1"
                  >
                    Hoje
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid Container */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dayName, i) => (
                  <div
                    key={i}
                    className={`text-xs font-bold py-2 uppercase tracking-wider ${
                      i === 0 || i === 6 ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {calendarGrid.map((cell, idx) => {
                  const hasApprovedBookings = cell.bookings.length > 0;
                  const isToday = cell.dateKey === todayStr;
                  const isSelected = selectedCalendarDate === cell.dateKey;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedCalendarDate(cell.dateKey === selectedCalendarDate ? null : cell.dateKey);
                      }}
                      className={`min-h-[80px] sm:min-h-[95px] p-2 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                        !cell.isCurrentMonth ? 'opacity-35 bg-slate-950/40 border border-slate-900' : 'bg-slate-950/80 border border-slate-800/80 hover:border-slate-700'
                      } ${
                        isSelected ? '!border-2 !border-emerald-400 !bg-emerald-950/40 shadow-lg shadow-emerald-500/10' : ''
                      } ${
                        hasApprovedBookings && !isSelected
                          ? 'border-emerald-500/50 bg-emerald-950/25 hover:bg-emerald-950/40'
                          : ''
                      } ${
                        isToday && !isSelected ? 'ring-2 ring-blue-500/80' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span
                          className={`text-xs sm:text-sm font-extrabold rounded-lg px-1.5 py-0.5 ${
                            isToday
                              ? 'bg-blue-600 text-white'
                              : hasApprovedBookings
                              ? 'text-emerald-300 font-black'
                              : cell.isCurrentMonth
                              ? 'text-slate-300'
                              : 'text-slate-600'
                          }`}
                        >
                          {cell.dayNum}
                        </span>

                        {isToday && (
                          <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-1 rounded uppercase hidden sm:inline">
                            Hoje
                          </span>
                        )}
                      </div>

                      {/* Indicator badge if day has approved bookings */}
                      {hasApprovedBookings ? (
                        <div className="mt-1 space-y-1 w-full">
                          <div className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-1.5 py-0.5 rounded-lg text-[10px] font-bold">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                            <span className="truncate">
                              {cell.bookings.length} {cell.bookings.length === 1 ? 'Higienização' : 'Higienizações'}
                            </span>
                          </div>
                          {/* Show list of client names right inside the calendar grid cell */}
                          <div className="space-y-1 mt-1">
                            {cell.bookings.map((bk, bIdx) => (
                              <div key={bIdx} className="text-[10px] text-emerald-200/90 truncate font-semibold flex items-center justify-between gap-1 bg-emerald-900/30 px-1.5 py-1 rounded border border-emerald-800/40">
                                <div className="flex items-center gap-1 truncate">
                                  <Users className="h-2.5 w-2.5 text-emerald-400 shrink-0" />
                                  <span className="truncate">{bk.clientName.split(' ')[0]} ({bk.time})</span>
                                </div>
                                <a
                                  href={`https://wa.me/55${bk.clientPhone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(bk.clientName)},%20sou%20da%20IC%20CLEAN!%20Estou%20entrando%20em%20contato%20sobre%20sua%20higienização%20agendada%20para%20dia%20${encodeURIComponent(bk.date)}%20às%20${encodeURIComponent(bk.time)}.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-all shrink-0"
                                  title={`Falar com ${bk.clientName} no WhatsApp`}
                                >
                                  <MessageCircle className="h-3 w-3" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1 text-[10px] text-slate-600 invisible group-hover:visible transition-opacity">
                          Clique p/ ver
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Date or Month Details List */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    {selectedCalendarDate ? (
                      <>Higienizações Confirmadas em {selectedCalendarDate.split('-').reverse().join('/')}</>
                    ) : (
                      <>Todas as Higienizações Confirmadas de {currentMonthName} ({selectedDateBookings.length})</>
                    )}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {selectedCalendarDate
                      ? 'Mostrando serviços confirmados para esta data específica.'
                      : 'Clique em um dia do calendário para filtrar por data específica.'}
                  </p>
                </div>

                {selectedCalendarDate && (
                  <button
                    onClick={() => setSelectedCalendarDate(null)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Ver todo o mês
                  </button>
                )}
              </div>

              {selectedDateBookings.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {selectedDateBookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-slate-950 border border-emerald-900/40 rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-lg hover:border-emerald-600/50 transition-all"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>

                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-block mb-1">
                            ✓ Confirmado
                          </span>
                          <h5 className="text-base font-black text-white">{b.serviceName}</h5>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-slate-200 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-emerald-400" />
                            {b.time}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-slate-300 pt-1">
                        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                            <span>Cliente</span>
                            <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                              <UserCheck className="h-3 w-3" />
                              Cadastrado
                            </span>
                          </div>
                          <p className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
                            {b.clientName}
                          </p>
                          <p className="text-slate-300 flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                            <a href={`tel:${b.clientPhone}`} className="hover:underline font-medium">{b.clientPhone}</a>
                          </p>
                          {b.clientEmail && (
                            <p className="text-slate-400 flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                              <span className="truncate">{b.clientEmail}</span>
                            </p>
                          )}
                          <p className="text-slate-400 flex items-start gap-1.5 pt-0.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                            <span>{b.address}{b.neighborhood ? ` (${b.neighborhood})` : ''}</span>
                          </p>
                        </div>

                        {b.notes && (
                          <p className="text-slate-400 italic bg-slate-900/80 p-2.5 rounded-xl text-[11px] border border-slate-800">
                            <strong>Obs:</strong> "{b.notes}"
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2">
                        <a
                          href={`https://wa.me/55${b.clientPhone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(b.clientName)},%20sou%20da%20IC%20CLEAN!%20Estou%20entrando%20em%20contato%20sobre%20sua%20higienização%20agendada%20para%20o%20dia%20${encodeURIComponent(b.date)}%20às%20${encodeURIComponent(b.time)}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-w-[140px] py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>Falar no WhatsApp</span>
                        </a>

                        <a
                          href={`tel:${b.clientPhone.replace(/\D/g, '')}`}
                          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          title={`Ligar para ${b.clientPhone}`}
                        >
                          <PhoneCall className="h-3.5 w-3.5 text-blue-400" />
                          <span className="hidden sm:inline">Ligar</span>
                        </a>

                        {b.clientEmail && (
                          <a
                            href={`mailto:${b.clientEmail}?subject=IC%20CLEAN%20-%20Agendamento%20para%20${encodeURIComponent(b.date)}`}
                            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            title={`Enviar e-mail para ${b.clientEmail}`}
                          >
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span className="hidden sm:inline">E-mail</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <Calendar className="h-8 w-8 mx-auto text-slate-600" />
                  <p className="font-bold text-slate-300">
                    {selectedCalendarDate
                      ? 'Nenhuma higienização confirmada para esta data.'
                      : 'Nenhuma higienização confirmada neste mês.'}
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    As solicitações precisam ser aprovadas na aba "Solicitações" para aparecerem aqui no calendário.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
