
import React, { useMemo } from 'react';
import { useFinancialEngine } from '../hooks/useFinancialEngine';
import { ScenarioType } from '../types';
import { 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Percent, 
  Target, 
  ArrowUpRight,
  Landmark,
  Scale
} from 'lucide-react';

interface Props {
  scenario: ScenarioType;
  onDataUpdate?: (data: string) => void;
}

const format = (n: number) => n.toLocaleString('ka-GE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatInt = (n: number) => n.toLocaleString('ka-GE', { maximumFractionDigits: 0 });

export const FinancialRatiosView: React.FC<Props> = ({ scenario, onDataUpdate }) => {
  const data = useFinancialEngine(scenario);
  
  // Select Year 1 (M12) as the benchmark for ratios
  const year1 = data[11];
  const year2 = data[23];
  const lastM = data[data.length - 1];

  // Logic to find Break-Even Point (where monthly net profit becomes positive)
  const breakEvenMonth = data.find(m => m.netProfit > 0)?.month || 0;
  
  const ratios = useMemo(() => {
    if (!year1) return null;

    // ROI = Annualized Net Profit / Total Investment
    const annualProfit = data.slice(0, 12).reduce((sum, m) => sum + Math.max(0, m.netProfit), 0);
    const totalInvestment = data[0].equityContributed + data[0].liabilitiesTotal;
    const roi = totalInvestment > 0 ? (annualProfit / totalInvestment) * 100 : 0;

    // ROE = Annual Net Profit / Year 1 Equity
    const roe = year1.equityTotal > 0 ? (annualProfit / year1.equityTotal) * 100 : 0;

    // Current Ratio = Current Assets / Current Liabilities
    const currentRatio = year1.liabilitiesTotal > 0 ? (year1.cash + year1.ar + year1.inventory) / year1.liabilitiesTotal : 0;

    // Net Margin
    const netMargin = year1.revenue > 0 ? (year1.netProfit / year1.revenue) * 100 : 0;

    return { roi, roe, currentRatio, netMargin, annualProfit, totalInvestment };
  }, [data, year1]);

  React.useEffect(() => {
    if (onDataUpdate && ratios) {
      onDataUpdate(`ფინანსური კოეფიციენტები: ROI: ${ratios.roi.toFixed(1)}%, BEP თვე: ${breakEvenMonth}, მიმდინარე ლიკვიდობა: ${ratios.currentRatio.toFixed(2)}.`);
    }
  }, [ratios, breakEvenMonth, onDataUpdate]);

  if (!ratios) return null;

  const RatioCard = ({ title, titleKa, value, suffix, icon: Icon, colorClass, description }: any) => (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden relative">
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 ${colorClass}`}></div>
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${colorClass} bg-opacity-10 shadow-inner`}>
          <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{titleKa}</p>
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-mono font-black text-slate-900 tracking-tighter">{value}</span>
        <span className="text-sm font-black text-slate-400 uppercase">{suffix}</span>
      </div>
      <p className="text-[11px] text-slate-500 font-medium mt-4 leading-relaxed border-t border-slate-50 pt-4">
        {description}
      </p>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-10 pb-40 px-2 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-900 flex items-center gap-6 tracking-tighter">
            <Activity className="text-indigo-600" size={48} /> ფინანსური კოეფიციენტები
          </h2>
          <p className="text-sm text-slate-500 mt-2 uppercase tracking-[0.2em] font-black">Financial Ratios & Performance Benchmarks ({scenario})</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-2xl border border-slate-200">
          <BarChart3 size={20} className="text-slate-400 ml-2" />
          <span className="text-xs font-black text-slate-600 uppercase pr-2">Analytical Engine Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RatioCard 
          title="Return on Investment"
          titleKa="ინვესტიციის ამონაგები"
          value={ratios.roi.toFixed(1)}
          suffix="%"
          icon={TrendingUp}
          colorClass="bg-indigo-600"
          description="ROI ზომავს ყოველწლიურ წმინდა მოგებას ჯამურ ინვესტირებულ კაპიტალთან მიმართებაში."
        />
        <RatioCard 
          title="Return on Equity"
          titleKa="კაპიტალის ამონაგები"
          value={ratios.roe.toFixed(1)}
          suffix="%"
          icon={ArrowUpRight}
          colorClass="bg-emerald-600"
          description="ROE აჩვენებს დამფუძნებლების მიერ ჩადებული 1 ლარის მიერ გენერირებულ მოგებას."
        />
        <RatioCard 
          title="Current Ratio"
          titleKa="მიმდინარე ლიკვიდობა"
          value={ratios.currentRatio.toFixed(2)}
          suffix="x"
          icon={Scale}
          colorClass="bg-amber-600"
          description="ლიკვიდობის კოეფიციენტი 1.0-ზე მეტი ნიშნავს, რომ კომპანიას შეუძლია მოკლევადიანი ვალების დაფარვა."
        />
        <RatioCard 
          title="Break-Even Point"
          titleKa="ნულოვანი წერტილი"
          value={`M${breakEvenMonth}`}
          suffix="Period"
          icon={Target}
          colorClass="bg-rose-600"
          description="თვე, როდესაც საოპერაციო შემოსავლები სრულად ფარავს ხარჯებს და იწყება მოგების დაგროვება."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mb-32"></div>
          <h3 className="text-lg font-black uppercase tracking-widest mb-10 flex items-center gap-3">
             <Zap className="text-amber-400" size={20} /> Profitability Benchmarks (Year 1)
          </h3>
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Gross Profit Margin</span>
                <span className="font-mono font-bold text-2xl text-emerald-400">{year1.grossMargin.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${year1.grossMargin}%` }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Operating Margin (EBIT)</span>
                <span className="font-mono font-bold text-2xl text-indigo-400">{year1.operatingMargin.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.max(0, year1.operatingMargin)}%` }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Net Profit Margin</span>
                <span className="font-mono font-bold text-2xl text-white">{ratios.netMargin.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${Math.max(0, ratios.netMargin)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm flex flex-col justify-between">
           <div className="space-y-6">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                <ShieldCheck size={24} className="text-emerald-600" /> საბალანსო მდგრადობა
              </h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center py-4 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Debt to Equity Ratio</span>
                    <span className="font-mono font-bold text-slate-900">{(year1.liabilitiesTotal / year1.equityTotal).toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center py-4 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Working Capital</span>
                    <span className="font-mono font-bold text-indigo-600">{formatInt(year1.cash + year1.ar + year1.inventory - year1.liabilitiesTotal)} GEL</span>
                 </div>
                 <div className="flex justify-between items-center py-4 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Asset Turnover</span>
                    <span className="font-mono font-bold text-slate-900">{(year1.revenue / year1.assets).toFixed(2)}</span>
                 </div>
              </div>
           </div>
           <div className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 italic leading-relaxed">
             "ფინანსური კოეფიციენტები გამოთვლილია IFRS სტანდარტების შესაბამისად. ROI და ROE მაჩვენებლები ითვალისწინებენ პირველი 12 თვის დაგროვილ მოგებას."
           </div>
        </div>
      </div>
    </div>
  );
};
