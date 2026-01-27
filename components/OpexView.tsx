
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Info,
  ShieldCheck,
  RefreshCw,
  Table as TableIcon,
  TrendingUp,
  ChevronDown,
  Zap
} from 'lucide-react';
import { ScenarioType } from '../types';

// --- TYPES & CONSTANTS ---
interface OpexRow {
  id: string;
  name: string;
  category: string;
  plCategory: string;
  type: 'Variable' | 'Fixed';
  unit: string;
  quantity: number;
  unitCost: number;
  taxType: 'VAT' | 'Income Tax' | 'None';
}

const CATEGORIES = [
  'კომუნალური (Utilities)',
  'ხელფასი (Salary/Payroll)',
  'ტრანსპორტირება და შენახვა (Logistics)',
  'ადმინისტრაციული (Admin)',
  'მარკეტინგი (Marketing)',
  'მასალები (Materials)',
  'სხვა საოპერაციო (Other)'
];

const PL_CATEGORIES = [
  'COGS: ნედლეული და მასალები',
  'COGS: ელექტროენერგია',
  'COGS: ბუნებრივი აირი',
  'COGS: წყალი და კანალიზაცია',
  'COGS: საწარმოო პერსონალის ხელფასი',
  'SG&A: ადმინისტრაციული ხელფასი',
  'SG&A: საოფისე/ადმინისტრაციული',
  'SG&A: იჯარა',
  'SG&A: მარკეტინგი',
  'SG&A: ტრანსპორტირება/ლოგისტიკა',
  'SG&A: რემონტი და შენახვა',
  'სხვა საოპერაციო ხარჯი'
];

const TAX_TYPES = [
  { id: 'VAT', label: 'დღგ (VAT)' },
  { id: 'Income Tax', label: 'საშემოსავლო + პენსია' },
  { id: 'None', label: 'გადასახადის გარეშე' }
];

