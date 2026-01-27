
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, HardHat, BarChart3, Calculator, Info, Link2 } from 'lucide-react';
import { ScenarioType, FinancialInputs } from '../types';

interface CapexItem {
  id: string;
  name: string;
  category: string;
  qty: number;
  unitCostNet: number;
  vatRate: number; // e.g. 0.18
  depreciationMonths: number;
  isPlannerLinked?: boolean;
  // Computed fields
  totalNet: number;
  totalGross: number;
  monthlyDepreciation: number;
}

interface CapexViewProps {
  scenario: ScenarioType;
  inputs: FinancialInputs;
  onDataUpdate?: (data: string) => void;
}

const CATEGORIES = ['Machinery', 'Vehicle', 'Real Estate', 'IT & Software', 'Furniture', 'Other'];

// Market Estimate Prices for Automatic Sync (GEL)
const MARKET_PRICES: Record<string, number> = {
  'planner-washer': 18500,
  'planner-dryer': 9200,
  'planner-calender': 28000,
  'planner-folder': 42000
};

export const CapexView: React.FC<CapexViewProps> = ({ scenario, inputs, onDataUpdate }) => {
  const [items, setItems] = useState<CapexItem[]>(() => {
    const saved = localStorage.getItem('laundrometric_capex_data');
    return saved ? JSON.parse(saved) : [];
  });

  // Calculate Required Gaps from Planner Logic
  const plannerItems = useMemo(() => {
    const weightPerRoomKg = inputs.linenItems
      .filter(item => item.active)
      .reduce((acc, item) => acc + (item.weightG * item.qtyPerRoom / 1000), 0);
    
    const dailyVolume = inputs.hotelRooms * weightPerRoomKg * inputs.utilizationRate;
    const capacityPerWasherPerShift = 9; // 30kg units
    const cyclesNeeded = dailyVolume / 30;
    
    const reqWashers = Math.max(1, Math.ceil(cyclesNeeded / (capacityPerWasherPerShift * inputs.shiftsCount)));
    const reqDryers = Math.ceil(reqWashers * 1.3);
    const reqCalendars = Math.ceil(reqWashers / 3);

    const list = [
      { id: 'planner-washer', name: 'Industrial Washing Machine (30kg) - Req. from Plan', qty: Math.max(0, reqWashers - inputs.ownedWashers) },
      { id: 'planner-dryer', name: 'Industrial Drying Machine (30kg) - Req. from Plan', qty: Math.max(0, reqDryers - inputs.ownedDryers) },
      { id: 'planner-calender', name: 'Ironing Calender (Industrial) - Req. from Plan', qty: Math.max(0, reqCalendars - inputs.ownedCalendars) },
    ];

    // Add Automatic Folder if checked in Planner
    if (inputs.hasAutoFolder) {
      list.push({ id: 'planner-folder', name: 'Automatic Linen Folder (Efficiency Protocol) - Req. from Plan', qty: 1 });
    }

    return list.filter(item => item.qty > 0);
  }, [inputs]);

  // Sync Planner Items with State
  useEffect(() => {
    setItems(prevItems => {
      // 1. Keep manual items
      const manualItems = prevItems.filter(i => !i.isPlannerLinked);
      
      // 2. Map planner items to CapexItem structure, preserving prices if they existed
      const newPlannerItems: CapexItem[] = plannerItems.map(pi => {
        const existing = prevItems.find(i => i.id === pi.id);
        return {
          id: pi.id,
          name: pi.name,
          category: 'Machinery',
          qty: pi.qty,
          unitCostNet: existing ? existing.unitCostNet : (MARKET_PRICES[pi.id] || 0),
          vatRate: existing?.vatRate || 0.18,
          depreciationMonths: existing?.depreciationMonths || 60,
          isPlannerLinked: true,
          totalNet: 0,
          totalGross: 0,
          monthlyDepreciation: 0
        };
      });

      return [...newPlannerItems, ...manualItems];
    });
  }, [plannerItems]);

  // Handle Calculations & Persistence
  useEffect(() => {
    const updatedItems = items.map(item => {
      const totalNet = item.qty * item.unitCostNet;
      const totalGross = totalNet * (1 + item.vatRate);
      const monthlyDepreciation = item.depreciationMonths > 0 ? totalNet / item.depreciationMonths : 0;
      return { ...item, totalNet, totalGross, monthlyDepreciation };
    });

    if (JSON.stringify(updatedItems) !== JSON.stringify(items)) {
      setItems(updatedItems);
    }

    localStorage.setItem('laundrometric_capex_data', JSON.stringify(updatedItems));

    if (onDataUpdate) {
      const totalInv = updatedItems.reduce((sum, i) => sum + i.totalNet, 0);
      const totalDepr = updatedItems.reduce((sum, i) => sum + i.monthlyDepreciation, 0);
      onDataUpdate(`Total CAPEX (Net): ${totalInv.toFixed(0)} GEL, Monthly Depreciation: ${totalDepr.toFixed(0)} GEL, Sync Items: ${plannerItems.length}`);
    }
  }, [items, onDataUpdate, plannerItems.length]);

  const addItem = () => {
    const newItem: CapexItem = {
      id: Date.now().toString(),
      name: 'New Asset Item',
      category: 'Machinery',
      qty: 1,
      unitCostNet: 0,
      vatRate: 0.18,
      depreciationMonths: 60,
      totalNet: 0,
      totalGross: 0,
      monthlyDepreciation: 0,
      isPlannerLinked: false
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof CapexItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const removeItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item?.isPlannerLinked) return; // Cannot delete synced items
    setItems(items.filter(i => i.id !== id));
  };

  const formatNum = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500 pb-40">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-3">
            <HardHat className="text-indigo-600" size={28} /> Capital Expenditure (CAPEX)
          </h2>
          <p className="text-sm text-slate-500 mt-1 uppercase tracking-tight font-medium">Asset acquisition & investment tracking ({scenario})</p>
        </div>
        <button 
          onClick={addItem}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-md"
        >
          <Plus size={16} />
          Add Manual Asset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Net Investment</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-600 font-mono">
              {formatNum(items.reduce((sum, i) => sum + i.totalNet, 0))}
            </span>
            <span className="text-slate-400 text-xs font-bold uppercase">GEL</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-b-4 border-b-rose-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly P&L (Depr.)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 font-mono">
              {formatNum(items.reduce((sum, i) => sum + i.monthlyDepreciation, 0))}
            </span>
            <span className="text-slate-400 text-xs font-bold uppercase">GEL</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm col-span-2 flex items-center gap-4 bg-indigo-50/40">
          <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
             <Link2 size={24} />
          </div>
          <div>
             <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Single Source of Truth (SSoT)</p>
             <p className="text-xs text-slate-600 leading-tight mt-1">
               <strong>Capacity Planner</strong>-ის დანადგარების დეფიციტი და არჩეული ავტომატიზაცია ავტომატურად აისახება ამ სიაში.
             </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden mb-8">
        <table className="w-full text-left text-[11px] table-fixed border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-[9px] text-slate-500 uppercase font-bold tracking-wider">
            <tr>
              <th className="py-4 px-4 w-[25%]">Asset Item / დასახელება</th>
              <th className="py-4 px-2 w-[12%]">Category</th>
              <th className="py-4 px-2 text-center w-[6%]">Qty</th>
              <th className="py-4 px-2 text-center w-[12%]">Cost/Unit (Net)</th>
              <th className="py-4 px-2 text-center w-[6%]">VAT</th>
              <th className="py-4 px-2 text-right w-[10%]">Net Total</th>
              <th className="py-4 px-2 text-right w-[10%]">Gross Total</th>
              <th className="py-4 px-2 text-center w-[6%]">Life (mo)</th>
              <th className="py-4 px-4 text-right w-[10%]">Mo. Depr.</th>
              <th className="py-4 px-2 w-[3%]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className={`group hover:bg-slate-50/50 transition-colors ${item.isPlannerLinked ? 'bg-indigo-50/10' : ''}`}>
                <td className="py-3 px-4">
                  <div className="flex items-start gap-2">
                    {item.isPlannerLinked && <Link2 size={12} className="text-indigo-500 shrink-0 mt-1" />}
                    <textarea 
                      value={item.name}
                      readOnly={item.isPlannerLinked}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      rows={item.name.length > 30 ? 2 : 1}
                      className={`w-full bg-transparent border-b border-transparent ${!item.isPlannerLinked && 'hover:border-slate-200'} focus:border-indigo-500 focus:outline-none py-1 font-semibold text-slate-800 resize-none leading-tight text-xs`}
                    />
                  </div>
                </td>
                <td className="py-3 px-2">
                  <select 
                    value={item.category}
                    disabled={item.isPlannerLinked}
                    onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer h-8 disabled:opacity-70"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </td>
                <td className="py-3 px-2 text-center">
                  <input 
                    type="number"
                    value={item.qty}
                    readOnly={item.isPlannerLinked}
                    onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                    className={`w-full text-center bg-white border border-slate-200 rounded py-1 px-1 font-mono text-[10px] focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm h-8 ${item.isPlannerLinked ? 'bg-indigo-100/30 text-indigo-700 cursor-not-allowed border-indigo-200' : ''}`}
                  />
                </td>
                <td className="py-3 px-2 text-center">
                   <input 
                    type="number"
                    value={item.unitCostNet}
                    onChange={(e) => updateItem(item.id, 'unitCostNet', parseFloat(e.target.value) || 0)}
                    className="w-full text-center bg-white border border-slate-200 rounded py-1 px-1 font-mono text-[10px] focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm h-8"
                  />
                </td>
                <td className="py-3 px-2 text-center">
                   <input 
                    type="number"
                    step="0.01"
                    value={item.vatRate * 100}
                    onChange={(e) => updateItem(item.id, 'vatRate', (parseFloat(e.target.value) || 0) / 100)}
                    className="w-full text-center bg-white border border-slate-200 rounded py-1 px-1 font-mono text-[10px] focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm h-8"
                  />
                </td>
                <td className="py-3 px-2 text-right font-mono font-bold text-slate-600 pt-5">
                  {formatNum(item.totalNet)}
                </td>
                <td className="py-3 px-2 text-right font-mono font-bold text-slate-800 pt-5">
                  {formatNum(item.totalGross)}
                </td>
                <td className="py-3 px-2 text-center">
                   <input 
                    type="number"
                    value={item.depreciationMonths}
                    onChange={(e) => updateItem(item.id, 'depreciationMonths', parseInt(e.target.value) || 0)}
                    className="w-full text-center bg-white border border-slate-200 rounded py-1 px-1 font-mono text-[10px] focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm h-8"
                  />
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 pt-5">
                  {formatNum(item.monthlyDepreciation)}
                </td>
                <td className="py-3 px-2 text-center pt-5">
                  {!item.isPlannerLinked && (
                    <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-900 text-white font-bold sticky bottom-0">
            <tr>
              <td colSpan={5} className="py-5 px-4 text-right text-[9px] uppercase tracking-widest opacity-80 border-r border-slate-800">ჯამური კაპექსი (Consolidated Totals):</td>
              <td className="py-5 px-2 text-right font-mono text-[11px] border-r border-slate-800 text-emerald-400">
                {formatNum(items.reduce((sum, i) => sum + i.totalNet, 0))}
              </td>
              <td className="py-5 px-2 text-right font-mono text-[11px] border-r border-slate-800">
                {formatNum(items.reduce((sum, i) => sum + i.totalGross, 0))}
              </td>
              <td className="py-5 px-2 border-r border-slate-800"></td>
              <td className="py-5 px-4 text-right font-mono text-[11px] text-emerald-400">
                {formatNum(items.reduce((sum, i) => sum + i.monthlyDepreciation, 0))}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 shrink-0">
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Calculator size={14} className="text-indigo-500" /> Investment Reconciliation
          </h4>
          <div className="space-y-3">
             <div className="flex justify-between text-xs">
               <span className="text-slate-500">Gross Initial Cash Outflow (VAT Inc.)</span>
               <span className="font-mono font-bold text-slate-800">{formatNum(items.reduce((sum, i) => sum + i.totalGross, 0))} GEL</span>
             </div>
             <div className="flex justify-between text-xs">
               <span className="text-slate-500">Input VAT Recoverable</span>
               <span className="font-mono font-bold text-emerald-600">-{formatNum(items.reduce((sum, i) => sum + (i.totalGross - i.totalNet), 0))} GEL</span>
             </div>
             <div className="h-px bg-slate-100 my-2"></div>
             <div className="flex justify-between text-sm">
               <span className="font-bold text-slate-800 uppercase tracking-tight">Net Balance Sheet Asset Value</span>
               <span className="font-mono font-bold text-indigo-600">{formatNum(items.reduce((sum, i) => sum + i.totalNet, 0))} GEL</span>
             </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
              <Info size={20} />
            </div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Accounting Note</h4>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed italic">
            "Machinery and equipment are stated at cost less accumulated depreciation. Depreciation is calculated using the straight-line method. Items linked to the Capacity Planner cannot be manually deleted or modified in quantity; change those in the Planner module instead. Automatic Folder sync is now fully integrated."
          </p>
        </div>
      </div>
    </div>
  );
};
