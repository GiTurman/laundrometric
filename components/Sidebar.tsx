
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  Layers, 
  Map as MapIcon, 
  Zap, 
  TrendingUp, 
  Users,
  Building2,
  HardHat, 
  Calculator, 
  FileText, 
  Activity, 
  Target, 
  Calendar,
  ChevronDown,
  ChevronRight,
  BookOpen,
  ClipboardList,
  MessageSquarePlus
} from 'lucide-react';
import { ViewID, NavItem, Language } from '../types';
import { translations } from '../translations';

interface SidebarProps {
  activeView: ViewID;
  onViewChange: (view: ViewID) => void;
  lang: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, lang }) => {
  const [isFinOpen, setIsFinOpen] = useState(false);
  const t = translations[lang];

  const navItems: NavItem[] = [
    { id: ViewID.DASHBOARD, label: t.dashboard, icon: <LayoutDashboard size={18} /> },
    { id: ViewID.MODEL_SETTINGS, label: t.modelSettings, icon: <Settings size={18} /> },
    { id: ViewID.CAPACITY_PLANNER, label: t.capacityPlanner, icon: <Layers size={18} /> },
    { id: ViewID.MARKET_ANALYSIS, label: t.marketAnalysis, icon: <MapIcon size={18} /> },
    { id: ViewID.SALES_GROWTH, label: t.salesGrowth, icon: <Zap size={18} /> },
    { id: ViewID.INVESTMENTS, label: t.investments, icon: <TrendingUp size={18} /> },
    { id: ViewID.FOUNDERS, label: t.founders, icon: <Users size={18} /> },
    { id: ViewID.CLIENT_DATABASE, label: t.customerBase, icon: <Building2 size={18} /> },
    { id: ViewID.CAPEX, label: t.capex, icon: <HardHat size={18} /> },
    { id: ViewID.OPEX, label: t.opex, icon: <Calculator size={18} /> },
    { id: ViewID.MAKE_WITH_PROMPT, label: t.makeWithPrompt, icon: <MessageSquarePlus size={18} className="text-emerald-400" /> },
  ];

  const secondaryNavItems: NavItem[] = [
    { id: ViewID.FINANCIAL_RATIOS, label: t.finRatios, icon: <Activity size={18} /> },
    { id: ViewID.SWOT_STRATEGY, label: t.swotStrategy, icon: <Target size={18} /> },
    { id: ViewID.ACTION_PLAN, label: t.actionPlan, icon: <Calendar size={18} /> },
  ];

  const finStatements = [
    { id: ViewID.PL_STATEMENT, label: t.plStatement },
    { id: ViewID.BALANCE_SHEET, label: t.balanceSheet },
    { id: ViewID.CASH_FLOW, label: t.cashFlow },
  ];

  return (
    <aside className="w-[260px] h-full bg-slate-900 flex flex-col border-r border-slate-800 text-slate-300">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800 shrink-0">
        <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">L</div>
        <span className="text-white font-semibold tracking-tight text-lg">LaundroMetric</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        <div className="pb-2">
          <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t.coreEngine}</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium ${
                activeView === item.id 
                ? 'bg-slate-800 text-white shadow-inner' 
                : 'hover:bg-slate-800/50 hover:text-slate-100'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* Financial Statements Dropdown */}
        <div className="pt-2">
          <button
            onClick={() => setIsFinOpen(!isFinOpen)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium ${
              finStatements.some(s => s.id === activeView) 
              ? 'text-white' 
              : 'hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText size={18} />
              {t.finStatements}
            </div>
            {isFinOpen ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
          </button>
          
          {isFinOpen && (
            <div className="mt-1 ml-9 flex flex-col space-y-1 border-l border-slate-800 pl-1">
              {finStatements.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onViewChange(s.id)}
                  className={`text-left py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${
                    activeView === s.id 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/30'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2">
          <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t.strategyAnalysis}</p>
          {secondaryNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium ${
                activeView === item.id 
                ? 'bg-slate-800 text-white shadow-inner' 
                : 'hover:bg-slate-800/50 hover:text-slate-100'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* Documentation Section */}
        <div className="pt-4 border-t border-slate-800 mt-4 space-y-1">
          <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t.helpGuides}</p>
          <button
            onClick={() => onViewChange(ViewID.GLOSSARY)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium ${
              activeView === ViewID.GLOSSARY 
              ? 'bg-slate-800 text-white shadow-inner' 
              : 'hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <BookOpen size={18} className="text-indigo-400" />
            {t.glossary}
          </button>
          <button
            onClick={() => onViewChange(ViewID.WEB_INSTRUCTION)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium ${
              activeView === ViewID.WEB_INSTRUCTION 
              ? 'bg-slate-800 text-white shadow-inner' 
              : 'hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <ClipboardList size={18} className="text-emerald-400" />
            {t.webInstruction}
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800 shrink-0">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">{t.status}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs text-slate-300 font-medium">{t.systemBalanced}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
