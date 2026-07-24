import React from 'react';
import { Phone, MapPin, Mail, Sparkles, Clock } from 'lucide-react';
import { OWNER_PHONE_RAW, OWNER_PHONE_DISPLAY, OWNER_EMAIL } from '../data/services';

interface FooterProps {
  onNavigateToSection: (sectionId: string) => void;
}

export default function Footer({ onNavigateToSection }: FooterProps) {
  return (
    <footer className="bg-slate-950 text-white pt-16 pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          
          {/* Col 1: Brand details (4 columns) */}
          <div className="md:col-span-4 space-y-4 text-left">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                IC CLEAN
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Especialistas em higienização e sanitização profunda de estofados. Levamos saúde, conforto e higienização tecnológica de ponta para o seu lar ou escritório.
            </p>
          </div>

          {/* Col 2: Navigation (3 columns) */}
          <div className="md:col-span-3 space-y-4 text-left">
            <h4 className="text-xs uppercase font-black tracking-widest text-blue-400">Atalhos</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigateToSection('servicos')} className="hover:text-blue-400 transition-colors">
                  Nossos Serviços
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToSection('antes-depois')} className="hover:text-blue-400 transition-colors">
                  Antes e Depois
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToSection('precos')} className="hover:text-blue-400 transition-colors">
                  Tabela de Preços
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToSection('agendar')} className="hover:text-blue-400 transition-colors">
                  Agendar Online
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToSection('meu-agendamento')} className="hover:text-blue-400 transition-colors">
                  Status do Meu Pedido
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours & Rules (3 columns) */}
          <div className="md:col-span-3 space-y-4 text-left">
            <h4 className="text-xs uppercase font-black tracking-widest text-blue-400">Horários de Visita</h4>
            <div className="space-y-3 text-xs sm:text-sm text-slate-400">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-300">Segunda a Sexta</p>
                  <p>Apenas horário das 18:00</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-300">Sábado</p>
                  <p>Dois horários: 09:00 e 14:00</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-rose-400">
                <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Domingos</p>
                  <p>Fechado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Contacts (2 columns) */}
          <div className="md:col-span-2 space-y-4 text-left">
            <h4 className="text-xs uppercase font-black tracking-widest text-blue-400">Fale Conosco</h4>
            <div className="space-y-3.5 text-xs text-slate-400">
              <a
                href={`https://wa.me/${OWNER_PHONE_RAW}`}
                target="_blank"
                referrerPolicy="no-referrer"
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
              >
                <Phone className="h-4 w-4 text-emerald-500" />
                <span>{OWNER_PHONE_DISPLAY}</span>
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-blue-500 shrink-0" />
                <span>Jundiaí - SP</span>
              </div>
              <a href={`mailto:${OWNER_EMAIL}`} className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <Mail className="h-4 w-4 text-blue-500" />
                <span>{OWNER_EMAIL}</span>
              </a>
            </div>
          </div>

        </div>

        {/* Divider and Copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 text-center sm:text-left">
          <p>© {new Date().getFullYear()} IC CLEAN Higienização. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-blue-400 transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Privacidade</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
