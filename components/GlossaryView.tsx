
import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Info, ShieldCheck, Zap, TrendingUp, DollarSign, Search, Plus, Trash2, X, Wand2, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { GoogleGenAI } from "@google/genai";

interface GlossaryTerm {
  term: string;
  full: Record<Language, string>;
  def: Record<Language, string>;
  icon: 'Zap' | 'TrendingUp' | 'DollarSign' | 'ShieldCheck' | 'BookOpen';
  color: string;
  isCustom?: boolean;
}

const INTERNAL_KB: Record<string, Partial<GlossaryTerm>> = {
  "ROI": {
    full: { [Language.EN]: "Return on Investment", [Language.GE]: "ინვესტიციის ამონაგები", [Language.DE]: "Kapitalrendite" },
    def: { 
      [Language.EN]: "Ratio between net profit and cost of investment. In laundry, it measures how fast machinery pays for itself.", 
      [Language.GE]: "კოეფიციენტი წმინდა მოგებასა და ინვესტიციის ღირებულებას შორის. ზომავს მანქანა-დანადგარების ამოღების სისწრაფეს.", 
      [Language.DE]: "Verhältnis zwischen Nettogewinn und Investitionskosten. Misst, wie schnell sich Maschinen amortisieren." 
    }
  },
  "CHURN RATE": {
    full: { [Language.EN]: "Churn Rate", [Language.GE]: "კლიენტების გადინების მაჩვენებელი", [Language.DE]: "Abwanderungsquote" },
    def: { 
      [Language.EN]: "The percentage of B2B clients who stop using the service over a specific period.", 
      [Language.GE]: "B2B კლიენტების პროცენტული რაოდენობა, რომლებიც წყვეტენ მომსახურებით სარგებლობას გარკვეული პერიოდის განმავლობაში.", 
      [Language.DE]: "Der Prozentsatz der B2B-Kunden, die den Service über einen bestimmten Zeitraum nicht mehr nutzen." 
    }
  },
  "LINEN FACTOR": {
    full: { [Language.EN]: "Linen weight per room", [Language.GE]: "თეთრეულის წონა ოთახზე", [Language.DE]: "Wäschegewicht pro Zimmer" },
    def: { 
      [Language.EN]: "The total weight (kg) of all linen items in a single hotel room standard.", 
      [Language.GE]: "ერთი სტანდარტული სასტუმრო ოთახის მთლიანი თეთრეულის ჯამური წონა (კილოგრამებში).", 
      [Language.DE]: "Das Gesamtgewicht (kg) aller Wäscheartikel in einem Standard-Hotelzimmer." 
    }
  }
};

