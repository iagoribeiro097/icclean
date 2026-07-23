import React, { useState } from 'react';
import { BEFORE_AFTER_IMAGES, TECHNICIAN_PHOTO } from '../data/services';
import { Split, Eye, Layers, Award, ArrowLeft } from 'lucide-react';

export default function BeforeAfter() {
  const [activeCase, setActiveCase] = useState(0);
  const currentCase = BEFORE_AFTER_IMAGES[activeCase];

  return (
    <section id="antes-depois" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background glow overlay */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full text-xs font-bold transition-all border border-slate-700 cursor-pointer mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-blue-400" />
            <span>Voltar ao Início</span>
          </button>
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-blue-400">
            Comprovação de Resultados
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Veja as Transformações de Antes e Depois
          </p>
          <p className="text-slate-400 text-sm sm:text-base">
            Seus estofados podem parecer limpos por fora, mas as fotos mostram o acúmulo de poeira e sujidade orgânica que nossa extratora de alta sucção retira de verdade.
          </p>
        </div>

        {/* Case selector tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {BEFORE_AFTER_IMAGES.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCase(idx)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeCase === idx
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Main interactive visual card */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Split screen display (7 columns) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group border border-slate-800 bg-slate-900 shadow-2xl">
                
                {/* Visual before/after display container */}
                <div className="grid grid-cols-2 h-full">
                  {/* Before Side */}
                  <div className="relative h-full overflow-hidden border-r-2 border-slate-950/60">
                    <img
                      src={currentCase.beforeUrl}
                      alt="Antes"
                      className="absolute inset-0 w-[200%] max-w-none h-full object-cover filter saturate-50 brightness-75 contrast-125"
                      style={{ transform: 'translateX(0)' }}
                      referrerPolicy="no-referrer"
                    />
                    {/* Dark filter & stain overlay to demonstrate "Before" */}
                    {!currentCase.beforeLabel && (
                      <div className="absolute inset-0 bg-amber-950/20 backdrop-brightness-[0.7] backdrop-contrast-125"></div>
                    )}
                    <span className="absolute top-4 left-4 bg-amber-600/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                      {currentCase.beforeLabel || 'Antes da Higienização'}
                    </span>
                  </div>

                  {/* After Side */}
                  <div className="relative h-full overflow-hidden">
                    <img
                      src={currentCase.afterUrl}
                      alt="Depois"
                      className="absolute inset-0 w-[200%] max-w-none h-full object-cover"
                      style={{ transform: 'translateX(-50%)' }}
                      referrerPolicy="no-referrer"
                    />
                    {/* Clean boost filter to demonstrate "After" */}
                    <div className="absolute inset-0 bg-blue-500/5 backdrop-brightness-[1.1]"></div>
                    <span className="absolute top-4 right-4 bg-blue-600/95 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                      {currentCase.afterLabel || 'Depois da Higienização'}
                    </span>
                  </div>
                </div>

                {/* Slider bar overlay instructions */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur text-[10px] text-slate-300 px-3.5 py-1.5 rounded-full border border-slate-800 flex items-center gap-2 pointer-events-none">
                  <Split className="h-3.5 w-3.5 text-blue-400" />
                  <span>Comparação Lado a Lado</span>
                </div>

              </div>
            </div>

            {/* Explanatory text (5 columns) */}
            <div className="lg:col-span-5 text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-semibold">
                <Layers className="h-4 w-4" />
                Caso de Sucesso Real
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">{currentCase.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{currentCase.description}</p>
              </div>

              {/* Technical steps taken */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs uppercase font-black tracking-widest text-blue-400">Tratamento Efetuado:</h4>
                <ul className="space-y-3">
                  {currentCase.title.toLowerCase().includes('impermeabilização') ? (
                    <>
                      <li className="flex items-start gap-3 text-slate-300 text-sm">
                        <span className="bg-blue-900/50 text-blue-400 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                        <span>Aspiração e higienização profunda prévia para livrar totalmente as fibras de ácaros e resíduos.</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-300 text-sm">
                        <span className="bg-blue-900/50 text-blue-400 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                        <span>Aplicação homogênea de resina protetora de alto desempenho com pulverização profissional.</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-300 text-sm">
                        <span className="bg-blue-900/50 text-blue-400 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
                        <span>Cura controlada do produto para ancoragem molecular e criação do escudo hidrofóbico ativo.</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-3 text-slate-300 text-sm">
                        <span className="bg-blue-900/50 text-blue-400 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                        <span>Aspiração completa e remoção preliminar de sujidades sólidas.</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-300 text-sm">
                        <span className="bg-blue-900/50 text-blue-400 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                        <span>Pulverização de flotador biodegradável para quebra de gordura orgânica.</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-300 text-sm">
                        <span className="bg-blue-900/50 text-blue-400 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
                        <span>Escovação mecânica suave e extração úmida sob alta pressão de vácuo.</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Technician Profile Card with Geometric Balance */}
              <div className="pt-6 border-t border-slate-800">
                <div className="bg-gradient-to-r from-blue-950 to-blue-900 border border-blue-800/60 rounded-2xl p-4 text-white flex items-center gap-4 shadow-lg shadow-blue-950/40">
                  <div className="w-14 h-14 bg-slate-800 rounded-xl shrink-0 border-2 border-blue-500/60 overflow-hidden shadow-inner">
                    <img
                      src={TECHNICIAN_PHOTO}
                      alt="Isaac Varela - Higienizador"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Higienizador Responsável</span>
                      <Award className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <div className="font-extrabold text-base tracking-tight text-slate-100">Isaac Varela</div>
                    <div className="text-xs text-slate-300 font-medium">Especialista certificado • 10+ anos de experiência</div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
