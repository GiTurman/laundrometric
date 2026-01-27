
import React from 'react';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Zap, 
  Target, 
  ArrowRight, 
  Sparkles, 
  Lightbulb,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { ScenarioType } from '../types';

interface Props {
  scenario: ScenarioType;
  onDataUpdate?: (data: string) => void;
}

export const StrategicAnalysisView: React.FC<Props> = ({ scenario, onDataUpdate }) => {
  
  React.useEffect(() => {
    if (onDataUpdate) {
      onDataUpdate("სტრატეგიული ანალიზი: SWOT მატრიცა და TOWS სამოქმედო გეგმა. ძლიერი მხარეები: საკუთარი ფართი, ენერგოეფექტური ტექნოლოგია. შესაძლებლობები: ტურიზმის ზრდა.");
    }
  }, [onDataUpdate]);

  const swotData = [
    {
      title: 'Strengths',
      titleKa: 'ძლიერი მხარეები',
      icon: Shield,
      color: 'emerald',
      bgClass: 'bg-emerald-500',
      textClass: 'text-emerald-600',
      items: [
        { text: 'Owned real estate (zero rent)', impact: 'ამცირებს ფიქსირებულ ხარჯებს 15-20%-ით.' },
        { text: 'Strategic hub in Samgori', impact: 'ოპტიმალური ლოგისტიკა თბილისის სასტუმროებისთვის.' },
        { text: 'Energy-efficient machinery', impact: '30%-ით ნაკლები კომუნალური ხარჯი.' }
      ]
    },
    {
      title: 'Weaknesses',
      titleKa: 'სუსტი მხარეები',
      icon: AlertTriangle,
      color: 'amber',
      bgClass: 'bg-amber-500',
      textClass: 'text-amber-600',
      items: [
        { text: 'New market entrant', impact: 'საჭიროებს აგრესიულ მარკეტინგს ნდობისთვის.' },
        { text: 'Limited brand awareness', impact: 'გაყიდვების ციკლი შესაძლოა იყოს ხანგრძლივი.' },
        { text: 'Single-vehicle dependency', impact: 'ოპერაციული რისკი ავტომობილის გაუმართაობისას.' }
      ]
    },
    {
      title: 'Opportunities',
      titleKa: 'შესაძლებლობები',
      icon: TrendingUp,
      color: 'blue',
      bgClass: 'bg-blue-500',
      textClass: 'text-blue-600',
      items: [
        { text: '15% YoY tourism growth', impact: 'მზარდი მოთხოვნა სამრეცხაო სერვისებზე.' },
        { text: 'Rise of Airbnb outsourcing', impact: 'ახალი ნიშა მცირე აპარტამენტებისთვის.' },
        { text: 'Government grants (Green biz)', impact: 'დამატებითი დაფინანსების წყარო ტექნოლოგიებისთვის.' }
      ]
    },
    {
      title: 'Threats',
      titleKa: 'საფრთხეები',
      icon: Zap,
      color: 'rose',
      bgClass: 'bg-rose-500',
      textClass: 'text-rose-600',
      items: [
        { text: 'Utility price inflation', impact: 'ენერგომატარებლების გაძვირება ამცირებს მარჟას.' },
        { text: 'Competitor price wars', impact: 'დემპინგური ფასები ბაზრის სხვა მოთამაშეებისგან.' },
        { text: 'Labor shortage', impact: 'კვალიფიციური კადრების მოზიდვის სირთულე.' }
      ]
    }
  ];

  return (
    <div className="w-full flex flex-col gap-12 pb-40 px-2 animate-in fade-in duration-700">
      
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-900 flex items-center gap-6 tracking-tighter">
            <Target className="text-indigo-600" size={48} /> სტრატეგიული ანალიზი (SWOT)
          </h2>
          <p className="text-sm text-slate-500 mt-2 uppercase tracking-[0.2em] font-black">Strategic Positioning & TOWS Action Matrix ({scenario})</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-2xl shadow-xl">
          <Sparkles size={20} className="text-amber-400 ml-2" />
          <span className="text-xs font-black text-slate-100 uppercase pr-2">Strategic Intelligence Active</span>
        </div>
      </div>

      {/* SWOT Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {swotData.map((quadrant) => (
          <div 
            key={quadrant.title} 
            className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
          >
            <div className={`absolute -right-8 -top-8 w-48 h-48 opacity-[0.03] rounded-full group-hover:scale-110 transition-transform ${quadrant.bgClass}`}></div>
            
            <div className="flex items-center gap-5 mb-8">
              <div className={`p-4 rounded-2xl bg-opacity-10 shadow-inner ${quadrant.bgClass}`}>
                <quadrant.icon size={28} className={quadrant.textClass} />
              </div>
              <div>
                <h3 className={`text-xl font-black uppercase tracking-tighter ${quadrant.textClass}`}>{quadrant.title}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{quadrant.titleKa}</p>
              </div>
            </div>

            <ul className="space-y-6">
              {quadrant.items.map((item, idx) => (
                <li key={idx} className="relative group/item">
                  <div className="flex items-start gap-4">
                    <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${quadrant.bgClass}`}></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-tight">{item.text}</p>
                      <div className="max-h-0 overflow-hidden group-hover/item:max-h-20 transition-all duration-500 ease-in-out">
                         <p className={`text-[11px] font-black uppercase mt-2 tracking-tight flex items-center gap-2 ${quadrant.textClass}`}>
                           <ArrowRight size={12} /> Strategic Impact: {item.impact}
                         </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* TOWS Action Cards */}
      <div className="space-y-6">
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest flex items-center gap-3 px-4">
          <Lightbulb className="text-amber-500" size={24} /> Strategic Priorities (TOWS)
        </h3>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Card 1: S-O Strategy */}
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border border-slate-800 hover:border-indigo-500/50 transition-all group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
              <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg shadow-indigo-500/20 self-start">
                <span className="text-xs font-black uppercase tracking-widest text-indigo-100">Market Penetration</span>
                <p className="text-2xl font-black tracking-tighter mt-1">S-O Strategy</p>
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-slate-200 leading-relaxed italic">
                  "Leverage <span className="text-emerald-400">zero-rent advantage</span> to offer disruptive pricing and capture 20% of Tbilisi's Mini-hotel segment within the first 6 months of operations."
                </p>
                <div className="flex items-center gap-3 mt-6">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Target: Market Dominance Hub</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: S-T Strategy */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
              <div className="bg-slate-100 p-6 rounded-3xl border border-slate-200 self-start">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Operational Excellence</span>
                <p className="text-2xl font-black tracking-tighter mt-1 text-slate-800">S-T Strategy</p>
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-slate-600 leading-relaxed italic">
                  "Use <span className="text-indigo-600">energy-efficient machinery</span> as a hedge against utility price inflation, maintaining industry-leading margins while competitors struggle with costs."
                </p>
                <div className="flex items-center gap-3 mt-6 text-indigo-600">
                  <Zap size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Efficiency Protocol: Fully Enabled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: W-T Strategy */}
          <div className="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
              <div className="bg-rose-600 p-6 rounded-3xl shadow-lg shadow-rose-500/20 self-start">
                <span className="text-xs font-black uppercase tracking-widest text-rose-100 text-opacity-80">Risk Mitigation</span>
                <p className="text-2xl font-black tracking-tighter mt-1 text-white">W-T Strategy</p>
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-rose-900 leading-relaxed italic">
                  "Secure <span className="text-rose-600 font-black">long-term (12-month) fixed contracts</span> with VIP hospitality clients to stabilize cash flow and neutralize external labor and price volatility."
                </p>
                <div className="flex items-center gap-3 mt-6 text-rose-500">
                  <Lock size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Portfolio Stability: High Priority</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
