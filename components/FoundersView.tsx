
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Wallet, PieChart, Percent } from 'lucide-react';
import { ScenarioType } from '../types';

interface Transaction {
  id: string;
  partner: string;
  amount: number;
  paidAmount?: number;
  currency: string;
  rate: number;
  month: string;
  year: string;
  liability?: number;
}

interface Founder {
  id: string;
  name: string;
  share: number;
  investments: Transaction[];
  dividends: Transaction[];
}

interface FoundersViewProps {
  scenario: ScenarioType;
  onDataUpdate?: (data: string) => void;
}

const MONTHS = [
  'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
  'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
];

const YEARS = Array.from({ length: 7 }, (_, i) => (2024 + i).toString());
const CURRENCIES = ['GEL', 'USD', 'EUR'];

const formatCurrency = (num: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num).replace(/\s/g, ' ');
};

export const FoundersView: React.FC<FoundersViewProps> = ({ scenario, onDataUpdate }) => {
  const [founders, setFounders] = useState<Founder[]>(() => {
    const saved = localStorage.getItem('laundrometric_founders_data');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: '1',
        name: 'პარტნიორი 1 - ძირითადი ინვესტორი',
        share: 100,
        investments: [
          { id: 'inv-1', partner: 'პარტნიორი 1', amount: 10000, currency: 'USD', rate: 2.65, month: 'იანვარი', year: '2024', liability: 0 }
        ],
        dividends: []
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('laundrometric_founders_data', JSON.stringify(founders));
    if (onDataUpdate) {
      const summary = founders.map(f => {
        const totalInv = f.investments.reduce((s, i) => s + (i.amount * i.rate), 0);
        const totalDiv = f.dividends.reduce((s, d) => s + ((d.paidAmount || 0) * d.rate), 0);
        return `პარტნიორი: ${f.name}, წილი: ${f.share}%, ჯამური ინვესტიცია: ${totalInv} GEL.`;
      }).join('\n');
      onDataUpdate(summary);
    }
  }, [founders, onDataUpdate]);

  const addFounder = () => {
    const newFounder: Founder = {
      id: Date.now().toString(),
      name: `ახალი პარტნიორი`,
      share: 0,
      investments: [],
      dividends: []
    };
    setFounders([...founders, newFounder]);
  };

  const updateFounderField = (id: string, field: keyof Founder, value: any) => {
    setFounders(founders.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const addTransaction = (founderId: string, type: 'investments' | 'dividends') => {
    const founder = founders.find(f => f.id === founderId);
    if (!founder) return;
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      partner: founder.name,
      amount: 0,
      currency: 'GEL',
      rate: 1,
      month: 'იანვარი',
      year: '2024',
      ...(type === 'investments' ? { liability: 0 } : { paidAmount: 0 })
    };
    setFounders(founders.map(f => f.id === founderId ? { ...f, [type]: [...f[type], newTx] } : f));
  };

  const updateTransaction = (founderId: string, type: 'investments' | 'dividends', txId: string, field: keyof Transaction, value: any) => {
    setFounders(founders.map(f => {
      if (f.id === founderId) {
        return {
          ...f,
          [type]: f[type].map(tx => tx.id === txId ? { ...tx, [field]: value } : tx)
        };
      }
      return f;
    }));
  };

  const removeTransaction = (founderId: string, type: 'investments' | 'dividends', txId: string) => {
    setFounders(founders.map(f => f.id === founderId ? { ...f, [type]: f[type].filter(tx => tx.id !== txId) } : f));
  };

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in duration-500 pb-40">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">დამფუძნებლები & ინვესტიციები</h2>
          <p className="text-sm text-slate-500 mt-1">პარტნიორების კაპიტალისა და დივიდენდების მართვა ({scenario})</p>
        </div>
        <button 
          onClick={addFounder}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm"
        >
          <Plus size={16} />
          დამფუძნებლის დამატება
        </button>
      </div>

      {founders.map((founder) => (
        <div key={founder.id} className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <textarea 
                value={founder.name}
                onChange={(e) => updateFounderField(founder.id, 'name', e.target.value)}
                rows={founder.name.length > 30 ? 2 : 1}
                className="bg-white border border-slate-200 font-bold text-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md px-3 py-1 w-full max-w-[400px] shadow-sm resize-none leading-tight"
                placeholder="პარტნიორის სახელი"
              />
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md px-3 py-1 shadow-sm shrink-0">
                <Percent size={14} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">წილი:</span>
                <input 
                  type="number"
                  value={founder.share}
                  onChange={(e) => updateFounderField(founder.id, 'share', parseFloat(e.target.value) || 0)}
                  className="w-12 text-sm font-bold text-slate-700 bg-transparent focus:outline-none text-center"
                />
                <span className="text-sm font-bold text-slate-700">%</span>
              </div>
            </div>
            
            <div className="flex gap-8 ml-4 shrink-0">
               <div className="text-right">
                 <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">ჯამური ინვესტიცია (GEL)</p>
                 <p className="text-base font-bold text-indigo-600">
                   {formatCurrency(founder.investments.reduce((sum, inv) => sum + (inv.amount * inv.rate), 0))}
                 </p>
               </div>
               <div className="text-right">
                 <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">ჯამური დივიდენდი (GEL)</p>
                 <p className="text-base font-bold text-emerald-600">
                   {formatCurrency(founder.dividends.reduce((sum, div) => sum + ((div.paidAmount || 0) * div.rate), 0))}
                 </p>
               </div>
            </div>
          </div>

          <div className="p-6 space-y-12">
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                  <Wallet size={18} className="text-indigo-500" />
                  განხორციელებული ინვესტიციები
                </div>
                <button 
                  onClick={() => addTransaction(founder.id, 'investments')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  + ჩანაწერის დამატება
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-separate border-spacing-y-1 table-fixed min-w-[900px]">
                  <thead>
                    <tr className="text-slate-400 font-medium">
                      <th className="py-2 px-2 text-[10px] uppercase font-bold tracking-wider w-[20%]">პარტნიორი</th>
                      <th className="py-2 px-2 text-[10px] uppercase font-bold tracking-wider w-[12%]">ინვესტიცია</th>
                      <th className="py-2 px-2 w-[10%] text-center text-[10px] uppercase font-bold tracking-wider">ვალუტა</th>
                      <th className="py-2 px-2 w-[10%] text-[10px] uppercase font-bold tracking-wider">კურსი</th>
                      <th className="py-2 px-2 text-[10px] uppercase font-bold tracking-wider w-[12%]">ექვივალენტი</th>
                      <th className="py-2 px-2 w-[12%] text-[10px] uppercase font-bold tracking-wider">თვე</th>
                      <th className="py-2 px-2 w-[10%] text-[10px] uppercase font-bold tracking-wider">წელი</th>
                      <th className="py-2 px-2 text-[10px] uppercase font-bold tracking-wider w-[12%]">ვალდებულება</th>
                      <th className="py-2 px-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {founder.investments.map((inv) => (
                      <tr key={inv.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-1 px-1">
                          <textarea 
                            value={inv.partner} 
                            onChange={(e) => updateTransaction(founder.id, 'investments', inv.id, 'partner', e.target.value)}
                            rows={inv.partner.length > 30 ? 2 : 1}
                            className="w-full bg-white border border-slate-200 focus:ring-1 focus:ring-indigo-300 focus:outline-none p-1.5 rounded text-sm text-[#1A1A1A] resize-none leading-tight"
                          />
                        </td>
                        {/* ... rest of the columns ... */}
                        <td className="py-1 px-1"><input type="number" value={inv.amount} onChange={(e) => updateTransaction(founder.id, 'investments', inv.id, 'amount', parseFloat(e.target.value) || 0)} className="w-full border border-slate-200 p-1.5 rounded text-sm" /></td>
                        <td className="py-1 px-1"><select value={inv.currency} onChange={(e) => updateTransaction(founder.id, 'investments', inv.id, 'currency', e.target.value)} className="w-full border border-slate-200 p-1.5 rounded text-sm">{CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}</select></td>
                        <td className="py-1 px-1"><input type="number" step="0.0001" value={inv.rate} onChange={(e) => updateTransaction(founder.id, 'investments', inv.id, 'rate', parseFloat(e.target.value) || 0)} className="w-full border border-slate-200 p-1.5 rounded text-sm" /></td>
                        <td className="py-1 px-2 font-bold text-sm">{formatCurrency(inv.amount * inv.rate)}</td>
                        <td className="py-1 px-1"><select value={inv.month} onChange={(e) => updateTransaction(founder.id, 'investments', inv.id, 'month', e.target.value)} className="w-full border border-slate-200 p-1.5 rounded text-sm">{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select></td>
                        <td className="py-1 px-1"><select value={inv.year} onChange={(e) => updateTransaction(founder.id, 'investments', inv.id, 'year', e.target.value)} className="w-full border border-slate-200 p-1.5 rounded text-sm">{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select></td>
                        <td className="py-1 px-1"><input type="number" value={inv.liability} onChange={(e) => updateTransaction(founder.id, 'investments', inv.id, 'liability', parseFloat(e.target.value) || 0)} className="w-full border border-slate-200 p-1.5 rounded text-sm text-amber-600 font-bold" /></td>
                        <td className="py-1 px-2 opacity-0 group-hover:opacity-100"><button onClick={() => removeTransaction(founder.id, 'investments', inv.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            {/* ... dividends section similar updates ... */}
          </div>
        </div>
      ))}
    </div>
  );
};
