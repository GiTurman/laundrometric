
import React from 'react';
import { useFinancialEngine } from '../hooks/useFinancialEngine';
import { ScenarioType } from '../types';
import { TrendingUp, Clock, Calculator, ShieldCheck } from 'lucide-react';

export const InvestmentsView: React.FC<{ scenario: ScenarioType }> = ({ scenario }) => {
  const data = useFinancialEngine(scenario);
  
  // Total funding includes Month 0 setup
  const totalInvested = data[0].assets + Math.abs(data[0].repaymentAmount); // Initial value estimation
  const currentInvestmentBalance = data[data.length - 1].investmentBalance;
  const totalRepaid = data.reduce((sum, m) => sum + m.repaymentAmount, 0);
  const paybackMonth = data.find(m => m.investmentBalance <= 0)?.month;

  const format = (n: number) => new Intl.NumberFormat('ka-GE', { minimumFractionDigits: 0 }).format(n);

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in duration-500 pb-40">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <TrendingUp className="text-indigo-600" /> Investment Payback Engine
          </h2>
          <p className="text-sm text-slate-500 mt-1 uppercase tracking-tight">Return of Capital Policy: 50% Net Profit (Tax-Free Principal Repayment)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Initial Funding</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-600 font-mono">{format(data[0].equityContributed + totalRepaid)}</span>
            <span className="text-slate-400 text-xs font-bold">GEL</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm border-b-4 border-b-emerald-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Repaid to Investor</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 font-mono">{format(totalRepaid)}</span>
            <span className="text-slate-400 text-xs font-bold">GEL</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm border-b-4 border-b-rose-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Remaining to Payback</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600 font-mono">{format(currentInvestmentBalance)}</span>
            <span className="text-slate-400 text-xs font-bold">GEL</span>
          </div>
        </div>
        <div className="bg-slate-900 rounded-[2rem] p-6 shadow-xl text-white">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Payback Target</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 font-mono">{paybackMonth ? `M${paybackMonth}` : 'Calculating...'}</span>
            <span className="text-slate-400 text-xs font-bold uppercase">Target Date</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-lg">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest">Payback Schedule (Return of Capital)</h3>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-black bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 uppercase">
                <ShieldCheck size={14} /> Tax Free (Return of Principal)
             </div>
             <div className="flex items-center gap-2 text-[10px] text-amber-600 font-black bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100 uppercase">
                <Clock size={14} /> 3-Month Grace Applied
             </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-black">
              <tr>
                <th className="py-4 px-8 w-32">Period</th>
                <th className="py-4 px-2 text-center">Monthly Net Profit</th>
                <th className="py-4 px-2 text-center">Repayment (50% NP)</th>
                <th className="py-4 px-2 text-center">Tax Applied</th>
                <th className="py-4 px-8 text-right font-black">Remaining Investment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {data.slice(0, 36).map(m => (
                <tr key={m.month} className={`hover:bg-slate-50 transition-colors ${m.repaymentAmount > 0 ? 'bg-emerald-50/10' : ''}`}>
                  <td className="py-4 px-8 font-black text-slate-900">Month {m.month}</td>
                  <td className="py-4 px-2 text-center text-slate-600">{format(m.netProfit)}</td>
                  <td className="py-4 px-2 text-center font-black text-emerald-600">{m.repaymentAmount > 0 ? `(${format(m.repaymentAmount)})` : '—'}</td>
                  <td className="py-4 px-2 text-center text-slate-300 font-black">0% (Payback)</td>
                  <td className="py-4 px-8 text-right font-black text-slate-900 text-sm">{format(m.investmentBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-indigo-600 rounded-[3rem] p-10 text-white flex flex-col md:flex-row gap-10 items-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="p-6 bg-white/10 rounded-[2rem] border border-white/20">
          <Calculator size={48} className="text-indigo-200" />
        </div>
        <div className="flex-1">
          <h4 className="text-2xl font-black mb-4 uppercase tracking-tighter">Investment Recovery Protocol (IRP)</h4>
          <p className="text-base text-indigo-50 leading-relaxed opacity-90 font-medium">
            ჩვენი მოდელი იყენებს "Capital First" პრინციპს. ინვესტიციის დაბრუნება ითვლება როგორც საწყისი კაპიტალის რეპატრიაცია და არა როგორც დივიდენდი, რაც იმას ნიშნავს, რომ **დაბრუნებული თანხა არ იბეგრება (0% Tax)** მანამ, სანამ საწყისი ინვესტიცია (CAPEX + Pre-ops + Min Cash) სრულად არ ამოიწურება. გადახდა ავტომატურად იწყება პირველი მოგებიდან მე-3 თვეს.
          </p>
        </div>
      </div>
    </div>
  );
};
