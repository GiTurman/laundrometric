
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings, 
  Calendar, 
  TrendingUp, 
  Users, 
  CreditCard, 
  ShieldAlert, 
  RefreshCw,
  Percent,
  DollarSign,
  Clock,
  ArrowUpRight,
  Target,
  BarChart4,
  ChevronDown,
  LayoutGrid,
  Zap,
  Globe,
  Info,
  ChevronUp
} from 'lucide-react';
import { ScenarioType } from '../types';

interface ModelSettingsProps {
  scenario: ScenarioType;
  onScenarioChange?: (s: ScenarioType) => void;
  onDataUpdate?: (data: string) => void;
}

export const ModelSettingsView: React.FC<ModelSettingsProps> = ({ scenario, onScenarioChange, onDataUpdate }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Utility: Format Number 10 000,00
  const formatValue = (val: number) => {
    return new Intl.NumberFormat('ka-GE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Utility: Format Exchange Rate (4 decimals)
  const formatRate = (val: number) => {
    return val.toFixed(4);
  };

  // Scenario Logic Descriptions
  const SCENARIO_DESCRIPTIONS = {
    [ScenarioType.CONSERVATIVE]: {
      title: "Conservative Reality (კონსერვატიული)",
      description: "ამ სცენარში მოდელი ორიენტირებულია 'ყველაზე ცუდ' ვარიანტზე: ფასები არის მინიმალური (2.20 GEL), ზრდის ტემპი დაბალია, ხოლო გაუთვალისწინებელი ხარჯების ბუფერი მაღალი (15%). მიზანია ბიზნესის მდგრადობის შემოწმება რთულ პირობებში."
    },
    [ScenarioType.BASE_CASE]: {
      title: "Base Case Reality (საბაზისო)",
      description: "ბაზრის რეალურ მოლოდინებზე დაფუძნებული მოდელი. საშუალო საბაზრო ფასი (2.50 GEL), ზომიერი ზრდა და სტაბილური საოპერაციო ხარჯები. ეს არის ყველაზე სავარაუდო სცენარი ბიზნესის დაგეგმვისთვის."
    },
    [ScenarioType.AGGRESSIVE]: {
      title: "Aggressive Reality (აგრესიული)",
      description: "სწრაფ ექსპანსიაზე გათვლილი მოდელი: მაღალი ზრდის ტემპი (10%+), გაზრდილი მარკეტინგული ბიუჯეტი და პრემიუმ ფასი (2.85 GEL). რისკის ბუფერები მინიმუმამდეა დაყვანილი მაქსიმალური მოგების საჩვენებლად."
    },
    [ScenarioType.CUSTOM]: {
      title: "Custom Reality (ინდივიდუალური)",
      description: "მომხმარებლის მიერ სრულად მართვადი სცენარი. აქტიურდება 'Custom Overrides' სვეტი, სადაც შეგიძლიათ ნებისმიერი ციფრი ხელით ჩაწეროთ და მოდელი მყისიერად გადაითვლება თქვენი უნიკალური ლოგიკით."
    }
  };

  // Scenario Probabilities State
  const [probabilities, setProbabilities] = useState(() => {
    const saved = localStorage.getItem('laundrometric_probabilities');
    return saved ? JSON.parse(saved) : {
      [ScenarioType.CONSERVATIVE]: 20,
      [ScenarioType.BASE_CASE]: 50,
      [ScenarioType.AGGRESSIVE]: 20,
      [ScenarioType.CUSTOM]: 10
    };
  });

  // Central State for Model Settings
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(`laundrometric_settings_${scenario}`);
    if (saved) return JSON.parse(saved);
    
    // Explicit Defaults per Scenario
    const defaults = {
      modelStartDate: '2024-01-01',
      opsStartDate: '2024-04-01',
      usdGEL: 2.7000,
      vatRate: 18.00,
      incomeTax: 20.00,
      profitTax: 15.00,
      daysReceivable: 30,
      daysPayable: 15,
      minCashReserve: 50000.00,
      rentSqm: 15.00,
      avgSalary: 1200.00,
      conversionRate: 15.00,
      
      // Variable Parameters based on Scenario
      inflationRate: scenario === ScenarioType.CONSERVATIVE ? 5.00 : (scenario === ScenarioType.AGGRESSIVE ? 2.50 : 3.50),
      basePrice: scenario === ScenarioType.CONSERVATIVE ? 2.20 : (scenario === ScenarioType.AGGRESSIVE ? 2.85 : 2.50),
      monthlyGrowth: scenario === ScenarioType.CONSERVATIVE ? 2.00 : (scenario === ScenarioType.AGGRESSIVE ? 10.00 : 5.00),
      churnRate: scenario === ScenarioType.CONSERVATIVE ? 5.00 : (scenario === ScenarioType.AGGRESSIVE ? 1.00 : 2.50),
      marketingBudget: scenario === ScenarioType.CONSERVATIVE ? 500.00 : (scenario === ScenarioType.AGGRESSIVE ? 5000.00 : 1500.00),
      contingencyBuffer: scenario === ScenarioType.CONSERVATIVE ? 15.00 : (scenario === ScenarioType.AGGRESSIVE ? 5.00 : 10.00),
    };
    return defaults;
  });

  useEffect(() => {
    localStorage.setItem(`laundrometric_settings_${scenario}`, JSON.stringify(settings));
    localStorage.setItem('laundrometric_probabilities', JSON.stringify(probabilities));
    if (onDataUpdate) {
      onDataUpdate(`მოდელის პარამეტრები: ფასი ${formatValue(settings.basePrice)} GEL, ზრდა ${formatValue(settings.monthlyGrowth)}%, ინფლაცია ${formatValue(settings.inflationRate)}%`);
    }
  }, [settings, probabilities, scenario, onDataUpdate]);

  const handleChange = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleProbChange = (s: ScenarioType, val: number) => {
    setProbabilities((prev: any) => ({ ...prev, [s]: val }));
  };

  const fetchNBGRate = () => {
    setIsSyncing(true);
    // Simulation of NBG API Fetch
    setTimeout(() => {
      const mockLiveRate = 2.6842; 
      handleChange('usdGEL', mockLiveRate);
      setIsSyncing(false);
    }, 1200);
  };

  const InputWrapper = ({ label, icon: Icon, children, description, isCustomOnly = false }: any) => {
    const isLocked = isCustomOnly && scenario !== ScenarioType.CUSTOM;
    return (
      <div className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm transition-all ${isLocked ? 'opacity-60 grayscale-[0.5]' : 'hover:shadow-md hover:border-indigo-100'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-slate-50 text-slate-500 rounded-xl border border-slate-100">
            <Icon size={18} />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.15em]">{label}</h4>
            {description && <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-tight">{description}</p>}
          </div>
        </div>
        <div className={isLocked ? 'pointer-events-none' : ''}>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-10 animate-in fade-in duration-500 pb-40 px-2">
      
      {/* 1. SCENARIO MANAGER BLOCK */}
      <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row gap-10">
          {/* Scenario Selector */}
          <div className="lg:w-1/3 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="text-amber-400" size={24} />
                <h3 className="text-xl font-bold uppercase tracking-widest">Scenario Manager</h3>
              </div>
              <button 
                onClick={() => setIsInfoOpen(!isInfoOpen)}
                className={`p-2 rounded-xl transition-all ${isInfoOpen ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                title="სცენარის ინსტრუქცია"
              >
                {isInfoOpen ? <ChevronUp size={18} /> : <Info size={18} />}
              </button>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              აირჩიეთ მოდელის სცენარი. თითოეული სცენარი ცვლის შემოსავლების ზრდის, ფასწარმოქმნისა და რისკების პარამეტრებს.
            </p>

            {/* Instruction Accordion */}
            {isInfoOpen && (
              <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-2xl p-5 animate-in slide-in-from-top-4 duration-300">
                <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Info size={12} /> {SCENARIO_DESCRIPTIONS[scenario].title}
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed italic">
                  "{SCENARIO_DESCRIPTIONS[scenario].description}"
                </p>
              </div>
            )}
            
            <div className="relative group">
              <select 
                value={scenario}
                onChange={(e) => onScenarioChange?.(e.target.value as ScenarioType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold appearance-none focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer transition-all hover:bg-slate-750"
              >
                {Object.values(ScenarioType).map(s => (
                  <option key={s} value={s}>{s} Reality</option>
                ))}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
            </div>
          </div>

          {/* Probabilities Section */}
          <div className="lg:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(ScenarioType).map(s => (
              <div key={s} className={`p-5 rounded-2xl border transition-all duration-300 ${scenario === s ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.3)] scale-105' : 'bg-slate-800/50 border-slate-700 opacity-60'}`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 opacity-70">{s}</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={probabilities[s]}
                    onChange={(e) => handleProbChange(s, parseInt(e.target.value) || 0)}
                    className="bg-transparent text-2xl font-mono font-bold w-full outline-none"
                  />
                  <span className="text-xs font-bold opacity-50">%</span>
                </div>
                <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-700 ease-out ${scenario === s ? 'bg-white' : 'bg-indigo-400'}`} style={{ width: `${probabilities[s]}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. TIMELINE & MACRO */}
        <div className="lg:col-span-1 space-y-6">
          <InputWrapper label="დროითი და მაკრო პარამეტრები" icon={Calendar} description="Timeline & Macro Context">
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1.5 tracking-tighter">პროგნოზის დაწყება</label>
                  <input 
                    type="date" 
                    value={settings.modelStartDate}
                    onChange={(e) => handleChange('modelStartDate', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1.5 tracking-tighter">ოპერირების დაწყება</label>
                  <input 
                    type="date" 
                    value={settings.opsStartDate}
                    onChange={(e) => handleChange('opsStartDate', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 pt-2">
                <div className="relative bg-slate-50 border border-slate-200 rounded-2xl p-4 group">
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1.5 tracking-tighter">ინფლაციის კოეფიციენტი</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      step="0.01"
                      value={settings.inflationRate}
                      onChange={(e) => handleChange('inflationRate', parseFloat(e.target.value))}
                      className="bg-transparent text-xl font-mono font-bold text-slate-800 focus:outline-none w-full"
                    />
                    <Percent size={16} className="text-slate-300" />
                  </div>
                  <div className="absolute right-4 bottom-4 text-[9px] font-bold text-slate-300 uppercase italic">Annual Rate</div>
                </div>

                <div className="relative bg-indigo-50/30 border border-indigo-100 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter flex items-center gap-1">
                      <Globe size={10} /> USD / GEL კურსი (NBG)
                    </label>
                    <button 
                      onClick={fetchNBGRate}
                      disabled={isSyncing}
                      className="p-1 hover:bg-white rounded transition-colors text-indigo-600 disabled:opacity-50"
                      title="Sync with National Bank"
                    >
                      <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      step="0.0001"
                      value={settings.usdGEL}
                      onChange={(e) => handleChange('usdGEL', parseFloat(e.target.value))}
                      className="bg-transparent text-xl font-mono font-bold text-indigo-700 focus:outline-none w-full"
                    />
                    <span className="text-[10px] font-black text-indigo-300">GEL</span>
                  </div>
                  <p className="text-[8px] text-indigo-400/60 mt-2 uppercase font-bold tracking-tight italic">
                    {isSyncing ? 'Syncing with NBG Live API...' : 'NBG-ს მიმდინარე კურსი'}
                  </p>
                </div>
              </div>
            </div>
          </InputWrapper>

          <InputWrapper label="უსაფრთხოება და რისკი" icon={ShieldAlert} description="Risk Buffers">
            <div className="space-y-4">
              <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4">
                <label className="text-[9px] font-black text-amber-500 uppercase block mb-1 tracking-tighter">გაუთვალისწინებელი ხარჯის ბუფერი</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={settings.contingencyBuffer}
                    onChange={(e) => handleChange('contingencyBuffer', parseFloat(e.target.value))}
                    className="bg-transparent text-xl font-mono font-bold text-amber-700 focus:outline-none w-full"
                  />
                  <Percent size={16} className="text-amber-300" />
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1 tracking-tighter">მინიმალური ქეშ-რეზერვი</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={settings.minCashReserve}
                    onChange={(e) => handleChange('minCashReserve', parseInt(e.target.value))}
                    className="bg-transparent text-xl font-mono font-bold text-white focus:outline-none w-full"
                  />
                  <span className="text-[10px] font-black text-slate-500 uppercase">GEL</span>
                </div>
                <div className="mt-2 text-[10px] font-mono text-emerald-400 font-bold">
                  {formatValue(settings.minCashReserve)}
                </div>
              </div>
            </div>
          </InputWrapper>
        </div>

        {/* 3. REVENUE DRIVERS */}
        <div className="lg:col-span-1 space-y-6">
          <InputWrapper label="შემოსავლების მამოძრავებლები" icon={TrendingUp} description="Revenue Drivers">
            <div className="space-y-4">
              <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200">
                <label className="text-[9px] font-black text-indigo-200 uppercase block mb-1 tracking-tighter">საბაზისო ფასი (GEL/კგ)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    step="0.1"
                    value={settings.basePrice}
                    onChange={(e) => handleChange('basePrice', parseFloat(e.target.value))}
                    className="bg-transparent text-3xl font-black text-white focus:outline-none w-full"
                  />
                  <DollarSign size={24} className="text-indigo-400 opacity-50" />
                </div>
                <div className="mt-2 text-xs font-mono font-bold text-indigo-100">
                  {formatValue(settings.basePrice)} GEL
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                <label className="text-[9px] font-black text-emerald-500 uppercase block mb-1 tracking-tighter">ყოველთვიური ზრდის ტემპი</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={settings.monthlyGrowth}
                    onChange={(e) => handleChange('monthlyGrowth', parseFloat(e.target.value))}
                    className="bg-transparent text-2xl font-mono font-bold text-emerald-700 focus:outline-none w-full"
                  />
                  <ArrowUpRight size={20} className="text-emerald-300" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Churn Rate</label>
                  <div className="flex items-center gap-1">
                    <input type="number" value={settings.churnRate} onChange={(e) => handleChange('churnRate', parseFloat(e.target.value))} className="bg-transparent text-sm font-mono font-bold w-full" />
                    <Percent size={12} className="text-slate-300" />
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Conversion</label>
                  <div className="flex items-center gap-1">
                    <input type="number" value={settings.conversionRate} onChange={(e) => handleChange('conversionRate', parseFloat(e.target.value))} className="bg-transparent text-sm font-mono font-bold w-full" />
                    <Percent size={12} className="text-slate-300" />
                  </div>
                </div>
              </div>
            </div>
          </InputWrapper>

          <InputWrapper label="სამუშაო კაპიტალი და გადასახადები" icon={CreditCard} description="Working Capital & Taxes">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                  <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">დღგ</label>
                  <input type="number" value={settings.vatRate} onChange={(e) => handleChange('vatRate', parseFloat(e.target.value))} className="w-full bg-transparent text-center text-xs font-bold font-mono" />
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                  <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">საშემოს.</label>
                  <input type="number" value={settings.incomeTax} onChange={(e) => handleChange('incomeTax', parseFloat(e.target.value))} className="w-full bg-transparent text-center text-xs font-bold font-mono" />
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                  <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">მოგების</label>
                  <input type="number" value={settings.profitTax} onChange={(e) => handleChange('profitTax', parseFloat(e.target.value))} className="w-full bg-transparent text-center text-xs font-bold font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Days Receivable</label>
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-slate-300" />
                    <input type="number" value={settings.daysReceivable} onChange={(e) => handleChange('daysReceivable', parseInt(e.target.value))} className="bg-transparent text-sm font-mono font-bold w-full" />
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Days Payable</label>
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-slate-300" />
                    <input type="number" value={settings.daysPayable} onChange={(e) => handleChange('daysPayable', parseInt(e.target.value))} className="bg-transparent text-sm font-mono font-bold w-full" />
                  </div>
                </div>
              </div>
            </div>
          </InputWrapper>
        </div>

        {/* 4. CUSTOM OVERRIDE / SUMMARY COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          <InputWrapper label="Custom Scenario Overrides" icon={LayoutGrid} description="Manual Inputs Column" isCustomOnly={true}>
            <p className="text-[10px] text-slate-400 mb-6 leading-relaxed font-medium">
              ეს სვეტი აქტიურდება მხოლოდ <strong className="text-indigo-600">Custom</strong> სცენარის დროს. გამოიყენეთ იგი თქვენი უნიკალური ციფრების სატესტოდ.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Manual Price</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={settings.basePrice} 
                  onChange={(e) => handleChange('basePrice', parseFloat(e.target.value))}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-mono font-bold w-28 text-right shadow-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Growth Offset</span>
                <input 
                  type="number" 
                  value={settings.monthlyGrowth} 
                  onChange={(e) => handleChange('monthlyGrowth', parseFloat(e.target.value))}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-mono font-bold w-28 text-right shadow-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </InputWrapper>

          <InputWrapper label="საოპერაციო ხარჯები (OpEx)" icon={Users} description="OpEx Drivers">
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <label className="text-[9px] font-black text-slate-400 uppercase block mb-1 tracking-tighter">საშუალო ხელფასი (Net GEL)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={settings.avgSalary}
                    onChange={(e) => handleChange('avgSalary', parseInt(e.target.value))}
                    className="bg-transparent text-xl font-mono font-bold text-slate-800 focus:outline-none w-full"
                  />
                  <Users size={16} className="text-slate-300" />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-mono font-bold">
                  {formatValue(settings.avgSalary)}
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <label className="text-[9px] font-black text-slate-400 uppercase block mb-1 tracking-tighter">მარკეტინგის ბიუჯეტი</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={settings.marketingBudget}
                    onChange={(e) => handleChange('marketingBudget', parseInt(e.target.value))}
                    className="bg-transparent text-xl font-mono font-bold text-slate-800 focus:outline-none w-full"
                  />
                  <Target size={16} className="text-slate-300" />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-mono font-bold">
                  {formatValue(settings.marketingBudget)}
                </p>
              </div>
            </div>
          </InputWrapper>

          <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-indigo-400">Current Scenario Context</h4>
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Avg. Gross Price</span>
                <span className="text-xl font-mono font-bold text-white">{formatValue(settings.basePrice)} <span className="text-[10px] text-slate-500">GEL</span></span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Exchange Rate</span>
                <span className="text-xl font-mono font-bold text-indigo-400">{formatRate(settings.usdGEL)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Probable Success</span>
                <span className="text-xl font-mono font-bold text-emerald-400">{probabilities[scenario]}%</span>
              </div>
            </div>
            <p className="text-[9px] mt-10 leading-relaxed text-slate-500 italic font-medium">
              *All inputs are synchronized across the Single Source of Truth (SSoT) financial engine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
