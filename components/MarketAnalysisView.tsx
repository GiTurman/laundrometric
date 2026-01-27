
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Map as MapIcon, Users, PieChart, Info, TrendingUp, Globe, 
  BarChart3, LineChart as LineIcon, Percent, ShieldCheck, 
  AlertTriangle, Zap, Building2, LayoutGrid, Target, Activity,
  ChevronRight, Hotel, RefreshCw, Briefcase
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell 
} from 'recharts';
import { ScenarioType } from '../types';

// --- CONSTANTS & TYPES ---
interface MarketSegment {
  id: string;
  label: string;
  labelKa: string;
  range: string;
  avgRooms: number;
  color: string;
}

const SEGMENTS: MarketSegment[] = [
  { id: 'mini', label: 'Mini', labelKa: 'მინი', range: '1-20 ოთახი', avgRooms: 10, color: '#60a5fa' },
  { id: 'small', label: 'Small', labelKa: 'მცირე', range: '21-50 ოთახი', avgRooms: 35, color: '#34d399' },
  { id: 'medium', label: 'Medium', labelKa: 'საშუალო', range: '51-80 ოთახი', avgRooms: 65, color: '#fbbf24' },
  { id: 'large', label: 'Large', labelKa: 'დიდი', range: '81-120 ოთახი', avgRooms: 100, color: '#fb923c' },
  { id: 'vip', label: 'VIP', labelKa: 'VIP', range: '121+ ოთახი', avgRooms: 160, color: '#f87171' },
];

const REGIONS = [
  { id: 'tbilisi', label: 'Tbilisi', labelKa: 'თბილისი' },
  { id: 'environs', label: 'Environs', labelKa: 'შემოგარენი' },
  { id: 'kakheti', label: 'Kakheti', labelKa: 'კახეთი' },
  { id: 'gudauri', label: 'Gudauri', labelKa: 'გუდაური' },
];

interface RegionData { [segmentId: string]: number; }
interface MarketData { [regionId: string]: RegionData; }

interface Props {
  scenario: ScenarioType;
  onDataUpdate?: (data: string) => void;
}

