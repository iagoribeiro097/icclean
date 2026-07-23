import React, { useState } from 'react';
import { Booking } from '../types';
import { Search, Calendar, MapPin, CheckCircle, Clock, AlertTriangle, XCircle, PhoneCall, FileText, ArrowLeft, Ticket, Smartphone } from 'lucide-react';
import { OWNER_PHONE_RAW } from '../data/services';

interface ClientDashboardProps {
  bookings: Booking[];
}

export default function ClientDashboard({ bookings }: ClientDashboardProps) {
  const [searchInput, setSearchInput] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim();
    
    if (!clean) {
      setErrorMsg('Por favor, digite seu código de acesso.');
      setSubmittedQuery('');
      return;
    }

    setErrorMsg('');
    setSubmittedQuery(clean);
  };

  const searched = !!submittedQuery;
  const qClean = submittedQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
  const qPhoneDigits = submittedQuery.replace(/\D/g, '');

  // Filter bookings strictly matching the unique code (b.id)
  const results = searched
    ? bookings.filter(b => {
        const bIdClean = b.id.toLowerCase().replace(/[^a-z0-9]/g, '');
        return bIdClean === qClean || bIdClean.includes(qClean) || qClean.includes(bIdClean);
      })
    : [];

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 shadow-sm">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
            Agendamento Aceito
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold border border-rose-200 shadow-sm">
            <XCircle className="h-3.5 w-3.5 text-rose-600" />
            Recusado / Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-200 shadow-sm">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            Aguardando Confirmação
          </span>
        );
    }
  };

  return (
    <section id="meu-agendamento" className="py-20 bg-slate-50 text-slate-950 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-12 space-y-3 relative">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-600 rounded-full text-xs font-bold transition-all shadow-sm mb-2 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar ao Início</span>
          </button>
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-blue-600">
            Acompanhe o Status
          </h2>
          <p className="text-3xl font-extrabold tracking-tight text-slate-900">
            Minhas Higienizações
          </p>
          <p className="text-slate-600 text-sm max-w-lg mx-auto">
            Digite seu <strong>Código de Acesso</strong> para consultar o status da higienização em tempo real.
          </p>
        </div>

        {/* Search Bar Container */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
                <input
                  type="text"
                  required
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Digite seu código de acesso"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono tracking-wide uppercase"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-2xl transition-all shadow-md cursor-pointer shrink-0 flex items-center justify-center gap-2"
              >
                <Search className="h-4 w-4" />
                <span>Consultar Código</span>
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-rose-600 text-center sm:text-left pl-1">
                {errorMsg}
              </p>
            )}
          </form>

          {/* Search Results */}
          {searched && (
            <div className="pt-6 border-t border-slate-100 space-y-6">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  Resultados para "<span className="font-mono font-extrabold text-slate-900">{submittedQuery}</span>" ({results.length}):
                </p>
                <button
                  onClick={() => {
                    setSubmittedQuery('');
                    setSearchInput('');
                    setErrorMsg('');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Nova Consulta</span>
                </button>
              </div>

              {results.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-4">
                    {results.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-5 sm:p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 hover:border-blue-300 transition-all"
                      >
                        {/* Header of Item */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <h4 className="text-base font-bold text-slate-900">{booking.serviceName}</h4>
                            <p className="text-xs text-slate-500 font-medium">Cliente: <strong className="text-slate-800">{booking.clientName}</strong> | Protocolo: <span className="font-mono">{booking.id}</span></p>
                          </div>
                          <div className="self-start sm:self-center">
                            {getStatusBadge(booking.status)}
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4.5 w-4.5 text-blue-500 shrink-0" />
                            <span>
                              <strong className="text-slate-900">Data e Hora:</strong> {booking.date.split('-').reverse().join('/')} às {booking.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4.5 w-4.5 text-blue-500 shrink-0" />
                            <span className="line-clamp-1">
                              <strong className="text-slate-900">Local:</strong> {booking.address}
                            </span>
                          </div>
                        </div>

                        {/* Additional details */}
                        {booking.notes && (
                          <div className="p-3 bg-white border border-slate-100 rounded-xl text-xs text-slate-600 flex gap-2">
                            <FileText className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                            <p>
                              <strong className="text-slate-900">Sua observação:</strong> {booking.notes}
                            </p>
                          </div>
                        )}

                        {/* Action - direct talk to technician */}
                        <div className="pt-3 border-t border-slate-150 flex flex-col sm:flex-row justify-between items-center gap-4">
                          <p className="text-[11px] text-slate-500">
                            Solicitado em: {new Date(booking.createdAt).toLocaleString('pt-BR')}
                          </p>
                          <a
                            href={`https://wa.me/${OWNER_PHONE_RAW}?text=Olá!%20Gostaria%20de%20verificar%20meu%20agendamento%20sob%20protocolo%20${booking.id}.`}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-600"
                          >
                            <PhoneCall className="h-4 w-4" />
                            Falar com o Profissional
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <p className="font-bold text-slate-700 text-lg">Nenhum agendamento encontrado</p>
                  <p className="text-sm max-w-sm mx-auto">
                    Não encontramos solicitações cadastradas para o código/telefone "<span className="font-mono font-bold text-slate-950">{submittedQuery}</span>". Verifique se o código foi digitado corretamente.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
