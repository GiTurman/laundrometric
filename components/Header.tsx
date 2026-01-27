
import React from 'react';
import { ScenarioType, Language } from '../types';

interface HeaderProps {
  scenario: ScenarioType;
  onScenarioChange: (scenario: ScenarioType) => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
  activeViewLabel: string;
}

export const Header: React.FC<HeaderProps> = ({ scenario, onScenarioChange, lang, onLangChange, activeViewLabel }) => {
  return (
    <header className="h-16 w-full border-b border-slate-200 flex items-center justify-between px-8 bg-white z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-[#1A1A1A] font-bold text-lg tracking-tight">
          LaundroMetric: <span className="text-slate-500 font-medium">Industrial Laundry Model</span>
        </h1>
        <div className="h-4 w-px bg-slate-200 mx-2"></div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{activeViewLabel}</span>
      </div>

      <div className="flex items-center gap-6">
        {/* Language Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg gap-1 border border-slate-200">
          {(Object.values(Language) as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => onLangChange(l)}
              className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter transition-all duration-200 ${
                lang === l
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Scenario Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg gap-1 border border-slate-200">
          {(Object.values(ScenarioType) as ScenarioType[]).map((type) => (
            <button
              key={type}
              onClick={() => onScenarioChange(type)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                scenario === type
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