const DEFAULT_GLOSSARY: GlossaryTerm[] = [
  {
    term: 'CAPEX',
    full: { [Language.EN]: 'Capital Expenditure', [Language.GE]: 'კაპიტალური ხარჯები', [Language.DE]: 'Investitionsausgaben' },
    def: { 
      [Language.EN]: 'Investments in long-term assets, such as washing machines, real estate or vehicles.', 
      [Language.GE]: 'ინვესტიციები გრძელვადიან აქტივებში, როგორიცაა სარეცხი მანქანები, უძრავი ქონება ან ავტომობილები.', 
      [Language.DE]: 'Investitionen in langfristige Vermögenswerte wie Waschmaschinen, Immobilien oder Fahrzeuge.' 
    },
    icon: 'Zap',
    color: 'bg-indigo-50'
  },
  {
    term: 'OPEX',
    full: { [Language.EN]: 'Operational Expenditure', [Language.GE]: 'საოპერაციო ხარჯები', [Language.DE]: 'Betriebskosten' },
    def: { 
      [Language.EN]: 'Ongoing costs necessary for daily business functioning: utilities, chemicals, wages.', 
      [Language.GE]: 'მიმდინარე ხარჯები, რომლებიც აუცილებელია ბიზნესის ყოველდღიური ფუნქციონირებისთვის: კომუნალურები, ქიმია, ხელფასები.', 
      [Language.DE]: 'Laufende Kosten, die für den täglichen Geschäftsbetrieb notwendig sind: Versorgungsleistungen, Chemikalien, Löhne.' 
    },
    icon: 'TrendingUp',
    color: 'bg-emerald-50'
  },
  {
    term: 'EBITDA',
    full: { [Language.EN]: 'Earnings Before Interest, Taxes, Depreciation, and Amortization', [Language.GE]: 'მოგება პროცენტების, გადასახადების და ცვეთის გამოკლებამდე', [Language.DE]: 'Ergebnis vor Zinsen, Steuern, Abschreibungen' },
    def: { 
      [Language.EN]: 'Measure of business operational efficiency, excluding financial and accounting decisions.', 
      [Language.GE]: 'ბიზნესის საოპერაციო ეფექტურობის საზომი, რომელიც გამორიცხავს ფინანსურ და ბუღალტრულ გადაწყვეტილებებს.', 
      [Language.DE]: 'Maß für die operative Effizienz des Unternehmens, ohne Berücksichtigung von Finanz- und Bilanzentscheidungen.' 
    },
    icon: 'DollarSign',
    color: 'bg-amber-50'
  },
  {
    term: 'Unit Economics',
    full: { [Language.EN]: 'Per Unit Efficiency', [Language.GE]: 'ერთეულის ეკონომიკა', [Language.DE]: 'Einheitsökonomie' },
    def: { 
      [Language.EN]: 'Direct costs and revenues associated with a single unit (in this case: 1 kg of linen).', 
      [Language.GE]: 'პირდაპირი ხარჯები და შემოსავლები, რომლებიც დაკავშირებულია ერთ ერთეულთან (ამ შემთხვევაში: 1 კგ თეთრეული).', 
      [Language.DE]: 'Direkte Kosten und Erlöse, die mit einer einzelnen Einheit verbunden sind (in diesem Fall: 1 kg Wäsche).' 
    },
    icon: 'Zap',
    color: 'bg-rose-50'
  },
  {
    term: 'LTV',
    full: { [Language.EN]: 'Lifetime Value', [Language.GE]: 'კლიენტის სასიცოცხლო ღირებულება', [Language.DE]: 'Kundenlebenszeitwert' },
    def: { 
      [Language.EN]: 'Total revenue expected from a single client over their total contract duration.', 
      [Language.GE]: 'ჯამური შემოსავალი, რომელსაც კომპანია ელოდება ერთი კლიენტისგან მთელი საკონტრაქტო პერიოდის განმავლობაში.', 
      [Language.DE]: 'Gesamtumsatz, der von einem einzelnen Kunden über die gesamte Vertragslaufzeit erwartet wird.' 
    },
    icon: 'ShieldCheck',
    color: 'bg-blue-50'
  }
];

