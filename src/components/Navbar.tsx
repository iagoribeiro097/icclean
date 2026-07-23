import React from 'react';
import { Sparkles, ClipboardList, ShieldCheck, Phone, CalendarCheck } from 'lucide-react';
import { OWNER_PHONE_RAW } from '../data/services';

interface NavbarProps {
  currentTab: 'client' | 'owner';
  onChangeTab: (tab: 'client' | 'owner') => void;
  onNavigateToSection: (sectionId: string) => void;
}

export default function Navbar({ currentTab, onChangeTab, onNavigateToSection }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900/95 backdrop-blur-md border-b border-blue-900/50 text-white shadow-lg shadow-blue-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigateToSection('hero')}>
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-md shadow-blue-500/30">
              <Sparkles className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                IC CLEAN
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-blue-400 font-semibold">
                Higienização Premium
              </span>
            </div>
          </div>

          {/* Navigation Links for Sections */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button 
              onClick={() => onNavigateToSection('servicos')} 
              className="hover:text-blue-400 transition-colors py-2 px-1 relative group"
            >
              Serviços
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
            </button>
            <button 
              onClick={() => onNavigateToSection('antes-depois')} 
              className="hover:text-blue-400 transition-colors py-2 px-1 relative group"
            >
              Antes e Depois
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
            </button>

            <button 
              onClick={() => onNavigateToSection('agendar')} 
              className="hover:text-blue-400 transition-colors py-2 px-1 relative group"
            >
              Agendar
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
            </button>
            <button 
              onClick={() => onNavigateToSection('meu-agendamento')} 
              className="hover:text-blue-400 transition-colors py-2 px-1 relative group"
            >
              Ver Status
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
            </button>
          </nav>

          {/* Action Area / View Toggle */}
          <div className="flex items-center gap-3">
            {/* Owner Tab Toggle */}
            <button
              onClick={() => onChangeTab(currentTab === 'client' ? 'owner' : 'client')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                currentTab === 'owner'
                  ? 'bg-blue-600 text-white shadow-blue-500/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {currentTab === 'owner' ? (
                <>
                  <CalendarCheck className="h-4 w-4" />
                  Área do Cliente
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Área do Dono
                </>
              )}
            </button>

            {/* Direct WhatsApp Call */}
            <a
              href={`https://wa.me/${OWNER_PHONE_RAW}?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20a%20higienização%20premium.`}
              target="_blank"
              referrerPolicy="no-referrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-950/20 hover:scale-[1.02]"
            >
              <Phone className="h-4 w-4 fill-white text-emerald-600" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
}
