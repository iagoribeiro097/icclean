import React, { useState, useEffect } from 'react';
import { SERVICES, OWNER_PHONE_RAW } from '../data/services';
import { Booking, Client } from '../types';
import { Calendar, Clock, MapPin, User, Mail, Phone, PlusCircle, Check, Info, ArrowLeft, Copy, Ticket, CheckCircle2, MessageCircle } from 'lucide-react';
import { saveBookingToFirestore, saveClientToFirestore } from '../firebase';

const formatBrazilianPhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

interface BookingFormProps {
  selectedServiceId: string;
  onBookingCompleted: (newBooking: Booking) => void;
  existingBookings: Booking[];
}

export default function BookingForm({ selectedServiceId, onBookingCompleted, existingBookings }: BookingFormProps) {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [serviceId, setServiceId] = useState(selectedServiceId || 'sofa');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [cep, setCep] = useState('');
  const [cityState, setCityState] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState('');
  const [notes, setNotes] = useState('');

  const formatCEP = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };

  const handleCepChange = async (value: string) => {
    const formatted = formatCEP(value);
    setCep(formatted);
    setCepError('');

    const digits = formatted.replace(/\D/g, '');
    if (digits.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await response.json();
        if (data.erro) {
          setCepError('CEP não encontrado. Digite o endereço manualmente.');
        } else {
          if (data.logradouro) setStreet(data.logradouro);
          if (data.bairro) setNeighborhood(data.bairro);
          if (data.localidade && data.uf) setCityState(`${data.localidade} - ${data.uf}`);
        }
      } catch (err) {
        setCepError('Erro ao buscar CEP. Preencha o endereço manualmente.');
      } finally {
        setLoadingCep(false);
      }
    }
  };
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync with selectedServiceId from outer component triggers
  useEffect(() => {
    if (selectedServiceId) {
      setServiceId(selectedServiceId);
    }
  }, [selectedServiceId]);

  // Determine weekday from date string
  const getDayOfWeek = (dateString: string): number => {
    if (!dateString) return -1;
    const parts = dateString.split('-');
    if (parts.length !== 3) return -1;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  };

  const weekday = getDayOfWeek(date);

  // Determine available times based on selected date
  const getAvailableTimes = (): string[] => {
    if (weekday === -1) return [];
    if (weekday === 0) return []; // Sunday
    
    let defaultTimes: string[] = [];
    if (weekday >= 1 && weekday <= 5) {
      defaultTimes = ['18:00']; // Mon-Fri
    } else if (weekday === 6) {
      defaultTimes = ['09:00', '14:00']; // Sat
    }

    // Filter out times that are already booked (status must be 'pending' or 'approved' to block the slot)
    return defaultTimes.filter(t => {
      const isTaken = existingBookings.some(b => 
        b.date === date && 
        b.time === t && 
        (b.status === 'pending' || b.status === 'approved')
      );
      return !isTaken;
    });
  };

  const availableTimes = getAvailableTimes();

  // Reset selected time when date changes and previous time is invalid for new date
  useEffect(() => {
    setTime('');
  }, [date]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!clientName || !clientPhone || !serviceId || !date || !time || !cep || !street || !number || !neighborhood) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios (incluindo CEP, Rua, Número e Bairro).');
      return;
    }

    if (cep.replace(/\D/g, '').length < 8) {
      setErrorMsg('Por favor, informe um CEP válido de 8 dígitos para preenchimento do endereço.');
      return;
    }

    const address = `${street.trim()}, Nº ${number.trim()} - ${neighborhood.trim()}${cityState ? ` (${cityState})` : ''}`;

    const phoneDigits = clientPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      setErrorMsg('Por favor, insira um WhatsApp válido com DDD (ex: 11 97464-7356).');
      return;
    }

    if (weekday === 0) {
      setErrorMsg('Infelizmente não trabalhamos aos domingos. Por favor, escolha outra data.');
      return;
    }

    // Double check if slot has been taken in the meantime (to prevent race conditions)
    const isTaken = existingBookings.some(b => 
      b.date === date && 
      b.time === time && 
      (b.status === 'pending' || b.status === 'approved')
    );

    if (isTaken) {
      setErrorMsg('Infelizmente, este dia e horário já foram reservados por outro cliente. Por favor, selecione outra opção.');
      return;
    }

    const selectedService = SERVICES.find(s => s.id === serviceId);
    const serviceName = selectedService ? selectedService.name : 'Serviço Personalizado';

    // Generate unique alphanumeric tracking code with letters and numbers (e.g., IC-7K9B2X)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let codeBody = '';
    for (let i = 0; i < 6; i++) {
      codeBody += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const uniqueCode = `IC-${codeBody}`;

    const newBooking: Booking = {
      id: uniqueCode,
      clientName,
      clientPhone,
      clientEmail: clientEmail.trim().toLowerCase(),
      serviceId,
      serviceName,
      date,
      time,
      status: 'pending',
      address,
      street: street.trim(),
      number: number.trim(),
      neighborhood: neighborhood.trim(),
      notes,
      createdAt: new Date().toISOString()
    };

    // Save to localStorage
    const existingStr = localStorage.getItem('ic_clean_bookings');
    const existing: Booking[] = existingStr ? JSON.parse(existingStr) : [];
    existing.push(newBooking);
    localStorage.setItem('ic_clean_bookings', JSON.stringify(existing));

    const newClient: Client = {
      id: phoneDigits,
      name: clientName,
      phone: clientPhone,
      email: clientEmail.trim().toLowerCase(),
      address: address,
      street: street.trim(),
      number: number.trim(),
      neighborhood: neighborhood.trim(),
      createdAt: new Date().toISOString()
    };

    // Save Client to Firestore
    saveClientToFirestore(newClient).catch(err => {
      console.error("Erro ao salvar cliente no Firestore: ", err);
    });

    // Save to Firestore
    saveBookingToFirestore(newBooking).catch(err => {
      console.error("Erro ao salvar no Firestore: ", err);
    });

    setCreatedBooking(newBooking);
    setSuccess(true);
    onBookingCompleted(newBooking);

    // Reset Form Fields
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setCep('');
    setCityState('');
    setCepError('');
    setStreet('');
    setNumber('');
    setNeighborhood('');
    setNotes('');
    setDate('');
    setTime('');
  };

  return (
    <section id="agendar" className="py-20 bg-white text-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-12 space-y-3">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('servicos');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-600 rounded-full text-xs font-bold transition-all shadow-sm mb-2 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar aos Serviços</span>
          </button>
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-blue-600">
            Praticidade e Rapidez
          </h2>
          <p className="text-3xl font-extrabold tracking-tight text-slate-900">
            Agende Sua Higienização Online
          </p>
          <p className="text-slate-600 text-sm max-w-lg mx-auto">
            Preencha seus dados de contato, selecione a melhor data e reserve seu horário. Entraremos em contato para confirmar sua visita!
          </p>
        </div>

        {/* Success Modal */}
        {success && createdBooking ? (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-8 text-center space-y-6 shadow-md animate-in fade-in duration-300">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Check className="h-8 w-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-950">Agendamento Solicitado!</h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                Olá <span className="font-bold text-slate-900">{createdBooking.clientName}</span>, recebemos seu pedido de higienização de <span className="font-bold text-blue-700">{createdBooking.serviceName}</span> para o dia <span className="font-bold">{createdBooking.date.split('-').reverse().join('/')}</span> às <span className="font-bold">{createdBooking.time}</span>.
              </p>
            </div>

            {/* Prominent Unique Tracking Code Display */}
            <div className="bg-white border-2 border-blue-400 border-dashed rounded-2xl p-6 max-w-md mx-auto shadow-sm space-y-3">
              <div className="flex items-center justify-center gap-1.5 text-xs uppercase font-extrabold text-blue-600 tracking-wider">
                <Ticket className="h-4 w-4 text-blue-600" />
                <span>Seu Código de Acesso</span>
              </div>
              
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-black font-mono tracking-widest text-slate-900 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
                  {createdBooking.id}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(createdBooking.id);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 3000);
                  }}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    copiedCode 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                  }`}
                >
                  {copiedCode ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed text-center">
                Guarde este código para consultar o status individual desta higienização no menu <strong>Minhas Higienizações</strong>.
              </p>

              <div className="pt-2">
                <a
                  href={`https://wa.me/${OWNER_PHONE_RAW}?text=${encodeURIComponent(`Olá IC CLEAN! Fiz a solicitação de higienização para ${createdBooking.serviceName}.\n\n*Nome:* ${createdBooking.clientName}\n*Código Único:* ${createdBooking.id}`)}`}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Avisar a IC CLEAN no WhatsApp (Opcional)</span>
                </a>
              </div>
            </div>

            {/* Visual Status Tracker */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md mx-auto text-left space-y-4">
              <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">Acompanhamento do Pedido:</p>
              
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                <div className="relative flex items-center gap-3">
                  <div className="absolute -left-5 w-4.5 h-4.5 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-600/30"></div>
                  <div>
                    <p className="text-xs font-bold text-blue-700">Pedido Recebido</p>
                    <p className="text-[11px] text-slate-500">Aguardando aprovação do profissional</p>
                  </div>
                </div>

                <div className="relative flex items-center gap-3 opacity-60">
                  <div className="absolute -left-5 w-4.5 h-4.5 rounded-full bg-slate-300 border-2 border-white"></div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Confirmado</p>
                    <p className="text-[11px] text-slate-500">Profissional a caminho na data agendada</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Action for Instant Confirmation */}
            <div className="space-y-4 max-w-md mx-auto">
              <p className="text-xs text-slate-500">
                Para acelerar a aprovação, envie uma mensagem direto pelo WhatsApp:
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`https://wa.me/${OWNER_PHONE_RAW}?text=Olá!%20Fiz%20um%20agendamento%20pelo%20site.%20Meu%20nome%20é%20${encodeURIComponent(createdBooking.clientName)}%20para%20o%20serviço%20de%20${encodeURIComponent(createdBooking.serviceName)}%20no%20dia%20${encodeURIComponent(createdBooking.date.split('-').reverse().join('/'))}%20às%20${encodeURIComponent(createdBooking.time)}.`}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  Confirmar via WhatsApp
                </a>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-bold rounded-2xl transition-all cursor-pointer"
                >
                  Novo Agendamento
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Normal form input state */
          <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm">
            
            {errorMsg && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Section 1: Client data */}
            <div className="space-y-4">
              <h3 className="text-sm uppercase font-black text-blue-600 tracking-wider">1. Seus Dados de Contato</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                
                {/* Full name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Nome Completo *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ex: Carlos Eduardo"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Telephone / WhatsApp */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">WhatsApp / Telefone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => {
                        const formatted = formatBrazilianPhone(e.target.value);
                        setClientPhone(formatted);
                      }}
                      placeholder="Ex: (11) 97464-7356"
                      maxLength={15}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Email (very important for customer lookup) */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">E-mail de Cadastro (Opcional)</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com (Opcional)"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">Se fornecido, este e-mail também poderá ser usado para consultar seus agendamentos, além do seu WhatsApp.</span>
                </div>

              </div>
            </div>

            {/* Section 2: Service and details */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <h3 className="text-sm uppercase font-black text-blue-600 tracking-wider">2. Escolha o Serviço e Endereço</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Service Selection */}
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Qual estofado deseja higienizar? *</label>
                  <select
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  >
                    {SERVICES.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* CEP Input via ViaCEP API - Mandatory & First */}
                <div className="sm:col-span-3 space-y-1.5 bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-blue-900 block">CEP * (Obrigatório - Busca Automática)</label>
                    {loadingCep && (
                      <span className="text-xs text-blue-600 font-extrabold flex items-center gap-1 animate-pulse">
                        Buscando endereço...
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                    <input
                      type="text"
                      required
                      value={cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      placeholder="Ex: 13200-000"
                      maxLength={9}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-blue-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 tracking-wide shadow-xs"
                    />
                  </div>
                  {cepError ? (
                    <p className="text-[11px] text-rose-600 font-bold">{cepError}</p>
                  ) : (
                    <p className="text-[10px] text-blue-800 font-medium">Digite seu CEP de 8 dígitos primeiro para preencher automaticamente a Rua e o Bairro.</p>
                  )}
                </div>

                {/* Street */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Rua / Logradouro *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Ex: Rua do Retiro"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Number */}
                <div className="sm:col-span-1 space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Número *</label>
                  <input
                    type="text"
                    required
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Ex: 450"
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Neighborhood */}
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Bairro *</label>
                  <input
                    type="text"
                    required
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Ex: Vila Retiro"
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

              </div>
            </div>

            {/* Section 3: Date and Time slots based on custom weekday rules */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <h3 className="text-sm uppercase font-black text-blue-600 tracking-wider">3. Escolha de Datas e Horários</h3>
              
              {/* Informative notice of working hours */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2.5">
                <Info className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Regras de Horários Disponíveis:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Segunda a Sexta: apenas o horário das <span className="font-bold">18:00</span></li>
                    <li>Sábados: dois horários disponíveis, às <span className="font-bold">09:00</span> e às <span className="font-bold">14:00</span></li>
                    <li>Domingos: fechado</li>
                  </ul>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                
                {/* Date Picker */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Data da Higienização *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Time Picker Slot */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Horário Disponível *</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                      required
                      disabled={!date || weekday === 0}
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">Selecione um horário</option>
                      {availableTimes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  {date && weekday === 0 && (
                    <span className="text-[10px] text-red-500 font-medium">Infelizmente não abrimos aos domingos.</span>
                  )}
                  {date && weekday !== 0 && availableTimes.length === 0 && (
                    <span className="text-[10px] text-red-500 font-bold block">⚠️ Todos os horários para este dia já estão reservados. Escolha outra data.</span>
                  )}
                </div>

              </div>
            </div>

            {/* Custom Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Alguma observação? (Opcional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Possui manchas de caneta, manchas de graxa, odor de urina de animal de estimação..."
                rows={3}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              <PlusCircle className="h-5 w-5" />
              Solicitar Agendamento
            </button>

          </form>
        )}

      </div>
    </section>
  );
}
