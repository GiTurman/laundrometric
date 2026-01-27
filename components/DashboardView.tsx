
import React, { useMemo, useState } from 'react';
import { 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  Layers, 
  PieChart as PieIcon, 
  ArrowUpRight, 
  Target, 
  AlertTriangle, 
  Briefcase,
  Users,
  Percent,
  Calculator,
  Flame,
  Droplets,
  Truck,
  Building2,
  Flag
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { useFinancialEngine } from '../hooks/useFinancialEngine';
import { ScenarioType, FinancialInputs } from '../types';

interface DashboardProps {
  scenario: ScenarioType;
  inputs: FinancialInputs;
  onDataUpdate?: (data: string) => void;
}

const formatCurr = (n: number) => n.toLocaleString('ka-GE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export const DashboardView: React.FC<DashboardProps> = ({ scenario, inputs, onDataUpdate }) => {
  const financialData = useFinancialEngine(scenario);
  const m12 = financialData[11] || financialData[financialData.length - 1];

  // SSoT Market Analysis
  const marketWideData = JSON.parse(localStorage.getItem('laundrometric_market_analysis') || '{}');
  const companyData = JSON.parse(localStorage.getItem('laundrometric_company_share_data') || '{}');
  
  const marketTotals = useMemo(() => {
    let marketKg = 0;
    let companyKg = 0;
    const segments = [
      { id: 'mini', avg: 10 }, { id: 'small', avg: 35 }, { id: 'medium', avg: 65 }, { id: 'large', avg: 100 }, { id: 'vip', avg: 160 }
    ];
    
    Object.values(marketWideData).forEach((region: any) => {
      segments.forEach(seg => {
        marketKg += (region[seg.id] || 0) * seg.avg * 4.5 * 0.7 * 30;
      });
    });
    Object.values(companyData).forEach((region: any) => {
      segments.forEach(seg => {
        companyKg += (region[seg.id] || 0) * seg.avg * 4.5 * 0.7 * 30;
      });
    });

    return { marketKg, companyKg, share: marketKg > 0 ? (companyKg / marketKg) * 100 : 0 };
  }, [marketWideData, companyData]);

  // Precise Capacity Logic (Matches CapacityPlanner.tsx)
  const dailyCapacityPerWasher = 30 * 9; // 30kg machine * 9 cycles/shift
  const totalDailyCapacity = inputs.ownedWashers * dailyCapacityPerWasher * inputs.shiftsCount;
  const capacityPerMonth = totalDailyCapacity * 30;
  
  const utilization = capacityPerMonth > 0 ? (m12.kgVolume / capacityPerMonth) * 100 : 0;
  const netProfitMargin = m12.revenue > 0 ? (m12.netProfit / m12.revenue) * 100 : 0;

  // BEP Logic
  const breakEvenMonth = financialData.find(m => m.netProfit > 0)?.month || 0;

  // What-if Simulator States
  const [simPrice, setSimPrice] = useState(2.5);
  const [simVol, setSimVol] = useState(100);

  const simProfit = useMemo(() => {
    const baseProfit = m12.netProfit;
    const revenueImpact = (m12.revenue * (simPrice / 2.5) * (simVol / 100)) - m12.revenue;
    return baseProfit + revenueImpact;
  }, [m12, simPrice, simVol]);

  React.useEffect(() => {
    if (onDataUpdate) {
      onDataUpdate(`დაშბორდი: მოგება ${formatCurr(m12.netProfit)} GEL, დატვირთვა ${utilization.toFixed(1)}%, ბაზრის წილი ${marketTotals.share.toFixed(1)}%, BEP: M${breakEvenMonth}.`);
    }
  }, [m12, utilization, marketTotals, breakEvenMonth, onDataUpdate]);

  const KPICard = ({ title, value, suffix, icon: Icon, trend, colorClass }: any) => (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
      <div className={`absolute -right-4 -top-4 w-24 h-24 opacity-[0.03] rounded-full group-hover:scale-110 transition-transform ${colorClass}`}></div>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-opacity-10 shadow-inner ${colorClass}`}>
          <Icon size={20} className={colorClass.replace('bg-', 'text-')} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase">
             <TrendingUp size={8} /> {trend}
          </div>
        )}
      </div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-mono font-black text-slate-900 tracking-tighter">{value}</span>
        <span className="text-xs font-black text-slate-400 uppercase">{suffix}</span>
      </div>
    </div>
  );

  const regionData = [
    { name: 'თბილისი', market: 100, company: marketTotals.share > 0 ? 35 : 0 },
    { name: 'კახეთი', market: 80, company: marketTotals.share > 0 ? 15 : 0 },
    { name: 'გუდაური', market: 60, company: marketTotals.share > 0 ? 10 : 0 },
    { name: 'შემოგარენი', market: 40, company: marketTotals.share > 0 ? 5 : 0 },
  ];

  return (
    <div className="w-full flex flex-col gap-10 pb-40 px-2 animate-in fade-in duration-700">
      
      {/* 1. TOP KPI STRIP - Now with 5 columns for BEP integration */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard 
          title="Capacity Utilization"
          value={utilization.toFixed(1)}
          suffix="%"
          icon={Layers}
          trend={utilization > 80 ? "Peak" : "Stable"}
          colorClass="bg-indigo-600"
        />
        <KPICard 
          title="Monthly Revenue (M12)"
          value={formatCurr(m12.revenue)}
          suffix="GEL"
          icon={TrendingUp}
          trend="On Target"
          colorClass="bg-emerald-600"
        />
        <KPICard 
          title="Break-Even Point (BEP)"
          value={breakEvenMonth > 0 ? `M${breakEvenMonth}` : 'N/A'}
          suffix="Period"
          icon={Flag}
          trend={breakEvenMonth < 6 ? "Fast" : "Standard"}
          colorClass="bg-rose-600"
        />
        <KPICard 
          title="Cost per KG (P&L)"
          value={(m12.cogsTotal / (m12.kgVolume || 1)).toFixed(2)}
          suffix="GEL"
          icon={Calculator}
          colorClass="bg-amber-600"
        />
        <KPICard 
          title="Net Profit Margin"
          value={netProfitMargin.toFixed(1)}
          suffix="%"
          icon={ShieldCheck}
          trend={netProfitMargin > 20 ? "High" : "Optimal"}
          colorClass="bg-indigo-900"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* 2. MARKET SATURATION ANALYTICS */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                       <Target className="text-indigo-600" /> Market Saturation Analysis
                    </h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Target Potential vs Company Share</p>
                 </div>
                 <div className="text-right">
                    <span className="text-4xl font-mono font-black text-indigo-600 tracking-tighter">{marketTotals.share.toFixed(1)}%</span>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Market Share</p>
                 </div>
              </div>
              
              <div className="h-[350px] w-full min-w-0">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                       <YAxis hide />
                       <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                       <Bar dataKey="market" name="Market Potential" fill="#e2e8f0" radius={[10, 10, 10, 10]} barSize={40} />
                       <Bar dataKey="company" name="Company Share" fill="#6366f1" radius={[10, 10, 10, 10]} barSize={40} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-10">
                 <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Regional Dominance</p>
                       <p className="text-base font-black text-slate-800 uppercase tracking-tighter">Tbilisi Central Hub</p>
                    </div>
                    <Building2 className="text-indigo-400 opacity-20" size={32} />
                 </div>
                 <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Expansion Potential</p>
                       <p className="text-base font-black text-indigo-600 uppercase tracking-tighter">Gudauri Winter Peak</p>
                    </div>
                    <Flame className="text-indigo-400 opacity-20" size={32} />
                 </div>
              </div>
           </div>

           {/* 3. OPERATIONAL HEALTH */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl flex flex-col justify-between overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                 <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Zap className="text-amber-400" size={14} /> Utility Efficiency
                    </h4>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-xs">
                          <span className="flex items-center gap-2 text-slate-400"><Flame size={12} /> Gas (m3/kg)</span>
                          <span className="font-mono font-bold text-white">0.22</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                          <span className="flex items-center gap-2 text-slate-400"><Droplets size={12} /> Water (L/kg)</span>
                          <span className="font-mono font-bold text-white">12.0</span>
                       </div>
                    </div>
                 </div>
                 <div className="mt-8 p-3 bg-white/5 rounded-xl border border-white/10 text-[9px] text-slate-400 uppercase font-black tracking-widest text-center">
                    Optimization Target: -5%
                 </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between">
                 <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Truck className="text-indigo-600" size={14} /> Logistics Status
                    </h4>
                    <p className="text-2xl font-mono font-black text-slate-900 tracking-tighter">94%</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight mt-1">Fleet Utilization Rate</p>
                 </div>
                 <div className="mt-8 flex gap-2">
                    <div className="h-1.5 flex-1 bg-emerald-500 rounded-full"></div>
                    <div className="h-1.5 flex-1 bg-emerald-500 rounded-full"></div>
                    <div className="h-1.5 flex-1 bg-slate-100 rounded-full"></div>
                 </div>
              </div>

              <div className="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-8 flex flex-col justify-between">
                 <div>
                    <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <AlertTriangle className="text-rose-500" size={14} /> Inventory Alerts
                    </h4>
                    <p className="text-base font-black text-rose-800 tracking-tighter uppercase leading-tight">Chemical Supplies<br/>Low (4 Days)</p>
                 </div>
                 <button className="mt-8 w-full py-2 bg-rose-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-colors">
                    Re-Order Now
                 </button>
              </div>
           </div>
        </div>

        {/* 4. CUSTOMER INSIGHTS & SIMULATOR */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* CUSTOMER MIX PIE */}
           <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm flex flex-col items-center">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 self-start flex items-center gap-2">
                 <Users className="text-indigo-600" size={14} /> Segmentation Mix
              </h4>
              <div className="h-[350px] w-full min-w-0">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie 
                         data={[
                            { name: 'VIP', value: 30, color: '#4f46e5' },
                            { name: 'Large', value: 45, color: '#10b981' },
                            { name: 'Others', value: 25, color: '#e2e8f0' }
                         ]}
                         innerRadius={60}
                         outerRadius={80}
                         paddingAngle={5}
                         dataKey="value"
                       >
                          {[0, 1, 2].map((_, i) => <Cell key={i} fill={['#4f46e5', '#10b981', '#e2e8f0'][i]} />)}
                       </Pie>
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="flex gap-4 mt-4 w-full justify-center">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase"><div className="w-2 h-2 rounded-full bg-indigo-600"></div> VIP</div>
                 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> LRG</div>
              </div>
           </div>

           {/* WHAT-IF SIMULATOR */}
           <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-8 text-indigo-200 flex items-center gap-2">
                 <Activity size={14} /> What-if Simulator
              </h4>
              <div className="space-y-8">
                 <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-indigo-200">
                       <span>Base Price Impact</span>
                       <span>{simPrice.toFixed(2)} GEL</span>
                    </div>
                    <input 
                      type="range" min="1.5" max="4.0" step="0.1" 
                      value={simPrice} 
                      onChange={(e) => setSimPrice(parseFloat(e.target.value))}
                      className="w-full h-1 bg-indigo-400 rounded-full appearance-none cursor-pointer accent-white" 
                    />
                 </div>
                 <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-indigo-200">
                       <span>Market Volume Impact</span>
                       <span>{simVol}%</span>
                    </div>
                    <input 
                      type="range" min="50" max="200" step="5" 
                      value={simVol} 
                      onChange={(e) => setSimVol(parseInt(e.target.value))}
                      className="w-full h-1 bg-indigo-400 rounded-full appearance-none cursor-pointer accent-white" 
                    />
                 </div>
                 
                 <div className="pt-6 border-t border-indigo-500 mt-6 flex justify-between items-end">
                    <div>
                       <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Simulated Profit</p>
                       <p className="text-3xl font-mono font-black text-white tracking-tighter">{formatCurr(simProfit)}</p>
                    </div>
                    <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase border ${simProfit > m12.netProfit ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-rose-500/20 text-rose-300 border-rose-400/30'}`}>
                       {simProfit > m12.netProfit ? 'Increase' : 'Decrease'}
                    </div>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};
