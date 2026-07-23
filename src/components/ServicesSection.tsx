import React, { useState, useEffect } from 'react';
import { SERVICES, OWNER_PHONE_RAW } from '../data/services';
import { Service } from '../types';
import { Info, BadgeCheck, Sparkles, MessageCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface ServicesSectionProps {
  onSelectService: (serviceId: string) => void;
}

export default function ServicesSection({ onSelectService }: ServicesSectionProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedService]);

  return (
    <section id="servicos" className="py-20 bg-slate-50 text-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-blue-600">
            Tratamentos Profissionais
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Nossos Serviços de Higienização
          </p>
          <p className="text-slate-600">
            Descubra como removemos a sujeira acumulada, ácaros, maus odores e restauramos o tecido dos seus estofados com produtos seguros e biodegradáveis.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SERVICES.map((service, index) => {
            const isLast = index === SERVICES.length - 1;
            return (
              <div
                key={service.id}
                className={`flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative ${
                  isLast ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
              >
                {/* Highlight banner for the last element (the premium sanitization equipment) */}
                {isLast && (
                  <div className="absolute top-3 left-3 z-10 bg-blue-600 text-white text-[10px] uppercase font-black px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    O Higienizador
                  </div>
                )}

                {/* Service Image */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight min-h-[48px] flex items-center">
                      {service.name}
                    </h3>
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                      {service.description}
                    </p>
                  </div>

                  {/* Benefits Mini-list */}
                  <ul className="space-y-1.5 text-xs text-slate-700 pt-2">
                    {service.benefits.slice(0, 3).map((benefit, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Booking Trigger */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedService(service)}
                        className="flex items-center justify-center gap-1 px-2 py-2 border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        <Info className="h-3.5 w-3.5" />
                        Detalhes
                      </button>
                      <button
                        onClick={() => onSelectService(service.id)}
                        className="flex items-center justify-center gap-1 px-2 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all hover:shadow-md cursor-pointer"
                      >
                        Agendar
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expanded Details Modal */}
        {selectedService && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto touch-none"
            onClick={() => setSelectedService(null)}
          >
            <div 
              className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto my-auto touch-auto"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Modal Image */}
              <div className="relative h-64 bg-slate-100">
                <img
                  src={selectedService.image}
                  alt={selectedService.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {/* Back button top left */}
                <button
                  onClick={() => setSelectedService(null)}
                  className="absolute top-4 left-4 bg-slate-900/80 hover:bg-slate-900 text-white px-3.5 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-lg backdrop-blur-md border border-white/20 cursor-pointer"
                  aria-label="Voltar"
                >
                  <ArrowLeft className="h-4 w-4 text-blue-400" />
                  <span>Voltar</span>
                </button>

                {/* Close button top right */}
                <button
                  onClick={() => setSelectedService(null)}
                  className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white p-2.5 rounded-full transition-all cursor-pointer backdrop-blur-md border border-white/20"
                  aria-label="Fechar"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
                    {selectedService.name}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {selectedService.description}
                  </p>
                </div>

                {/* All benefits detailed */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase font-black tracking-widest text-blue-600">
                    Por que contratar este tratamento?
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {selectedService.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2 text-slate-700">
                        <BadgeCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <button
                    onClick={() => setSelectedService(null)}
                    className="w-full sm:w-auto px-5 py-3 border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4 text-slate-500" />
                    <span>Voltar aos Serviços</span>
                  </button>

                  <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
                    <a
                      href={`https://wa.me/${OWNER_PHONE_RAW}?text=Olá!%20Gostaria%20de%20tirar%20dúvidas%20sobre%20o%20serviço:%20${encodeURIComponent(selectedService.name)}`}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="flex items-center justify-center gap-2 px-5 py-3 border border-emerald-600 hover:bg-emerald-50 text-emerald-700 text-sm font-bold rounded-2xl transition-all"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Dúvidas no WhatsApp
                    </a>
                    <button
                      onClick={() => {
                        onSelectService(selectedService.id);
                        setSelectedService(null);
                      }}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-2xl transition-all shadow-md cursor-pointer"
                    >
                      Fazer Agendamento agora
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
