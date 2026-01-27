
import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Calculator, Calendar, Zap, AlertCircle } from 'lucide-react';
import { ScenarioType, FinancialInputs } from '../types';

interface GrowthMonth {
  month: number;
  rooms: number;
  kg: number;
  growthRate: number;
}

interface SalesGrowthViewProps {
  scenario: ScenarioType;
  inputs: FinancialInputs;
  onDataUpdate?: (data: string) => void;
  onInputChange?: (key: keyof FinancialInputs, value: any) => void;
}

export const SalesGrowthView: React.FC<SalesGrowthViewProps> = ({ scenario, inputs, onDataUpdate, onInputChange }) => {
  const weightPerRoomKg = useMemo(() => {
    return inputs.linenItems
      .filter(item => item.active)
      .reduce((acc, item) => acc + (item.weightG * item.qtyPerRoom / 1000), 0);
  }, [inputs]);

  const [months, setMonths] = useState<GrowthMonth[]>(() => {
    const saved = localStorage.getItem(`laundrometric_sales_growth_${scenario}`);
    if (saved) return JSON.parse(saved);

    const settings = JSON.parse(localStorage.getItem(`laundrometric_settings_${scenario}`) || '{}');
    const baseRooms = inputs.hotelRooms || 100;
    const flatGrowth = settings.monthlyGrowth || 5;
    
    const initial: GrowthMonth[] = [];
    let currentRooms = baseRooms;

    for (let i = 1; i <= 60; i++) {
      const kg = currentRooms * weightPerRoomKg * (inputs.utilizationRate || 0.8) * 30;
      initial.push({
        month: i,
        rooms: Math.round(currentRooms),
        kg: Math.round(kg),
        growthRate: i === 1 ? 0 : flatGrowth
      });
      currentRooms = currentRooms * (1 + flatGrowth / 100);
    }
    return initial;
  });

  // EFFECT 1: External SSoT Sync (e.g. from Capacity Planner / Module 2)
  // When inputs.hotelRooms changes, M1 must update and cascade.
  useEffect(() => {
    setMonths(prev => {
      const currentM1 = prev[0];
      if (Math.round(currentM1.rooms) !== Math.round(inputs.hotelRooms)) {
        const newMonths = [...prev];
        const newKg = Math.round(inputs.hotelRooms * weightPerRoomKg * (inputs.utilizationRate || 0.8) * 30);
        newMonths[0] = { ...currentM1, rooms: inputs.hotelRooms, kg: newKg };
        
        // Cascade the change to all future months based on existing growth rates
        for (let i = 1; i < newMonths.length; i++) {
          const prevRooms = newMonths[i - 1].rooms;
          const currentRate = newMonths[i].growthRate;
          const newRooms = Math.round(prevRooms * (1 + currentRate / 100));
          newMonths[i] = {
            ...newMonths[i],
            rooms: newRooms,
            kg: Math.round(newRooms * weightPerRoomKg * (inputs.utilizationRate || 0.8) * 30)
          };
        }
        return newMonths;
      }
      return prev;
    });
  }, [inputs.hotelRooms, inputs.utilizationRate, weightPerRoomKg]);

  // EFFECT 2: Sync to Settings & Storage
  useEffect(() => {
    const year1 = months.slice(0, 12);
    const validRates = year1.slice(1).map(m => m.growthRate);
    const avgGrowth = validRates.length > 0 ? validRates.reduce((a, b) => a + b, 0) / validRates.length : 0;

    const settings = JSON.parse(localStorage.getItem(`laundrometric_settings_${scenario}`) || '{}');
    if (Math.abs(settings.monthlyGrowth - avgGrowth) > 0.01) {
      settings.monthlyGrowth = parseFloat(avgGrowth.toFixed(2));
      localStorage.setItem(`laundrometric_settings_${scenario}`, JSON.stringify(settings));
    }

    localStorage.setItem(`laundrometric_sales_growth_${scenario}`, JSON.stringify(months));
    
    if (onDataUpdate) {
      onDataUpdate(`გაყიდვების ზრდა: წლიური საშუალო ზრდა ${avgGrowth.toFixed(2)}%. პიკური მოცულობა: ${months[59].kg.toLocaleString()} კგ/თვე.`);
    }
  }, [months, scenario, onDataUpdate]);

  const updateField = (index: number, field: keyof GrowthMonth, value: number) => {
    const newMonths = [...months];
    
    // Core Logic: Link Rooms and KG for the edited row
    if (field === 'rooms') {
      const newKg = Math.round(value * weightPerRoomKg * (inputs.utilizationRate || 0.8) * 30);
      newMonths[index] = { ...newMonths[index], rooms: value, kg: newKg };
      
      // SSoT Sync: If we change M1 rooms here, it MUST update the global 'hotelRooms' (Module 2)
      if (index === 0 && onInputChange) {
        onInputChange('hotelRooms', value);
      }
    } else if (field === 'kg') {
      const calculatedRooms = Math.round(value / (weightPerRoomKg * (inputs.utilizationRate || 0.8) * 30));
      newMonths[index] = { ...newMonths[index], kg: value, rooms: calculatedRooms };
      
      // SSoT Sync: If we change M1 KG, it calculates Rooms and updates global state
      if (index === 0 && onInputChange) {
        onInputChange('hotelRooms', calculatedRooms);
      }
    } else {
      newMonths[index] = { ...newMonths[index], [field]: value };
    }

    // Cascade effect for all future months if rooms, kg, or growth rates change
    if (field === 'growthRate' || field === 'rooms' || field === 'kg') {
      for (let i = index + 1; i < newMonths.length; i++) {
        const prevRooms = newMonths[i - 1].rooms;
        const currentRate = newMonths[i].growthRate;
        const newRooms = Math.round(prevRooms * (1 + currentRate / 100));
        const newKg = Math.round(newRooms * weightPerRoomKg * (inputs.utilizationRate || 0.8) * 30);
        newMonths[i] = {
          ...newMonths[i],
          rooms: newRooms,
          kg: newKg
        };
      }
    }

    setMonths(newMonths);
  };

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in duration-500 pb-40">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4 tracking-tighter">
            <Zap className="text-indigo-600" size={32} /> გაყიდვების ზრდა დეტალური
          </h2>
          <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-bold">Monthly Sales Projections & Granular Growth Overrides</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-6 py-3 flex items-center gap-3">
          <TrendingUp className="text-indigo-600" size={20} />
          <div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Year 1 Avg Growth</p>
            <p className="text-xl font-mono font-bold text-indigo-700 leading-none">
              {(months.slice(1, 12).reduce((a, b) => a + b.growthRate, 0) / 11).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 flex items-start gap-4">
        <AlertCircle className="text-amber-500 shrink-0 mt-1" />
        <p className="text-xs text-amber-800 leading-relaxed font-medium">
          <strong>ინსტრუქცია:</strong> პირველი თვის (M1) მონაცემები სინქრონიზებულია <strong>Capacity Planner</strong>-ის (Module 2) ოთახების რაოდენობასთან. ნებისმიერი კორექტირება აქ აისახება იქაც და პირიქით.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-black">
              <tr>
                <th className="py-5 px-8 w-32 border-r border-slate-800">Month / თვე</th>
                <th className="py-5 px-4 text-center border-r border-slate-800">Rooms / ოთახი</th>
                <th className="py-5 px-4 text-center border-r border-slate-800">Kg / კილოგრამი</th>
                <th className="py-5 px-4 text-center">Growth Rate / ზრდა (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {months.map((m, idx) => (
                <tr key={m.month} className={`hover:bg-slate-50 transition-colors ${idx % 12 === 0 ? 'bg-indigo-50/20' : ''}`}>
                  <td className="py-3 px-8 font-black text-slate-400 border-r border-slate-100">
                    M{m.month}
                    {idx % 12 === 0 && <span className="block text-[8px] text-indigo-400 font-black uppercase">Year {Math.floor(idx/12)+1} Start</span>}
                  </td>
                  <td className="py-2 px-4 border-r border-slate-100">
                    <input 
                      type="number" 
                      value={m.rooms}
                      onChange={(e) => updateField(idx, 'rooms', parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-center text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                    />
                  </td>
                  <td className="py-2 px-4 border-r border-slate-100">
                    <input 
                      type="number" 
                      value={m.kg}
                      onChange={(e) => updateField(idx, 'kg', parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-center text-indigo-600 font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                       <input 
                        type="number" 
                        step="0.1"
                        value={m.growthRate}
                        disabled={idx === 0}
                        onChange={(e) => updateField(idx, 'growthRate', parseFloat(e.target.value) || 0)}
                        className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-center font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm ${idx === 0 ? 'opacity-30 cursor-not-allowed' : 'text-emerald-600'}`}
                      />
                      <span className="text-[10px] font-black text-slate-300">%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
