
import React, { useState } from 'react';
import { useFinancialEngine, MonthlyData } from '../hooks/useFinancialEngine';
import { ScenarioType, ViewID } from '../types';
import { 
  FileText, Landmark, Wallet, AlertCircle, CheckCircle2, 
  ArrowDownRight, ArrowUpRight, TrendingUp, Layers, Coins,
  Plus, Minus, ArrowRightLeft, Briefcase, Activity
} from 'lucide-react';

interface Props {
  viewId: ViewID;
  scenario: ScenarioType;
}

const format = (n: number) => new Intl.NumberFormat('ka-GE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
const formatSigned = (n: number) => {
  const f = Math.abs(n).toLocaleString('ka-GE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return n < 0 ? `(${f})` : f;
};

export const FinancialStatementsView: React.FC<Props> = ({ viewId, scenario }) => {
  const data = useFinancialEngine(scenario);
  const [year, setYear] = useState(1);

  const filteredData = data.slice((year - 1) * 12, year * 12);
  const lastM = filteredData[filteredData.length - 1];

  // Logic to calculate delta for Cash Flow rows that aren't stored as deltas in MonthlyData
  const getPrevMonth = (m: number) => (m > 1 ? data[m - 2] : null);

  const allCogsKeys = Array.from(new Set(data.flatMap(m => Object.keys(m.cogsLines)))).sort();
  const allExpenseKeys = Array.from(new Set(data.flatMap(m => Object.keys(m.expensesLines)))).sort();

  const renderPL = () => (
    <div className="overflow-x-auto bg-white rounded-3xl shadow-2xl border border-slate-200 animate-in fade-in duration-500">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-black">
          <tr>
            <th className="py-6 px-8 w-80 border-r border-slate-800 sticky left-0 bg-slate-900 z-10">Profit & Loss Detailed (GEL)</th>
            {filteredData.map(m => <th key={m.month} className="py-6 px-2 text-center border-r border-slate-800 last:border-0 min-w-[80px]">M{m.month}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
          <tr className="font-black bg-indigo-50/60 text-indigo-900 border-b-2 border-indigo-100">
            <td className="py-5 px-8 uppercase text-xs sticky left-0 bg-indigo-50/60 z-10">Total Revenue (Net) / ამონაგები</td>
            {filteredData.map(m => <td key={m.month} className="text-center text-sm">{format(m.revenue)}</td>)}
          </tr>
          
          <tr className="bg-slate-50"><td colSpan={14} className="py-3 px-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] sticky left-0 bg-slate-50 z-10">Direct Costs (COGS) / პირდაპირი ხარჯები</td></tr>
          {allCogsKeys.map(key => (
            <tr key={key} className="hover:bg-slate-50/50">
              <td className="py-2.5 px-8 pl-12 text-slate-600 font-medium italic sticky left-0 bg-white z-10 group-hover:bg-slate-50/50">{key.replace('COGS: ', '')}</td>
              {filteredData.map(m => <td key={m.month} className="text-center text-slate-500">({format(m.cogsLines[key] || 0)})</td>)}
            </tr>
          ))}

          <tr className="font-bold border-t border-slate-200 bg-slate-100/30">
            <td className="py-4 px-8 text-slate-800 uppercase text-[10px] sticky left-0 bg-slate-100/30 z-10">Total Cost of Goods Sold</td>
            {filteredData.map(m => <td key={m.month} className="text-center text-rose-600 font-black">({format(m.cogsTotal)})</td>)}
          </tr>
          
          <tr className="font-black bg-emerald-50 text-emerald-800 border-y-2 border-emerald-100">
            <td className="py-5 px-8 text-xs uppercase sticky left-0 bg-emerald-50 z-10">GROSS PROFIT / საერთო მოგება</td>
            {filteredData.map(m => <td key={m.month} className="text-center text-sm">{format(m.grossProfit)}</td>)}
          </tr>
          <tr className="bg-emerald-100/20 text-[10px] text-emerald-600 font-black italic">
            <td className="py-2 px-8 sticky left-0 bg-emerald-100/20 z-10">Gross Margin (%)</td>
            {filteredData.map(m => <td key={m.month} className="text-center">{m.grossMargin.toFixed(1)}%</td>)}
          </tr>

          <tr className="bg-slate-50"><td colSpan={14} className="py-3 px-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] sticky left-0 bg-slate-50 z-10">Operating Expenses (SG&A) / საოპერაციო ხარჯები</td></tr>
          {allExpenseKeys.map(key => (
            <tr key={key} className="hover:bg-slate-50/50">
              <td className="py-2.5 px-8 pl-12 text-slate-600 font-medium italic sticky left-0 bg-white z-10 group-hover:bg-slate-50/50">{key.replace('SG&A: ', '')}</td>
              {filteredData.map(m => <td key={m.month} className="text-center text-slate-500">({format(m.expensesLines[key] || 0)})</td>)}
            </tr>
          ))}
          
          <tr className="font-bold border-t border-slate-200 bg-slate-100/50">
            <td className="py-4 px-8 text-slate-700 uppercase text-[10px] sticky left-0 bg-slate-100/50 z-10">Total SG&A Expenses</td>
            {filteredData.map(m => <td key={m.month} className="text-center text-slate-700">({format(m.expensesTotal)})</td>)}
          </tr>

          <tr className="font-black bg-indigo-900 text-white border-y border-indigo-500">
            <td className="py-5 px-8 uppercase text-xs tracking-tighter sticky left-0 bg-indigo-900 z-10">Operating Result (EBIT) / საოპერაციო მოგება</td>
            {filteredData.map(m => <td key={m.month} className="text-center text-sm text-indigo-100">{format(m.operatingResult)}</td>)}
          </tr>

          <tr className="font-black bg-amber-50 text-amber-900">
            <td className="py-4 px-8 uppercase sticky left-0 bg-amber-50 z-10">EBITDA</td>
            {filteredData.map(m => <td key={m.month} className="text-center font-black">{format(m.ebitda)}</td>)}
          </tr>
          
          <tr>
            <td className="py-3 px-8 text-rose-500 font-bold uppercase text-[10px] sticky left-0 bg-white z-10">Depreciation & Amortization (D&A) / ცვეთა</td>
            {filteredData.map(m => <td key={m.month} className="text-center text-rose-400 italic">({format(m.depreciation)})</td>)}
          </tr>

          <tr className="font-black text-white bg-slate-900 border-t-4 border-indigo-600 shadow-inner">
            <td className="py-7 px-8 uppercase text-sm tracking-[0.2em] sticky left-0 bg-slate-900 z-10">Net Profit / წმინდა მოგება</td>
            {filteredData.map(m => <td key={m.month} className="text-center text-lg text-emerald-400 font-mono tracking-tighter">{format(m.netProfit)}</td>)}
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderBS = () => (
    <div className="flex flex-col gap-12 animate-in fade-in zoom-in duration-500 pb-20">
      
      {/* SECTION 1: ASSETS */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-4">
           <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
             <Landmark size={20} />
           </div>
           <div>
             <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">აქტივები (Assets)</h3>
             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mt-1">Ordered by Liquidity Rank</p>
           </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
           <div className="p-10 flex flex-col justify-center bg-gradient-to-br from-indigo-50/30 to-transparent">
              <span className="text-[10px] font-black text-indigo-400 uppercase mb-3 tracking-[0.2em]">1. Cash & Equivalents</span>
              <span className="font-mono font-black text-3xl text-indigo-700 tracking-tighter">{format(lastM.cash)}</span>
              <span className="text-[9px] text-slate-400 font-bold mt-2 uppercase flex items-center gap-1"><Coins size={10} /> Most Liquid Asset</span>
           </div>
           <div className="p-10 flex flex-col justify-center">
              <span className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[0.2em]">2. Receivables & Tax</span>
              <span className="font-mono font-black text-3xl text-slate-800 tracking-tighter">{format(lastM.ar + (lastM.vatReceivable || 0))}</span>
              <span className="text-[9px] text-slate-400 font-bold mt-2 uppercase">Trade AR & VAT Credit</span>
           </div>
           <div className="p-10 flex flex-col justify-center">
              <span className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[0.2em]">3. Inventory (Stock)</span>
              <span className="font-mono font-black text-3xl text-slate-800 tracking-tighter">{format(lastM.inventory)}</span>
              <span className="text-[9px] text-slate-400 font-bold mt-2 uppercase">Materials & Supplies</span>
           </div>
           <div className="p-10 flex flex-col justify-center bg-slate-50/50">
              <span className="text-[10px] font-black text-rose-400 uppercase mb-3 tracking-[0.2em]">4. Fixed Assets (Net PPE)</span>
              <span className="font-mono font-black text-3xl text-rose-600 tracking-tighter">{format(lastM.ppeNet)}</span>
              <span className="text-[9px] text-slate-400 font-bold mt-2 uppercase flex items-center gap-1"><Layers size={10} /> Machinery & Fleet</span>
           </div>
        </div>
        <div className="px-10 py-7 bg-indigo-700 text-white rounded-[2.5rem] flex justify-between items-center font-black text-3xl shadow-2xl border-b-8 border-indigo-900">
           <span className="uppercase tracking-tighter">TOTAL ASSETS / ჯამური აქტივები</span>
           <span className="font-mono tracking-tighter">{format(lastM.assets)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* SECTION 2: EQUITY */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">კაპიტალი (Equity)</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mt-1">Founders & Retained Profits</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl divide-y divide-slate-100">
            <div className="p-8 flex justify-between items-center">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Contributed Capital</span>
              <span className="font-mono font-black text-xl text-slate-800 tracking-tighter">{format(lastM.equityContributed)}</span>
            </div>
            <div className="p-8 flex justify-between items-center bg-emerald-50/20">
              <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">Retained Earnings</span>
              <span className="font-mono font-black text-xl text-emerald-600 tracking-tighter">{format(lastM.retainedEarnings)}</span>
            </div>
            <div className="p-8 bg-emerald-600 text-white flex justify-between items-center rounded-b-[2.5rem]">
               <span className="font-black uppercase tracking-tighter">Total Equity</span>
               <span className="font-mono font-black text-2xl tracking-tighter">{format(lastM.equityTotal)}</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: LIABILITIES */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-4">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Wallet size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">ვალდებულებები (Liabilities)</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mt-1">Obligations & Payables</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl divide-y divide-slate-100">
            <div className="p-8 flex justify-between items-center">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Accounts Payable (AP)</span>
              <span className="font-mono font-black text-xl text-slate-800 tracking-tighter">{format(lastM.ap)}</span>
            </div>
            <div className="p-8 flex justify-between items-center bg-rose-50/10">
              <span className="text-[11px] font-black text-rose-400 uppercase tracking-widest">VAT & Tax Liability</span>
              <span className="font-mono font-black text-xl text-rose-600 tracking-tighter">{format(lastM.vatLiability)}</span>
            </div>
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center rounded-b-[2.5rem]">
               <span className="font-black uppercase tracking-tighter">Total Liabilities</span>
               <span className="font-mono font-black text-2xl tracking-tighter">{format(lastM.liabilitiesTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* INTEGRITY CHECK */}
      <div className={`p-10 rounded-[3.5rem] font-black flex items-center justify-between gap-10 text-xl border-4 transition-all duration-500 ${lastM.isBalanced ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-lg' : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'}`}>
        <div className="flex items-center gap-6">
          <div className={`p-3 rounded-2xl ${lastM.isBalanced ? 'bg-emerald-100' : 'bg-rose-100'}`}>
            {lastM.isBalanced ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />} 
          </div>
          <div className="flex flex-col">
             <span className="text-2xl tracking-tighter uppercase">{lastM.isBalanced ? 'IFRS INTEGRITY: 100% BALANCED' : 'SYSTEM DISBALANCE DETECTED'}</span>
             <span className="text-xs font-bold opacity-60 uppercase tracking-widest">{lastM.isBalanced ? 'Accounting Equation Verified: Assets = Equity + Liabilities' : 'Accounting Error Found - Please check Month 0 setups'}</span>
          </div>
        </div>
        {!lastM.isBalanced && (
          <div className="text-right flex flex-col">
             <span className="text-[10px] uppercase opacity-60">Delta Amount</span>
             <span className="text-3xl font-mono tracking-tighter font-black">{format(Math.abs(lastM.assets - lastM.liabilitiesEquity))} GEL</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderCF = () => (
    <div className="overflow-x-auto bg-white rounded-3xl shadow-2xl border border-slate-200 animate-in fade-in duration-500">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-black">
          <tr>
            <th className="py-6 px-8 w-80 border-r border-slate-800 sticky left-0 bg-slate-900 z-10">Cash Flow Detailed (Direct Method)</th>
            {filteredData.map(m => <th key={m.month} className="py-6 px-2 text-center border-r border-slate-800 last:border-0 min-w-[80px]">M{m.month}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
          
          {/* OPERATING ACTIVITIES */}
          <tr className="bg-slate-900/5"><td colSpan={14} className="py-3 px-8 text-[10px] font-black text-slate-800 uppercase tracking-[0.1em] sticky left-0 bg-slate-50 z-10 flex items-center gap-2">
            <Activity size={12} className="text-indigo-600" /> Cash from Operating Activities
          </td></tr>
          
          <tr className="hover:bg-slate-50">
            <td className="py-2.5 px-8 font-bold text-slate-700 sticky left-0 bg-white z-10">Net Profit / წმინდა მოგება</td>
            {filteredData.map(m => <td key={m.month} className="text-center text-slate-800 font-bold">{format(m.netProfit)}</td>)}
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="py-2.5 px-8 text-slate-500 italic sticky left-0 bg-white z-10 pl-12">Adjust: Depreciation (Non-cash)</td>
            {filteredData.map(m => <td key={m.month} className="text-center text-emerald-600 font-bold">{format(m.depreciation)}</td>)}
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="py-2.5 px-8 text-slate-500 italic sticky left-0 bg-white z-10 pl-12">Change in Receivables (AR & Tax)</td>
            {filteredData.map(m => {
              const prev = getPrevMonth(m.month);
              // Include VAT Receivable in the AR change logic to match balance sheet delta
              const curTotal = m.ar + (m.vatReceivable || 0);
              const prevTotal = prev ? (prev.ar + (prev.vatReceivable || 0)) : 0;
              const delta = -(curTotal - prevTotal);
              return <td key={m.month} className={`text-center font-bold ${delta < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatSigned(delta)}</td>;
            })}
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="py-2.5 px-8 text-slate-500 italic sticky left-0 bg-white z-10 pl-12">Change in Inventory</td>
            {filteredData.map(m => {
              const prev = getPrevMonth(m.month);
              const delta = prev ? -(m.inventory - prev.inventory) : -m.inventory;
              return <td key={m.month} className={`text-center font-bold ${delta < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatSigned(delta)}</td>;
            })}
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="py-2.5 px-8 text-slate-500 italic sticky left-0 bg-white z-10 pl-12">Change in Payables (AP)</td>
            {filteredData.map(m => {
              const prev = getPrevMonth(m.month);
              const delta = prev ? (m.ap - prev.ap) : m.ap;
              return <td key={m.month} className={`text-center font-bold ${delta < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatSigned(delta)}</td>;
            })}
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="py-2.5 px-8 text-slate-500 italic sticky left-0 bg-white z-10 pl-12">Change in VAT Liability</td>
            {filteredData.map(m => {
              const prev = getPrevMonth(m.month);
              const delta = prev ? (m.vatLiability - prev.vatLiability) : m.vatLiability;
              return <td key={m.month} className={`text-center font-bold ${delta < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatSigned(delta)}</td>;
            })}
          </tr>
          
          <tr className="bg-emerald-50 font-black text-emerald-800 border-y border-emerald-100">
            <td className="py-4 px-8 uppercase text-[10px] sticky left-0 bg-emerald-50 z-10">Net Operating Cash Flow</td>
            {filteredData.map(m => <td key={m.month} className="text-center text-sm">{format(m.cfOperating)}</td>)}
          </tr>

          {/* INVESTING ACTIVITIES */}
          <tr className="bg-slate-900/5"><td colSpan={14} className="py-3 px-8 text-[10px] font-black text-slate-800 uppercase tracking-[0.1em] sticky left-0 bg-slate-50 z-10 flex items-center gap-2">
            <Briefcase size={12} className="text-indigo-600" /> Cash from Investing Activities
          </td></tr>
          <tr className="hover:bg-slate-50">
            <td className="py-2.5 px-8 text-slate-500 italic sticky left-0 bg-white z-10 pl-12">CAPEX / Asset Purchase</td>
            {filteredData.map(m => <td key={m.month} className="text-center text-rose-500 font-bold">{m.cfInvesting !== 0 ? formatSigned(m.cfInvesting) : '—'}</td>)}
          </tr>
          <tr className="bg-slate-100 font-black text-slate-700 border-y border-slate-200">
            <td className="py-4 px-8 uppercase text-[10px] sticky left-0 bg-slate-100 z-10">Net Investing Cash Flow</td>
            {filteredData.map(m => <td key={m.month} className="text-center text-sm">{m.cfInvesting !== 0 ? formatSigned(m.cfInvesting) : '—'}</td>)}
          </tr>

          {/* FINANCING ACTIVITIES */}
          <tr className="bg-slate-900/5"><td colSpan={14} className="py-3 px-8 text-[10px] font-black text-slate-800 uppercase tracking-[0.1em] sticky left-0 bg-slate-50 z-10 flex items-center gap-2">
            <Coins size={12} className="text-indigo-600" /> Cash from Financing Activities
          </td></tr>
          <tr className="hover:bg-slate-50">
            <td className="py-2.5 px-8 text-slate-500 italic sticky left-0 bg-white z-10 pl-12">Initial Equity Inflow (M0/M1)</td>
            {filteredData.map(m => {
              // Usually the big inflow is captured in CF Financing for Month 1 setup
              const deltaEquity = m.month === 1 ? m.equityContributed + m.repaymentAmount : 0;
              return <td key={m.month} className="text-center text-indigo-600 font-bold">{deltaEquity > 0 ? format(deltaEquity) : '—'}</td>;
            })}
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="py-2.5 px-8 text-slate-500 italic sticky left-0 bg-white z-10 pl-12">Principal Repayment (Payback)</td>
            {filteredData.map(m => <td key={m.month} className="text-center text-rose-500 font-bold">{m.repaymentAmount > 0 ? formatSigned(-m.repaymentAmount) : '—'}</td>)}
          </tr>
          <tr className="bg-slate-100 font-black text-slate-700 border-y border-slate-200">
            <td className="py-4 px-8 uppercase text-[10px] sticky left-0 bg-slate-100 z-10">Net Financing Cash Flow</td>
            {filteredData.map(m => <td key={m.month} className="text-center text-sm">{format(m.cfFinancing)}</td>)}
          </tr>

          {/* SUMMARY NET CHANGE */}
          <tr className="bg-slate-900 text-white font-black border-t-2 border-indigo-500 shadow-inner">
            <td className="py-6 px-8 uppercase text-xs tracking-widest sticky left-0 bg-slate-900 z-10">Net Monthly Cash Change</td>
            {filteredData.map(m => <td key={m.month} className={`text-center text-base ${m.cfNet < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{formatSigned(m.cfNet)}</td>)}
          </tr>
          
          <tr className="bg-indigo-600 text-white font-black border-t-4 border-indigo-300">
            <td className="py-7 px-8 uppercase text-sm tracking-[0.2em] sticky left-0 bg-indigo-600 z-10 flex items-center gap-3">
              <Landmark size={20} className="text-indigo-200" /> Ending Cash Balance
            </td>
            {filteredData.map(m => <td key={m.month} className="text-center text-xl text-white tracking-tighter">{format(m.cashBalance)}</td>)}
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-10 pb-40 px-2 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black text-slate-900 flex items-center gap-6 tracking-tighter">
          <FileText className="text-indigo-600" size={48} /> 
          {viewId === ViewID.PL_STATEMENT ? 'Profit & Loss Detailed' : 
           viewId === ViewID.BALANCE_SHEET ? 'Balance Sheet (Liquidity View)' : 'Cash Flow Analysis'}
        </h2>
        <div className="flex bg-slate-100 p-2 rounded-2xl border border-slate-200 shadow-inner">
          {[1, 2, 3, 4, 5].map(y => (
            <button key={y} onClick={() => setYear(y)} className={`px-10 py-3 rounded-xl text-xs font-black uppercase transition-all duration-300 ${year === y ? 'bg-white text-indigo-600 shadow-xl scale-110' : 'text-slate-500 hover:text-slate-800'}`}>Year {y}</button>
          ))}
        </div>
      </div>
      {viewId === ViewID.PL_STATEMENT && renderPL()}
      {viewId === ViewID.BALANCE_SHEET && renderBS()}
      {viewId === ViewID.CASH_FLOW && renderCF()}
    </div>
  );
};