export const GlossaryView: React.FC<{ lang: Language }> = ({ lang }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const t = translations[lang];
  const [terms, setTerms] = useState<GlossaryTerm[]>(() => {
    const saved = localStorage.getItem('laundrometric_glossary_data_v4');
    if (saved) return JSON.parse(saved);
    return DEFAULT_GLOSSARY;
  });
  const [isAdding, setIsAdding] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);
  const [newTerm, setNewTerm] = useState<any>({
    term: '',
    full: { [Language.EN]: '', [Language.GE]: '', [Language.DE]: '' },
    def: { [Language.EN]: '', [Language.GE]: '', [Language.DE]: '' },
    icon: 'BookOpen',
    color: 'bg-slate-50'
  });

  useEffect(() => {
    localStorage.setItem('laundrometric_glossary_data_v4', JSON.stringify(terms));
  }, [terms]);

  const filteredTerms = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return terms.filter(item => 
      item.term.toLowerCase().includes(q) || 
      item.full[lang].toLowerCase().includes(q) || 
      item.def[lang].toLowerCase().includes(q)
    );
  }, [terms, searchQuery, lang]);

  const handleAutoFill = async () => {
    if (!newTerm.term) return;
    const termKey = newTerm.term.toUpperCase();
    
    setAutoFilling(true);
    try {
      if (INTERNAL_KB[termKey]) {
        const data = INTERNAL_KB[termKey];
        setNewTerm({
          ...newTerm,
          full: data.full,
          def: data.def
        });
      } else {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
          As a professional financier for an industrial laundry company, define the term "${newTerm.term}".
          Provide a technical, business-oriented definition focused on the laundry/hospitality industry context.
          
          Return only a valid JSON object with the following structure:
          {
            "full": { "en": "Full Name in English", "ge": "სრული სახელი ქართულად", "de": "Vollständiger Name auf Deutsch" },
            "def": { "en": "Professional definition in English", "ge": "პროფესიული განმარტება ქართულად", "de": "Professionelle Definition auf Deutsch" }
          }
        `;
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        const result = JSON.parse(response.text || '{}');
        if (result.full && result.def) {
          setNewTerm({
            ...newTerm,
            full: result.full,
            def: result.def
          });
        }
      }
    } catch (error) {
      console.error("Auto-fill error:", error);
    } finally {
      setAutoFilling(false);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="text-indigo-500" />;
      case 'TrendingUp': return <TrendingUp className="text-emerald-500" />;
      case 'DollarSign': return <DollarSign className="text-amber-500" />;
      case 'ShieldCheck': return <ShieldCheck className="text-blue-500" />;
      default: return <BookOpen className="text-slate-500" />;
    }
  };

  const handleAddTerm = () => {
    if (!newTerm.term || !newTerm.def[Language.EN]) return;
    const termToAdd: GlossaryTerm = {
      ...newTerm,
      isCustom: true
    };
    setTerms([termToAdd, ...terms]);
    setIsAdding(false);
    setNewTerm({
      term: '',
      full: { [Language.EN]: '', [Language.GE]: '', [Language.DE]: '' },
      def: { [Language.EN]: '', [Language.GE]: '', [Language.DE]: '' },
      icon: 'BookOpen',
      color: 'bg-slate-50'
    });
  };

  const deleteTerm = (termToDelete: string) => {
    setTerms(terms.filter(t => t.term !== termToDelete));
  };

  return (
    <div className="w-full flex flex-col gap-10 pb-40 px-2 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 flex items-center gap-6 tracking-tighter">
            <BookOpen className="text-indigo-600" size={48} /> {t.glossaryTitle}
          </h2>
          <p className="text-sm text-slate-500 mt-2 uppercase tracking-[0.2em] font-black">{t.glossarySubtitle}</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in duration-300 border border-slate-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{t.addNewTerm}</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Term (English - Required)</label>
                   <button 
                     onClick={handleAutoFill}
                     disabled={!newTerm.term || autoFilling}
                     className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-400 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
                   >
                     {autoFilling ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                     {autoFilling ? 'Fetching...' : 'Auto'}
                   </button>
                </div>
                <input 
                  type="text" 
                  value={newTerm.term}
                  onChange={(e) => setNewTerm({...newTerm, term: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. ROI"
                />
              </div>

              {(Object.values(Language) as Language[]).map(l => (
                <div key={l} className="space-y-4 border-l-4 border-slate-100 pl-4">
                  <p className="text-[10px] font-black text-indigo-500 uppercase">{l} Version</p>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Full Name ({l})</label>
                    <input 
                      type="text" 
                      value={newTerm.full[l]}
                      onChange={(e) => setNewTerm({...newTerm, full: { ...newTerm.full, [l]: e.target.value }})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Definition ({l})</label>
                    <textarea 
                      value={newTerm.def[l]}
                      onChange={(e) => setNewTerm({...newTerm, def: { ...newTerm.def, [l]: e.target.value }})}
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                </div>
              ))}
              
              <button 
                onClick={handleAddTerm}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-200"
              >
                {t.saveTerm}
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredTerms.length === 0 ? (
        <div className="p-20 text-center border-4 border-dashed rounded-[3rem] text-slate-300 font-black uppercase text-2xl flex flex-col items-center gap-4">
          <Search size={64} className="opacity-20" />
          {t.termNotFound}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTerms.map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
              <div className={`absolute -right-4 -top-4 w-24 h-24 opacity-20 rounded-full group-hover:scale-110 transition-transform ${item.color}`}></div>
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-2xl ${item.color} shadow-inner`}>
                  {getIcon(item.icon)}
                </div>
                {item.isCustom && (
                  <button 
                    onClick={() => deleteTerm(item.term)}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{item.term}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.full[lang]}</p>
                <div className="h-px bg-slate-100 my-4"></div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium mt-2">{item.def[lang]}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-10 border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="p-6 bg-white/10 rounded-[2rem] border border-white/20">
          <Info size={40} className="text-indigo-300" />
        </div>
        <div>
          <h4 className="text-xl font-black mb-2 uppercase tracking-tighter">{t.importanceTitle}</h4>
          <p className="text-sm text-slate-400 leading-relaxed font-medium opacity-80 italic">
            {t.importanceDesc}
          </p>
        </div>
      </div>
    </div>
  );
};