const formatNum = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const OpexView: React.FC<{ scenario: ScenarioType; onDataUpdate?: (data: string) => void }> = ({ scenario, onDataUpdate }) => {
  const [rows, setRows] = useState<OpexRow[]>(() => {
    const saved = localStorage.getItem('laundrometric_opex_table_rows_v3');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'v1', name: 'ბუნებრივი აირი (Dryers/Boiler)', category: 'კომუნალური (Utilities)', plCategory: 'COGS: ბუნებრივი აირი', type: 'Variable', unit: 'მ3/კგ', quantity: 0.22, unitCost: 1.15, taxType: 'VAT' },
      { id: 'v2', name: 'ელექტროენერგია (Washers/Motors)', category: 'კომუნალური (Utilities)', plCategory: 'COGS: ელექტროენერგია', type: 'Variable', unit: 'კვტ.სთ/კგ', quantity: 0.18, unitCost: 0.28, taxType: 'VAT' },
      { id: 'v3', name: 'წყალი და კანალიზაცია', category: 'კომუნალური (Utilities)', plCategory: 'COGS: წყალი და კანალიზაცია', type: 'Variable', unit: 'მ3/კგ', quantity: 0.012, unitCost: 4.50, taxType: 'VAT' },
      { id: 'v4', name: 'ქიმია (პროფესიული სარეცხი საშუალებები და დანამატები)', category: 'მასალები (Materials)', plCategory: 'COGS: ნედლეული და მასალები', type: 'Variable', unit: 'GEL/კგ', quantity: 1, unitCost: 0.35, taxType: 'VAT' },
      { id: 'v5', name: 'შეფუთვა (პოლიეთილენი)', category: 'მასალები (Materials)', plCategory: 'COGS: ნედლეული და მასალები', type: 'Variable', unit: 'GEL/კგ', quantity: 1, unitCost: 0.08, taxType: 'VAT' },
      { id: 'f1', name: 'მთავარი ოპერატორი (ცვლა)', category: 'ხელფასი (Salary/Payroll)', plCategory: 'COGS: საწარმოო პერსონალის ხელფასი', type: 'Fixed', unit: 'კაცი', quantity: 2, unitCost: 1400, taxType: 'Income Tax' },
      { id: 'f2', name: 'დამხმარე პერსონალი', category: 'ხელფასი (Salary/Payroll)', plCategory: 'COGS: საწარმოო პერსონალის ხელფასი', type: 'Fixed', unit: 'კაცი', quantity: 3, unitCost: 900, taxType: 'Income Tax' },
      { id: 'f3', name: 'ლოგისტიკის მენეჯერი/მძღოლი', category: 'ხელფასი (Salary/Payroll)', plCategory: 'SG&A: ადმინისტრაციული ხელფასი', type: 'Fixed', unit: 'კაცი', quantity: 1, unitCost: 1200, taxType: 'Income Tax' },
      { id: 'f4', name: 'საწვავი (ლოგისტიკა)', category: 'ტრანსპორტირება და შენახვა (Logistics)', plCategory: 'SG&A: ტრანსპორტირება/ლოგისტიკა', type: 'Fixed', unit: 'თვე/ჯამი', quantity: 1, unitCost: 800, taxType: 'VAT' },
      { id: 'f5', name: 'საწარმოო ფართის იჯარა', category: 'ადმინისტრაციული (Admin)', plCategory: 'SG&A: იჯარა', type: 'Fixed', unit: 'თვე', quantity: 1, unitCost: 2500, taxType: 'None' },
      { id: 'f6', name: 'მარკეტინგი და გაყიდვები', category: 'მარკეტინგი (Marketing)', plCategory: 'SG&A: მარკეტინგი', type: 'Fixed', unit: 'თვე', quantity: 1, unitCost: 500, taxType: 'VAT' },
    ];
  });

  const [monthlyVolume, setMonthlyVolume] = useState<number>(0);

  const refreshVolume = useCallback(() => {
    const savedInputs = localStorage.getItem('laundrometric_global_inputs');
    if (savedInputs) {
      const inputs = JSON.parse(savedInputs);
      const weightPerRoom = 4.5; 
      const vol = (inputs.hotelRooms || 100) * weightPerRoom * (inputs.utilizationRate || 0.8) * 30;
      setMonthlyVolume(vol || 1);
    }
  }, []);

  useEffect(() => {
    refreshVolume();
    window.addEventListener('storage', refreshVolume);
    return () => window.removeEventListener('storage', refreshVolume);
  }, [refreshVolume]);

  const getCalculatedRow = (row: OpexRow) => {
    let totalMonthlyCF = 0;
    if (row.type === 'Variable') {
      totalMonthlyCF = monthlyVolume * row.quantity * row.unitCost;
    } else {
      totalMonthlyCF = row.quantity * row.unitCost;
    }
    const costPerKg = totalMonthlyCF / monthlyVolume;
    let plAmount = totalMonthlyCF;
    if (row.taxType === 'Income Tax') {
      const gross = totalMonthlyCF / 0.784;
      plAmount = gross * 1.02;
    } else if (row.taxType === 'VAT') {
      plAmount = totalMonthlyCF / 1.18;
    }
    return { totalMonthlyCF, costPerKg, plAmount };
  };

  const totals = useMemo(() => {
    return rows.reduce((acc, row) => {
      const { totalMonthlyCF, costPerKg, plAmount } = getCalculatedRow(row);
      acc.cf += totalMonthlyCF;
      acc.pl += plAmount;
      acc.kg += costPerKg;
      return acc;
    }, { cf: 0, pl: 0, kg: 0 });
  }, [rows, monthlyVolume]);

  useEffect(() => {
    localStorage.setItem('laundrometric_opex_table_rows_v3', JSON.stringify(rows));
    if (onDataUpdate) {
      onDataUpdate(`OPEX P&L: ${formatNum(totals.pl)} GEL. Cash Flow: ${formatNum(totals.cf)} GEL. Unit Cost: ${totals.kg.toFixed(3)} GEL/kg. Vol: ${formatNum(monthlyVolume)} kg`);
    }
  }, [rows, totals, monthlyVolume, onDataUpdate]);

  const addRow = () => {
    const newRow: OpexRow = {
      id: Date.now().toString(),
      name: '',
      category: CATEGORIES[0],
      plCategory: PL_CATEGORIES[0],
      type: 'Variable',
      unit: '',
      quantity: 0,
      unitCost: 0,
      taxType: 'None'
    };
    setRows([...rows, newRow]);
  };

  const updateRow = (id: string, field: keyof OpexRow, value: any) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeRow = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in duration-500 pb-40">
      <section className="flex flex-col gap-6 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-3">
              <Calculator className="text-indigo-600" size={28} /> საოპერაციო ხარჯები (OPEX)
            </h2>
            <p className="text-sm text-slate-500 mt-1 uppercase tracking-wider font-semibold">სამრეწველო სამრეცხაოს ფინანსური მოდელი ({scenario})</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-600" />
              <span className="text-xs font-bold text-indigo-700 uppercase">მოცულობა: {formatNum(monthlyVolume)} კგ/თვე</span>
            </div>
            <button 
              onClick={refreshVolume}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <RefreshCw size={14} /> განახლება
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm border-b-4 border-b-indigo-500">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">თვიური CF (გადასახდელი)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-indigo-600 font-mono">{formatNum(totals.cf)}</span>
              <span className="text-slate-400 text-xs font-bold">GEL</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm border-b-4 border-b-emerald-500">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ჯამური P&L ხარჯი (IFRS)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600 font-mono">{formatNum(totals.pl)}</span>
              <span className="text-slate-400 text-xs font-bold">GEL</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm border-b-4 border-b-amber-500">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">თვითღირებულება 1 კგ-ზე</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-600 font-mono">{(totals.pl / monthlyVolume).toFixed(3)}</span>
              <span className="text-slate-400 text-xs font-bold">GEL / კგ</span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-white">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tax Integrity</span>
            </div>
            <p className="text-sm font-bold text-slate-300">Pension & Income Tax Included</p>
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden min-h-[450px]">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <TableIcon size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">ხარჯების დეტალური უწყისი</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">ცვლადი ხარჯები ავტომატურად ითვლება {formatNum(monthlyVolume)} კგ-ზე</p>
            </div>
          </div>
          <button 
            onClick={addRow}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase hover:bg-indigo-700 transition-all shadow-md"
          >
            <Plus size={14} /> ახალი მუხლის დამატება
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] table-fixed border-collapse">
            <thead className="bg-white shadow-sm border-b border-slate-200 text-[9px] text-slate-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-4 px-4 w-[16%]">დასახელება</th>
                <th className="py-4 px-2 w-[12%]">კატეგორია</th>
                <th className="py-4 px-2 w-[7%] text-center">ტიპი</th>
                <th className="py-4 px-2 w-[8%]">განზ. ერთ.</th>
                <th className="py-4 px-2 w-[8%] text-center">ნორმა/რაოდ.</th>
                <th className="py-4 px-2 w-[8%] text-center">ფასი ერთ. (CF)</th>
                <th className="py-4 px-2 w-[7%] text-center">1 კგ-ზე</th>
                <th className="py-4 px-2 w-[9%] text-center">ჯამი თვე (CF)</th>
                <th className="py-4 px-2 w-[8%] text-center">დაბეგვრა</th>
                <th className="py-4 px-2 w-[12%] text-center">P&L მუხლი</th>
                <th className="py-4 px-4 w-[10%] text-right">უწყისის თანხა</th>
                <th className="py-4 px-2 w-[4%]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => {
                const { totalMonthlyCF, costPerKg, plAmount } = getCalculatedRow(row);
                return (
                  <tr key={row.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <textarea 
                        value={row.name} 
                        onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                        rows={row.name.length > 30 ? 2 : 1}
                        className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none py-1 font-bold text-slate-800 resize-none leading-tight"
                        placeholder="ხარჯის სახელი"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <select 
                        value={row.category}
                        onChange={(e) => updateRow(row.id, 'category', e.target.value)}
                        className="w-full bg-slate-100/50 border border-slate-200 rounded px-1 py-1 font-bold text-slate-600 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer appearance-none text-[9px]"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button 
                        onClick={() => updateRow(row.id, 'type', row.type === 'Variable' ? 'Fixed' : 'Variable')}
                        className={`w-full text-center py-1 rounded text-[9px] font-black uppercase transition-colors ${row.type === 'Variable' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}
                      >
                        {row.type === 'Variable' ? 'ცვლადი' : 'ფიქსი'}
                      </button>
                    </td>
                    <td className="py-3 px-2">
                      <input 
                        value={row.unit} 
                        onChange={(e) => updateRow(row.id, 'unit', e.target.value)}
                        className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none py-1 text-slate-500 font-medium"
                      />
                    </td>
                    <td className="py-3 px-2 text-center">
                      <input 
                        type="number"
                        step="0.001"
                        value={row.quantity}
                        onChange={(e) => updateRow(row.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full text-center bg-white border border-slate-200 rounded py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm font-mono font-bold"
                      />
                    </td>
                    <td className="py-3 px-2 text-center">
                      <input 
                        type="number"
                        step="0.01"
                        value={row.unitCost}
                        onChange={(e) => updateRow(row.id, 'unitCost', parseFloat(e.target.value) || 0)}
                        className="w-full text-center bg-white border border-slate-200 rounded py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm font-mono font-bold text-slate-800"
                      />
                    </td>
                    <td className="py-3 px-2 text-center font-mono font-bold text-slate-400">
                      {costPerKg.toFixed(3)}
                    </td>
                    <td className="py-3 px-2 text-center font-mono font-bold text-slate-800 bg-slate-50/30">
                      {formatNum(totalMonthlyCF)}
                    </td>
                    <td className="py-3 px-2">
                      <select 
                        value={row.taxType}
                        onChange={(e) => updateRow(row.id, 'taxType', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded py-1 font-bold text-slate-600 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer appearance-none text-[8px] text-center"
                      >
                        {TAX_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-2">
                      <select 
                        value={row.plCategory}
                        onChange={(e) => updateRow(row.id, 'plCategory', e.target.value)}
                        className="w-full bg-emerald-50 border border-emerald-100 rounded px-1 py-1 font-bold text-emerald-700 focus:ring-1 focus:ring-emerald-500 outline-none cursor-pointer appearance-none text-[8px]"
                      >
                        {PL_CATEGORIES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600 bg-indigo-50/10">
                      {formatNum(plAmount)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button 
                        onClick={() => removeRow(row.id)} 
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-900 text-white font-bold sticky bottom-0 z-10">
              <tr>
                <td colSpan={6} className="py-5 px-6 text-right text-[10px] uppercase tracking-widest text-slate-400">ჯამური საოპერაციო ხარჯები:</td>
                <td className="py-5 px-2 text-center font-mono text-emerald-400 border-l border-slate-800">{totals.kg.toFixed(3)}</td>
                <td className="py-5 px-2 text-center font-mono text-indigo-400 border-x border-slate-800">{formatNum(totals.cf)}</td>
                <td colSpan={2} className="py-5 px-2"></td>
                <td className="py-5 px-4 text-right font-mono text-lg text-emerald-400">{formatNum(totals.pl)} GEL</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0 mb-12">
        <div className="bg-indigo-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="text-amber-400" />
              <h4 className="text-sm font-bold uppercase tracking-widest">დატვირთულობის ეფექტი</h4>
            </div>
            <p className="text-xs text-indigo-100 leading-relaxed mb-6">
              მოდელი ავტომატურად ანახლებს კომუნალურ ხარჯებს Industrial Capacity Modeler-ში მითითებული ოთახებისა და დატვირთვის მიხედვით. მოცულობის ზრდასთან ერთად, ფიქსირებული ხარჯების წილი 1 კგ-ზე იკლებს.
            </p>
            <div className="flex gap-8">
              <div>
                <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider">Fixed Ratio</span>
                <p className="text-xl font-mono font-bold text-white">{((1 - (totals.kg / (totals.cf/monthlyVolume || 1))) * 100).toFixed(0)}%</p>
              </div>
              <div>
                <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider">Breakeven Rate</span>
                <p className="text-xl font-mono font-bold text-emerald-400">{(totals.pl / monthlyVolume).toFixed(2)} GEL</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 flex flex-col justify-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest leading-none mb-1">საგადასახადო ლოგიკა</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Georgian Tax Compliance V2.1</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            პერსონალის ხარჯებში გათვალისწინებულია: <br/>
            1. <strong>საშემოსავლო გადასახადი (20%)</strong>. <br/>
            2. <strong>საპენსიო შენატანი (2% + 2%)</strong>. <br/>
            3. <strong>დღგ (18%)</strong> - P&L-ში აისახება Net (დღგ-ს გარეშე) სახით. <br/>
            4. <strong>P&L Mapping</strong> - თითოეული ხარჯი მიბმულია შესაბამის უწყისის მუხლს.
          </p>
        </div>
      </section>
    </div>
  );
};