export const MarketAnalysisView: React.FC<Props> = ({ scenario, onDataUpdate }) => {
  // --- STATE ---
  const [marketWideData, setMarketWideData] = useState<MarketData>(() => {
    const saved = localStorage.getItem('laundrometric_market_analysis');
    if (saved) return JSON.parse(saved);
    return {
      tbilisi: { mini: 140, small: 75, medium: 38, large: 22, vip: 14 },
      environs: { mini: 45, small: 18, medium: 7, large: 3, vip: 1 },
      kakheti: { mini: 95, small: 32, medium: 14, large: 6, vip: 3 },
      gudauri: { mini: 65, small: 28, medium: 12, large: 4, vip: 2 }
    };
  });

  const [companyData, setCompanyData] = useState<MarketData>(() => {
    const saved = localStorage.getItem('laundrometric_company_share_data');
    if (saved) return JSON.parse(saved);
    return {
      tbilisi: { mini: 15, small: 8, medium: 4, large: 2, vip: 1 },
      environs: { mini: 5, small: 2, medium: 0, large: 0, vip: 0 },
      kakheti: { mini: 10, small: 3, medium: 1, large: 0, vip: 0 },
      gudauri: { mini: 8, small: 4, medium: 2, large: 0, vip: 0 }
    };
  });

  const [customerBase, setCustomerBase] = useState<any[]>([]);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [isUpdating, setIsUpdating] = useState(false);

  // --- LOGIC ---
  const LINEN_FACTOR = 4.5; 
  const OCCUPANCY_ASSUMPTION = 0.75;

  useEffect(() => {
    const savedClients = localStorage.getItem('laundrometric_clients_data');
    if (savedClients) {
      setCustomerBase(JSON.parse(savedClients));
    }
  }, []);

  const calculateKg = (count: number, avgRooms: number) => 
    count * avgRooms * OCCUPANCY_ASSUMPTION * LINEN_FACTOR;

  const getMatrixStats = (data: MarketData) => {
    return REGIONS.reduce((acc, r) => {
      Object.entries(data[r.id] || {}).forEach(([segId, count]) => {
        const seg = SEGMENTS.find(s => s.id === segId);
        acc.rooms += count * (seg?.avgRooms || 0);
        acc.hotels += count;
        acc.kg += calculateKg(count, seg?.avgRooms || 0);
      });
      return acc;
    }, { rooms: 0, hotels: 0, kg: 0 });
  };

  const marketStats = useMemo(() => getMatrixStats(marketWideData), [marketWideData]);
  const companyStats = useMemo(() => getMatrixStats(companyData), [companyData]);

  const customerBaseStats = useMemo(() => {
    return customerBase.reduce((acc, client) => {
      acc.clients += 1;
      acc.rooms += client.roomCount || 0;
      acc.kg += (client.roomCount || 0) * (client.occupancy || OCCUPANCY_ASSUMPTION) * (client.linenPerRoom || LINEN_FACTOR);
      return acc;
    }, { clients: 0, rooms: 0, kg: 0 });
  }, [customerBase]);

  const totalSharePercent = useMemo(() => {
    return marketStats.rooms > 0 ? (companyStats.rooms / marketStats.rooms) * 100 : 0;
  }, [marketStats, companyStats]);

  const regionPotentials = useMemo(() => {
    return REGIONS.map(region => {
      const regPotentialKg = Object.entries(marketWideData[region.id] || {}).reduce((sum, [segId, count]) => {
        const seg = SEGMENTS.find(s => s.id === segId);
        return sum + calculateKg(count, seg?.avgRooms || 0);
      }, 0);
      
      const regCompanyKg = Object.entries(companyData[region.id] || {}).reduce((sum, [segId, count]) => {
        const seg = SEGMENTS.find(s => s.id === segId);
        return sum + calculateKg(count, seg?.avgRooms || 0);
      }, 0);

      return {
        ...region,
        marketKg: regPotentialKg,
        companyKg: regCompanyKg,
        share: regPotentialKg > 0 ? (regCompanyKg / regPotentialKg) * 100 : 0
      };
    });
  }, [marketWideData, companyData]);

  useEffect(() => {
    localStorage.setItem('laundrometric_market_analysis', JSON.stringify(marketWideData));
    localStorage.setItem('laundrometric_company_share_data', JSON.stringify(companyData));
    if (onDataUpdate) {
      onDataUpdate(`ბაზარი: ${formatNum(marketStats.kg)} კგ/დ. წილი: ${totalSharePercent.toFixed(1)}%. კლიენტი: ${customerBaseStats.clients}, ოთახი: ${customerBaseStats.rooms}`);
    }
  }, [marketWideData, companyData, marketStats, totalSharePercent, customerBaseStats, onDataUpdate]);

  const updateMarketCount = (regionId: string, segmentId: string, val: number) => {
    setMarketWideData(prev => ({
      ...prev,
      [regionId]: { ...prev[regionId], [segmentId]: Math.max(0, val) }
    }));
  };

  const updateCompanyCount = (regionId: string, segmentId: string, val: number) => {
    setCompanyData(prev => ({
      ...prev,
      [regionId]: { ...prev[regionId], [segmentId]: Math.max(0, val) }
    }));
  };

  const handleLiveUpdate = () => {
    setIsUpdating(true);
    setTimeout(() => {
      const updatedMarket: MarketData = {
        tbilisi: { mini: 160, small: 85, medium: 45, large: 28, vip: 18 },
        environs: { mini: 55, small: 25, medium: 12, large: 6, vip: 2 },
        kakheti: { mini: 110, small: 42, medium: 20, large: 12, vip: 6 },
        gudauri: { mini: 80, small: 40, medium: 18, large: 10, vip: 4 }
      };
      setMarketWideData(updatedMarket);
      setIsUpdating(false);
    }, 800);
  };

  const formatNum = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

  const chartData = regionPotentials.map(r => ({
    name: r.labelKa,
    kg: Math.round(r.marketKg),
    companyKg: Math.round(r.companyKg)
  }));

  return (
    <div className="w-full flex flex-col gap-10 animate-in fade-in duration-500 pb-40">
      
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-3">
              <MapIcon className="text-indigo-600" /> ბაზრის ანალიზი და რეგიონული პოტენციალი
            </h2>
            <p className="text-sm text-slate-500 mt-1 uppercase tracking-wider">სტრატეგიული სეგმენტაცია და ბაზრის წილის დინამიკა ({scenario})</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {regionPotentials.map(region => (
            <div key={region.id} className={`bg-white border ${region.id === 'gudauri' ? 'border-indigo-500 shadow-indigo-50' : 'border-slate-200'} rounded-xl p-5 shadow-sm hover:border-indigo-400 transition-all group`}>
              <div className="flex items-center justify-between mb-3">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{region.label}</p>
                 {region.id === 'gudauri' && <div className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-bold uppercase rounded">Gudauri Active</div>}
              </div>
              <h4 className="text-base font-bold text-slate-800 mb-1">{region.labelKa}</h4>
              <div className="mt-3 pt-3 border-t border-slate-50 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">ბაზარი:</span>
                  <span className="font-mono font-bold text-slate-700">{formatNum(region.marketKg)} <span className="text-[9px] font-normal">კგ/დ</span></span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase">ჩვენი წილი:</span>
                  <span className="font-mono font-bold text-indigo-600">{region.share.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
              <PieChart size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest leading-none">რეგიონული მოცულობის ვიზუალიზაცია</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">Market Potential (kg) Distribution</p>
            </div>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <button 
              onClick={() => setChartType('bar')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${chartType === 'bar' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <BarChart3 size={14} /> სვეტოვანი
            </button>
            <button 
              onClick={() => setChartType('line')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${chartType === 'line' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LineIcon size={14} /> ხაზოვანი
            </button>
          </div>
        </div>

        <div className="h-[350px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px'}} />
                <Bar name="Market kg/day" dataKey="kg" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                <Bar name="Company kg/day" dataKey="companyKg" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip />
                <Area type="monotone" name="Market Potential" dataKey="kg" stroke="#4f46e5" strokeWidth={3} fill="url(#colorKg)" />
                <Area type="monotone" name="Our Share" dataKey="companyKg" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.2} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-visible border border-slate-800">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -ml-48 -mt-48 pointer-events-none"></div>
        <div className="relative z-10 space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner text-indigo-400">
                <Globe size={36} />
              </div>
              <div>
                <h3 className="text-3xl font-bold uppercase tracking-widest text-white leading-tight">ბაზრის ჯამური პოტენციალი</h3>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-1 opacity-70">Total Available Market Inventory in Georgia</p>
              </div>
            </div>
            <button 
              onClick={handleLiveUpdate}
              disabled={isUpdating}
              className="flex items-center gap-3 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {isUpdating ? <RefreshCw size={14} className="animate-spin" /> : <Activity size={14} />}
              LIVE MARKET ANALYSIS
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
                 <div className="px-6 py-4 border-b border-slate-700/50 flex items-center bg-slate-900/40">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ჯამური სასტუმროები ბაზარზე (რეგიონები & სეგმენტები)</span>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-[10px] table-fixed min-w-[600px]">
                        <thead>
                        <tr className="text-slate-500 uppercase font-bold tracking-tighter border-b border-slate-800/30">
                            <th className="py-4 px-6 text-left w-24">რეგიონი</th>
                            {SEGMENTS.map(s => <th key={s.id} className="py-4 px-1 text-center">{s.labelKa}</th>)}
                            <th className="py-4 px-6 text-right w-36">ჯამური ოთახები</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/20">
                        {REGIONS.map(region => {
                            const regRooms = Object.entries(marketWideData[region.id] || {}).reduce((sum, [segId, count]) => {
                            const seg = SEGMENTS.find(s => s.id === segId);
                            return sum + (count * (seg?.avgRooms || 0));
                            }, 0);
                            return (
                            <tr key={region.id} className="hover:bg-slate-800/10 transition-colors group">
                                <td className="py-5 px-6 font-bold text-slate-300 group-hover:text-white transition-colors">
                                {region.labelKa}
                                <div className="text-[8px] opacity-40 uppercase tracking-tight">{region.label}</div>
                                </td>
                                {SEGMENTS.map(segment => (
                                <td key={segment.id} className="py-5 px-1 text-center">
                                    <input 
                                    type="number" min="0"
                                    value={marketWideData[region.id][segment.id] || ''}
                                    placeholder="0"
                                    onChange={(e) => updateMarketCount(region.id, segment.id, parseInt(e.target.value) || 0)}
                                    className="w-11 text-center bg-slate-950 border border-slate-700 rounded-lg py-2 font-mono text-[11px] text-indigo-400 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                                    />
                                    <div className="text-[7px] text-slate-600 mt-1 uppercase font-bold">
                                    {formatNum((marketWideData[region.id][segment.id] || 0) * segment.avgRooms)} <span className="opacity-50">rm</span>
                                    </div>
                                </td>
                                ))}
                                <td className="py-5 px-6 text-right">
                                <div className="flex flex-col items-end">
                                    <span className="font-mono font-bold text-indigo-400 text-lg">{formatNum(regRooms)}</span>
                                    <div className="text-[9px] text-slate-500 uppercase font-bold tracking-tight">ბაზრის პოტენციალი</div>
                                </div>
                                </td>
                            </tr>
                            )
                        })}
                        </tbody>
                    </table>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col space-y-6 bg-slate-800/30 rounded-[2.5rem] p-10 border border-slate-700/50 shadow-2xl relative self-start">
               <div className="space-y-2">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Market Summary</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-mono font-bold text-white">{formatNum(marketStats.hotels)}</span>
                    <span className="text-indigo-400 text-xs font-bold uppercase tracking-tight">Total Facilities</span>
                 </div>
               </div>
               <div className="h-px bg-slate-700/50 w-full"></div>
               <div className="grid grid-cols-1 gap-4">
                  <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-700/30">
                     <p className="text-[9px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Total Available Capacity</p>
                     <p className="text-xl font-mono font-bold text-indigo-300">{formatNum(marketStats.rooms)} Rooms</p>
                  </div>
                  <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-700/30">
                     <p className="text-[9px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Estimated Monthly Volume</p>
                     <p className="text-xl font-mono font-bold text-emerald-400">{formatNum(marketStats.kg * 30)} kg</p>
                  </div>
               </div>
               <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-[10px] text-slate-400 leading-relaxed">
                  <Info size={14} className="mb-2 text-indigo-400" />
                  This matrix reflects the total industrial laundry demand across all 4-star and 5-star facilities in the monitored zones.
               </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-visible border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none"></div>
        
        <div className="relative z-10 space-y-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
              <Target className="text-emerald-400" size={36} />
            </div>
            <div>
              <h3 className="text-3xl font-bold uppercase tracking-widest text-white leading-tight">ჩვენი კომპანიის წილი ბაზარზე</h3>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-1 opacity-70">Saturation Analysis: Our Reach vs Total Potential</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
                 <div className="px-6 py-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/40">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ლოკალური განაწილება (სეგმენტები & რეგიონები)</span>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-[10px] table-fixed min-w-[600px]">
                        <thead>
                        <tr className="text-slate-500 uppercase font-bold tracking-tighter border-b border-slate-800/30">
                            <th className="py-4 px-6 text-left w-24">რეგიონი</th>
                            {SEGMENTS.map(s => <th key={s.id} className="py-4 px-1 text-center">{s.labelKa}</th>)}
                            <th className="py-4 px-6 text-right w-36">ჩვენი ოთახები</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/20">
                        {REGIONS.map(region => {
                            const regClients = Object.entries(companyData[region.id] || {}).reduce((sum, [_, count]) => sum + count, 0);
                            const regRooms = Object.entries(companyData[region.id] || {}).reduce((sum, [segId, count]) => {
                            const seg = SEGMENTS.find(s => s.id === segId);
                            return sum + (count * (seg?.avgRooms || 0));
                            }, 0);
                            return (
                            <tr key={region.id} className="hover:bg-slate-800/10 transition-colors group">
                                <td className="py-5 px-6 font-bold text-slate-300 group-hover:text-white transition-colors">
                                {region.labelKa}
                                <div className="text-[8px] opacity-40 uppercase tracking-tight">{region.label}</div>
                                </td>
                                {SEGMENTS.map(segment => (
                                <td key={segment.id} className="py-5 px-1 text-center">
                                    <input 
                                    type="number" min="0"
                                    value={companyData[region.id][segment.id] || ''}
                                    placeholder="0"
                                    onChange={(e) => updateCompanyCount(region.id, segment.id, parseInt(e.target.value) || 0)}
                                    className="w-11 text-center bg-slate-950 border border-slate-700 rounded-lg py-2 font-mono text-[11px] text-emerald-400 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-inner"
                                    />
                                    <div className="text-[7px] text-slate-600 mt-1 uppercase font-bold">
                                    {formatNum((companyData[region.id][segment.id] || 0) * segment.avgRooms)} <span className="opacity-50">rm</span>
                                    </div>
                                </td>
                                ))}
                                <td className="py-5 px-6 text-right">
                                <div className="flex flex-col items-end">
                                    <span className="font-mono font-bold text-emerald-400 text-lg">{formatNum(regRooms)}</span>
                                    <div className="text-[9px] text-slate-500 uppercase font-bold tracking-tight">{regClients} კლიენტი</div>
                                </div>
                                </td>
                            </tr>
                            )
                        })}
                        </tbody>
                    </table>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col space-y-8 bg-slate-800/30 rounded-[2.5rem] p-10 border border-slate-700/50 shadow-2xl relative self-start">
              <div className="flex flex-col items-center">
                 <div className="relative w-52 h-52 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 filter drop-shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <circle cx="104" cy="104" r="92" fill="none" stroke="#1e293b" strokeWidth="16" />
                      <circle 
                        cx="104" cy="104" r="92" fill="none" stroke="url(#marketGradientFinal)" strokeWidth="16" 
                        strokeDasharray={`${Math.min(1, (totalSharePercent / 100)) * 578} 578`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="marketGradientFinal" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#34d399" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black font-mono text-white tracking-tighter">
                        {totalSharePercent.toFixed(1)}%
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 mt-2 tracking-[0.2em] opacity-80">ჯამური წილი</span>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-4 w-full mt-10">
                    <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-700/50 shadow-inner flex justify-between items-center group">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1.5 tracking-wider">
                           <Users size={12} className="text-emerald-500" /> კლიენტები / ბაზარი
                        </p>
                        <p className="text-2xl font-mono font-bold text-emerald-400">
                          {companyStats.hotels} / {marketStats.hotels}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-slate-800" />
                    </div>
                    <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-700/50 shadow-inner flex justify-between items-center group">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1.5 tracking-wider">
                           <Hotel size={12} className="text-indigo-400" /> ოთახები / პოტენციალი
                        </p>
                        <p className="text-2xl font-mono font-bold text-white">
                          {formatNum(companyStats.rooms)} / {formatNum(marketStats.rooms)}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-slate-800" />
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 border-t-4 border-t-emerald-500 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-emerald-600">
              <ShieldCheck size={18} />
              <h4 className="font-bold text-xs uppercase tracking-widest">Strengths</h4>
            </div>
            <ul className="text-[11px] text-slate-500 space-y-2.5 list-disc pl-4">
              <li>ლოკაცია: სამგორის ლოგისტიკური ჰაბი.</li>
              <li>ეფექტურობა: ახალი დანადგარები.</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 border-t-4 border-t-amber-500 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-amber-600">
              <AlertTriangle size={18} />
              <h4 className="font-bold text-xs uppercase tracking-widest">Weaknesses</h4>
            </div>
            <ul className="text-[11px] text-slate-500 space-y-2.5 list-disc pl-4">
              <li>ბრენდი: ახალი მოთამაშე ბაზარზე.</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 border-t-4 border-t-blue-500 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-blue-600">
              <TrendingUp size={18} />
              <h4 className="font-bold text-xs uppercase tracking-widest">Opportunities</h4>
            </div>
            <ul className="text-[11px] text-slate-500 space-y-2.5 list-disc pl-4">
              <li>ზრდა: ტურიზმის სექტორის +15% მატება.</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 border-t-4 border-t-red-500 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-red-600">
              <Zap size={18} />
              <h4 className="font-bold text-xs uppercase tracking-widest">Threats</h4>
            </div>
            <ul className="text-[11px] text-slate-500 space-y-2.5 list-disc pl-4">
              <li>ინფლაცია: ტარიფების შესაძლო ზრდა.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
