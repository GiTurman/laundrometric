
import React from 'react';
import { ClipboardList, Target, Building2, Activity, ShieldCheck, ChevronRight, MousePointer2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

export const WebInstructionView: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang];

  const STEPS = [
    {
      id: '1',
      title: t.step1Title,
      desc: t.step1Desc,
      icon: <Target className="text-indigo-600" size={24} />,
      color: 'border-indigo-500',
      link: 'market-analysis'
    },
    {
      id: '2',
      title: t.step2Title,
      desc: t.step2Desc,
      icon: <Building2 className="text-emerald-600" size={24} />,
      color: 'border-emerald-500',
      link: 'client-database'
    },
    {
      id: '3',
      title: t.step3Title,
      desc: t.step3Desc,
      icon: <Activity className="text-amber-600" size={24} />,
      color: 'border-amber-500',
      link: 'market-analysis'
    },
    {
      id: '4',
      title: t.step4Title,
      desc: t.step4Desc,
      icon: <ShieldCheck className="text-rose-600" size={24} />,
      color: 'border-rose-500',
      link: 'swot-strategy'
    }
  ];

  return (
    <div className="w-full flex flex-col gap-10 pb-40 px-2 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-900 flex items-center gap-6 tracking-tighter">
            <ClipboardList className="text-emerald-600" size={48} /> {t.instructionTitle}
          </h2>
          <p className="text-sm text-slate-500 mt-2 uppercase tracking-[0.2em] font-black">{t.instructionSubtitle}</p>
        </div>
      </div>

      <div className="relative space-y-12">
        {/* Connection Line */}
        <div className="absolute left-10 top-0 bottom-0 w-1 bg-slate-100 rounded-full hidden md:block"></div>

        {STEPS.map((step, idx) => (
          <div key={step.id} className="relative flex flex-col md:flex-row gap-12 group">
            {/* Step Number Bubble */}
            <div className="absolute left-10 -translate-x-1/2 w-10 h-10 rounded-full bg-slate-900 border-4 border-white shadow-xl z-10 flex items-center justify-center text-white font-black text-sm hidden md:flex group-hover:scale-125 transition-transform">
              {step.id}
            </div>

            <div className="ml-0 md:ml-24 flex-1">
              <div className={`bg-white border-l-8 ${step.color} border-t border-r border-b border-slate-200 rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-50 rounded-2xl shadow-inner border border-slate-100">
                        {step.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{step.title}</h3>
                      </div>
                    </div>
                    <p className="text-base text-slate-600 leading-relaxed font-medium">
                      {step.desc}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-3 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shrink-0 min-w-[200px] hover:bg-slate-100 transition-colors cursor-pointer group/btn">
                    <MousePointer2 className="text-slate-400 group-hover/btn:text-indigo-600 transition-colors" size={24} />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover/btn:text-indigo-600 transition-colors">{t.actionRequired}</span>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 group-hover/btn:translate-x-1 transition-transform uppercase tracking-tight">
                       {t.navigate} <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-emerald-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="p-6 bg-white/10 rounded-[2rem] border border-white/20">
          <ShieldCheck size={40} className="text-emerald-200" />
        </div>
        <div>
          <h4 className="text-xl font-black mb-2 uppercase tracking-tighter italic">"Precision ensures model accuracy across all modules."</h4>
          <p className="text-sm text-emerald-100 leading-relaxed font-medium opacity-80">
            Each module is interconnected. A change on one page is instantly reflected throughout the entire financial model.
          </p>
        </div>
      </div>
    </div>
  );
};
