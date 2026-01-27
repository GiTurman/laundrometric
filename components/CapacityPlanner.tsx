
import React, { useEffect } from 'react';
import { Truck, Calculator, Settings2, Layers, CheckCircle2, AlertTriangle, Zap, Hotel } from 'lucide-react';
import { FinancialInputs, LinenItem } from '../types';

interface Props {
  inputs: FinancialInputs;
  onChange: (key: keyof FinancialInputs, value: any) => void;
  onDataUpdate?: (data: string) => void;
  aiExpanded: boolean;
}

export const CapacityPlanner: React.FC<Props> = ({ inputs, onChange, onDataUpdate, aiExpanded }) => {
  
  // Market Standards for Georgian 4-Star Hotel
  const applyStandards = () => {
    const standards: LinenItem[] = [
      { id: '1', nameKa: 'ზეწარი', nameEn: 'Bed Sheet', weightG: 1000, qtyPerRoom: 2, active: true },
      { id: '2', nameKa: 'ბალიშის პირი', nameEn: 'Pillow Case', weightG: 200, qtyPerRoom: 4, active: true },
      { id: '3', nameKa: 'საბნის პირი', nameEn: 'Duvet Cover', weightG: 1350, qtyPerRoom: 1, active: true },
      { id: '4', nameKa: 'დიდი პირსახოცი', nameEn: 'Large Towel', weightG: 700, qtyPerRoom: 2, active: true },
      { id: '5', nameKa: 'ხელის პირსახოცი', nameEn: 'Hand Towel', weightG: 300, qtyPerRoom: 2, active: true },
      { id: '6', nameKa: 'ხალათი', nameEn: 'Bathrobe', weightG: 1200, qtyPerRoom: 1, active: true },
    ];
    onChange('linenItems', standards);
  };

  const updateLinen = (id: string, field: keyof LinenItem, value: any) => {
    const newItems = inputs.linenItems.map(item => item.id === id ? { ...item, [field]: value } : item);
    onChange('linenItems', newItems);
  };

  // Module 1 Calculations (Per 1 Room) - Only active items
  const weightPerRoomKg = inputs.linenItems
    .filter(item => item.active)
    .reduce((acc, item) => acc + (item.weightG * item.qtyPerRoom / 1000), 0);
  
  // Module 2 Calculations (Total Scale)
  const dailyVolume = inputs.hotelRooms * weightPerRoomKg * inputs.utilizationRate;
  
  // Module 3 Hardware Logic
  const capacityPerWasherPerShift = 9; // 30kg units
  const cyclesNeeded = dailyVolume / 30;
  
  const reqWashers = Math.max(1, Math.ceil(cyclesNeeded / (capacityPerWasherPerShift * inputs.shiftsCount)));
  const reqDryers = Math.ceil(reqWashers * 1.3);
  const reqCalendars = Math.ceil(reqWashers / 3);

  // Shortfall Calculations
  const currentCapacity = inputs.ownedWashers * 30 * capacityPerWasherPerShift * inputs.shiftsCount;
  const shortfallKg = Math.max(0, dailyVolume - currentCapacity);
  const isShortfall = shortfallKg > 1;

  // Report to AI Assistant
  useEffect(() => {
    if (onDataUpdate) {
      const summary = `
        სამიზნე მოცულობა: ${dailyVolume.toFixed(1)} კგ დღეში (${inputs.hotelRooms} ოთახი, ${inputs.utilizationRate * 100}% დატვირთვა).
        აქტიური ნივთები: ${inputs.linenItems.filter(i => i.active).map(i => i.nameEn).join(', ')}.
        საჭირო დანადგარები: ${reqWashers} სარეცხი მანქანა, ${reqDryers} საშრობი, ${reqCalendars} საუთოო ხაზი.
        არსებული სიმძლავრე: ${currentCapacity.toFixed(1)} კგ.
        სტატუსი: ${isShortfall ? `დეფიციტი ${shortfallKg.toFixed(1)} კგ` : 'სიმძლავრე საკმარისია'}.
        ავტომატიზაცია: ${inputs.hasAutoFolder ? 'ჩართულია (დაზოგილია 2 პერსონალი)' : 'გამორთულია'}.
      `;
      onDataUpdate(summary);
    }
  }, [dailyVolume, reqWashers, currentCapacity, isShortfall, shortfallKg, inputs.hasAutoFolder, inputs.linenItems, onDataUpdate]);

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 1 });

  return (
    <div className="animate-in fade-in duration-500 bg-white min-h-screen pb-40">
      <div className="max-w-6xl mx-auto py-8 px-4">
        
        {/* Header */}
        <div className="mb-10 border-b border-slate-200 pb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1 flex items-center gap-2">
              <Settings2 className="text-indigo-600" /> Industrial Capacity Modeler
            </h2>
            <p className="text-sm text-slate-500 uppercase tracking-wide font-medium">Technical Scaling / საწარმოო სიმძლავრის მოდელირება</p>
          </div>
          <button 
            onClick={applyStandards}
            className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-xs font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors shadow-sm"
          >
            <Layers size={14} /> Load 4★ Hotel Standard
          </button>
        </div>

        {/* Module 1: 1-Room Composition */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Calculator size={18} className="text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Module 1: Linen Profile / ოთახის კომპლექტაცია (1 ოთახი)</h3>
          </div>
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-6 w-16 text-center">In Use?</th>
                  <th className="py-3 px-6">Item Name / დასახელება</th>
                  <th className="py-3 px-6 text-center">Unit Weight (g) / წონა (გრ)</th>
                  <th className="py-3 px-6 text-center">Qty / ოთახზე</th>
                  <th className="py-3 px-6 text-right">Total Weight (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inputs.linenItems.map((item) => (
                  <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors ${!item.active ? 'opacity-50 grayscale bg-slate-50/30' : ''}`}>
                    <td className="py-3 px-6 text-center">
                      <input 
                        type="checkbox" 
                        checked={item.active} 
                        onChange={(e) => updateLinen(item.id, 'active', e.target.checked)}
                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-6">
                      <div className="font-medium text-slate-900">{item.nameEn}</div>
                      <div className="text-slate-400 text-[10px] font-bold uppercase">{item.nameKa}</div>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <input type="number" value={item.weightG} onChange={(e) => updateLinen(item.id, 'weightG', parseInt(e.target.value) || 0)} className="w-24 text-center border border-slate-200 bg-white rounded-lg p-2 font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-[#1A1A1A] shadow-sm disabled:bg-slate-50" disabled={!item.active} />
                    </td>
                    <td className="py-3 px-6 text-center">
                      <input type="number" value={item.qtyPerRoom} onChange={(e) => updateLinen(item.id, 'qtyPerRoom', parseInt(e.target.value) || 0)} className="w-20 text-center border border-slate-200 bg-white rounded-lg p-2 font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-[#1A1A1A] shadow-sm disabled:bg-slate-50" disabled={!item.active} />
                    </td>
                    <td className="py-3 px-6 text-right font-mono text-slate-700 font-bold">
                      {item.active ? ((item.weightG * item.qtyPerRoom) / 1000).toFixed(2) : "0.00"}
                    </td>
                  </tr>
                ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50/50 font-bold border-t border-slate-200">
                    <td colSpan={4} className="py-4 px-6 text-right text-xs uppercase tracking-widest text-slate-500">Total Weight Per 1 Room / ჯამური წონა 1 ოთახზე:</td>
                    <td className="py-4 px-6 text-right font-mono text-lg text-indigo-600">{weightPerRoomKg.toFixed(2)} kg</td>
                  </tr>
                </tfoot>
            </table>
          </div>
        </section>

        {/* Module 2: Operational Scale (The "Rooms" Input Section) */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Hotel size={18} className="text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Module 2: Operational Scale / მასშტაბის განსაზღვრა</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2 tracking-widest">Total Hotel Rooms / ოთახების რაოდენობა</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={inputs.hotelRooms} 
                  onChange={(e) => onChange('hotelRooms', parseInt(e.target.value) || 0)}
                  className="w-full border border-slate-200 bg-white rounded-xl p-4 font-mono text-2xl font-bold text-[#1A1A1A] focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs uppercase">Rooms</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2 tracking-widest">Avg. Occupancy Rate / დატვირთვა (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.01"
                  value={inputs.utilizationRate * 100} 
                  onChange={(e) => onChange('utilizationRate', (parseFloat(e.target.value) || 0) / 100)}
                  className="w-full border border-slate-200 bg-white rounded-xl p-4 font-mono text-2xl font-bold text-[#1A1A1A] focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs uppercase">%</span>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 tracking-widest">Target Daily Volume / ჯამური კილოგრამი</label>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-emerald-400">{fmt(dailyVolume)}</span>
                <span className="text-slate-500 font-bold text-sm uppercase">kg / day</span>
              </div>
              <p className="text-[9px] text-slate-500 mt-2 leading-tight uppercase font-medium">
                Calculated as: {inputs.hotelRooms} Rooms × {weightPerRoomKg.toFixed(2)}kg × {fmt(inputs.utilizationRate * 100)}%
              </p>
            </div>
          </div>
        </section>

        {/* Module 3: Interactive Hardware Matrix */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                <Layers size={18} className="text-slate-400" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Module 3: Inventory Gap Analysis / დანადგარების ინვენტარი</h3>
             </div>
             <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                {[1, 2, 3].map(s => (
                  <button key={s} onClick={() => onChange('shiftsCount', s)} className={`px-4 py-1.5 text-[10px] font-bold rounded-md transition-all ${inputs.shiftsCount === s ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-200/50'}`}>
                    {s} Shift{s > 1 ? 's' : ''}
                  </button>
                ))}
             </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-4 px-6">Machine Type / დანადგარი (30kg Unit)</th>
                  <th className="py-4 px-6 text-center">Required / საჭიროა</th>
                  <th className="py-4 px-6 text-center">Owned? / მაქვს?</th>
                  <th className="py-4 px-6 text-right">Gap to Purchase / საყიდელია</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 px-6 font-bold text-slate-900">
                    Washing Machines
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-tight">სარეცხი მანქანა</span>
                  </td>
                  <td className="py-5 px-6 text-center font-mono text-slate-400">{reqWashers}</td>
                  <td className="py-5 px-6 text-center">
                    <input type="number" value={inputs.ownedWashers} onChange={(e) => onChange('ownedWashers', parseInt(e.target.value) || 0)} className="w-20 text-center border border-indigo-200 bg-white rounded-lg p-2 font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" />
                  </td>
                  <td className={`py-5 px-6 text-right font-mono font-bold ${reqWashers - inputs.ownedWashers > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {Math.max(0, reqWashers - inputs.ownedWashers)} units
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 px-6 font-bold text-slate-900">
                    Drying Machines
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-tight">საშრობი მანქანა</span>
                  </td>
                  <td className="py-5 px-6 text-center font-mono text-slate-400">{reqDryers}</td>
                  <td className="py-5 px-6 text-center">
                    <input type="number" value={inputs.ownedDryers} onChange={(e) => onChange('ownedDryers', parseInt(e.target.value) || 0)} className="w-20 text-center border border-indigo-200 bg-white rounded-lg p-2 font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" />
                  </td>
                  <td className={`py-5 px-6 text-right font-mono font-bold ${reqDryers - inputs.ownedDryers > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {Math.max(0, reqDryers - inputs.ownedDryers)} units
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 px-6 font-bold text-slate-900">
                    Ironing Calenders
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-tight">საუთოო ხაზი</span>
                  </td>
                  <td className="py-5 px-6 text-center font-mono text-slate-400">{reqCalendars}</td>
                  <td className="py-5 px-6 text-center">
                    <input type="number" value={inputs.ownedCalendars} onChange={(e) => onChange('ownedCalendars', parseInt(e.target.value) || 0)} className="w-20 text-center border border-indigo-200 bg-white rounded-lg p-2 font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" />
                  </td>
                  <td className={`py-5 px-6 text-right font-mono font-bold ${reqCalendars - inputs.ownedCalendars > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {Math.max(0, reqCalendars - inputs.ownedCalendars)} units
                  </td>
                </tr>
                <tr className="bg-indigo-50/20">
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-3">
                       <Zap className="text-amber-500" size={18} />
                       <div>
                          <div className="font-bold text-slate-900 text-sm">Automatic Folder / ავტომატური დამკეცი</div>
                          <div className="text-[10px] text-indigo-600 uppercase font-bold tracking-tight">Efficiency Protocol Active</div>
                       </div>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-center font-mono text-slate-400 text-xs">1 Unit per 500kg</td>
                  <td className="py-5 px-6 text-center">
                    <input 
                      type="checkbox" 
                      checked={inputs.hasAutoFolder} 
                      onChange={(e) => onChange('hasAutoFolder', e.target.checked)} 
                      className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                    />
                  </td>
                  <td className="py-5 px-6 text-right">
                    {inputs.hasAutoFolder ? (
                       <span className="text-emerald-600 text-[10px] font-bold uppercase flex items-center justify-end gap-1 tracking-tight">
                         <CheckCircle2 size={14} /> Labor Savings Applied (-2 Staff)
                       </span>
                    ) : (
                       <span className="text-slate-400 text-[10px] uppercase font-bold tracking-tight">Manual folding only</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {isShortfall && (
             <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-800">
                <AlertTriangle size={24} className="shrink-0" />
                <div className="text-xs">
                   <span className="font-bold uppercase tracking-tight">Capacity Shortfall Detected! / სიმძლავრის დეფიციტი:</span>
                   <span className="ml-2 font-mono text-sm leading-tight">
                     Current equipment can process only <strong className="font-bold">{fmt(currentCapacity)}kg</strong>. 
                     Missing capacity for <strong className="font-bold">{fmt(shortfallKg)}kg/day</strong>.
                   </span>
                </div>
             </div>
          )}
        </section>

        {/* Module 4: Process Cycle */}
        <section className="mb-12">
           <div className="flex items-center gap-2 mb-6">
             <Truck size={18} className="text-slate-400" />
             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Module 4: Technical Throughput / საწარმოო ციკლი</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center shadow-sm">
                 <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Washing</div>
                 <div className="font-mono font-bold text-xl text-slate-700">50 min</div>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center shadow-sm">
                 <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Drying</div>
                 <div className="font-mono font-bold text-xl text-slate-700">55 min</div>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center shadow-sm">
                 <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Ironing</div>
                 <div className="font-mono font-bold text-xl text-slate-700">30 min</div>
              </div>
              <div className={`p-6 rounded-xl border text-center shadow-md transition-all ${inputs.hasAutoFolder ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-900 text-white border-slate-800'}`}>
                 <div className="text-[10px] uppercase font-bold text-indigo-100 mb-1 tracking-widest">{inputs.hasAutoFolder ? 'Automated Folding' : 'Manual Folding'}</div>
                 <div className="font-mono font-bold text-xl text-emerald-400">{inputs.hasAutoFolder ? '5 min' : '20 min'}</div>
                 <div className="text-[8px] uppercase mt-2 font-bold tracking-widest opacity-80">{inputs.hasAutoFolder ? 'Automation Boost: +75%' : 'Standard Cycle'}</div>
              </div>
           </div>
        </section>

        {/* Summary Footer */}
        <div className={`fixed bottom-0 left-0 right-0 bg-slate-900 text-white p-6 shadow-2xl z-40 lg:ml-[260px] border-t border-slate-800 transition-all duration-300 ${aiExpanded ? 'pr-[320px]' : 'pr-12'}`}>
           <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex gap-12">
                 <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Daily Target</span>
                    <span className="text-2xl font-mono font-bold text-emerald-400">{fmt(dailyVolume)} <span className="text-sm font-normal text-slate-400">kg</span></span>
                 </div>
                 <div className="h-10 w-px bg-slate-800 hidden md:block"></div>
                 <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Current Machine Capacity</span>
                    <span className={`text-2xl font-mono font-bold ${isShortfall ? 'text-rose-500' : 'text-indigo-400'}`}>
                      {fmt(currentCapacity)} <span className="text-sm font-normal text-slate-400">kg</span>
                    </span>
                 </div>
              </div>
              <div className="text-center md:text-right">
                 <p className="text-xs text-slate-300 leading-relaxed font-medium">
                   Scale: <strong className="text-white">{inputs.hotelRooms}</strong> rooms @ <strong className="text-white">{weightPerRoomKg.toFixed(2)}kg</strong>/room.<br/> 
                   Status: <strong className={isShortfall ? 'text-rose-500 uppercase tracking-widest' : 'text-emerald-500 uppercase tracking-widest'}>{isShortfall ? 'Deficit' : 'Operational Readiness'}</strong>.
                 </p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
