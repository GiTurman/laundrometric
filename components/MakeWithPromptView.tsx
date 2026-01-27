
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquarePlus, Sparkles, Send, Loader2, CheckCircle, AlertCircle, Zap, Clock, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { Language, ScenarioType } from '../types';
import { translations } from '../translations';
import { GoogleGenAI } from "@google/genai";

interface MakeWithPromptViewProps {
  lang: Language;
  scenario: ScenarioType;
}

interface HistoryItem {
  id: string; // e.g., #701
  originalPrompt: string;
  actionTaken: string;
  timestamp: string;
  status: 'success' | 'error';
}

export const MakeWithPromptView: React.FC<MakeWithPromptViewProps> = ({ lang, scenario }) => {
  const t = translations[lang];
  const [prompt, setPrompt] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [predictive, setPredictive] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'none', message: string }>({ type: 'none', message: '' });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize History and Next ID from LocalStorage
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('laundrometric_prompt_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [nextId, setNextId] = useState<number>(() => {
    const saved = localStorage.getItem('laundrometric_prompt_next_id');
    return saved ? parseInt(saved) : 701;
  });

  useEffect(() => {
    localStorage.setItem('laundrometric_prompt_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('laundrometric_prompt_next_id', nextId.toString());
  }, [nextId]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Predictive Feedback Logic
  useEffect(() => {
    const p = prompt.toLowerCase();
    if (p.includes('salary') || p.includes('ხელფასი') || p.includes('gehalt')) {
      setPredictive('OPEX Update: Salaries & Payroll');
    } else if (p.includes('invest') || p.includes('ინვესტიცია') || p.includes('investition')) {
      setPredictive('Founders Update: Capital Contribution');
    } else if (p.includes('price') || p.includes('ფასი') || p.includes('preis')) {
      setPredictive('Settings Update: Revenue Driver');
    } else if (p.length > 5) {
      setPredictive('Analyzing Input...');
    } else {
      setPredictive('');
    }
  }, [prompt]);

  const handlePromptSubmission = async () => {
    if (!prompt.trim() || isExecuting) return;

    setIsExecuting(true);
    setStatus({ type: 'none', message: '' });
    const currentId = `#${nextId}`;
    const timestamp = new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `
        You are a financial data parser for LaundroMetric. Convert instructions to JSON.
        Actions: UPDATE_OPEX, UPDATE_FOUNDER, UPDATE_SETTING.
        Example: "Director salary 2000" -> {"action": "UPDATE_OPEX", "target": "Salary", "name": "Director", "value": 2000}
        Example: "Invest 50000" -> {"action": "UPDATE_FOUNDER", "target": "Investment", "amount": 50000}
        Return ONLY valid JSON.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { systemInstruction, responseMimeType: 'application/json' }
      });

      const result = JSON.parse(response.text || '{}');
      await executeAction(result);
      
      // Success Logging
      const actionDesc = result.action === 'UPDATE_OPEX' ? `Updated ${result.name} Salary to ${result.value}` :
                         result.action === 'UPDATE_FOUNDER' ? `Added Investment: ${result.amount}` :
                         result.action === 'UPDATE_SETTING' ? `Changed Setting: ${result.target}` : 'General Update';

      const logItem: HistoryItem = {
        id: currentId,
        originalPrompt: prompt,
        actionTaken: actionDesc,
        timestamp: timestamp,
        status: 'success'
      };

      setHistory(prev => [logItem, ...prev]);
      setNextId(prev => prev + 1);
      setStatus({ type: 'success', message: t.promptSuccess });
      setPrompt('');

    } catch (error) {
      console.error("Prompt Parsing Error:", error);
      
      // Error Logging
      const logItem: HistoryItem = {
        id: currentId,
        originalPrompt: prompt,
        actionTaken: "Parsing Failed",
        timestamp: timestamp,
        status: 'error'
      };
      setHistory(prev => [logItem, ...prev]);
      setNextId(prev => prev + 1);
      setStatus({ type: 'error', message: t.promptError });
    } finally {
      setIsExecuting(false);
    }
  };

  const executeAction = async (data: any) => {
    if (data.action === 'UPDATE_OPEX') {
      const saved = JSON.parse(localStorage.getItem('laundrometric_opex_table_rows_v3') || '[]');
      const updated = [...saved];
      const index = updated.findIndex((r: any) => r.name.toLowerCase().includes(data.name?.toLowerCase() || ''));
      
      if (index > -1) {
        updated[index].unitCost = data.value;
      } else {
        updated.push({
          id: Date.now().toString(),
          name: data.name || data.target,
          category: 'ხელფასი (Salary/Payroll)',
          plCategory: 'COGS: საწარმოო პერსონალის ხელფასი',
          type: 'Fixed',
          unit: 'კაცი',
          quantity: 1,
          unitCost: data.value,
          taxType: 'Income Tax'
        });
      }
      localStorage.setItem('laundrometric_opex_table_rows_v3', JSON.stringify(updated));
    }

    if (data.action === 'UPDATE_FOUNDER') {
      const saved = JSON.parse(localStorage.getItem('laundrometric_founders_data') || '[]');
      if (saved.length > 0) {
        const newInv = {
          id: 'prompt-' + Date.now(),
          partner: saved[0].name,
          amount: data.amount,
          currency: 'GEL',
          rate: 1,
          month: 'იანვარი',
          year: '2024',
          liability: 0
        };
        saved[0].investments.push(newInv);
        localStorage.setItem('laundrometric_founders_data', JSON.stringify(saved));
      }
    }

    if (data.action === 'UPDATE_SETTING') {
      const key = `laundrometric_settings_${scenario}`;
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      saved[data.target] = data.value;
      localStorage.setItem(key, JSON.stringify(saved));
    }

    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Main Content Area */}
      <div className={`w-full h-full flex flex-col items-center justify-center gap-10 animate-in fade-in duration-700 transition-all duration-500 ${isHistoryOpen ? 'pb-64' : ''}`}>
        <div className="max-w-3xl w-full space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <MessageSquarePlus className="text-emerald-500" size={48} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{t.makeWithPrompt}</h2>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">AI-Driven Financial Orchestration</p>
          </div>

          <div className="relative group">
            {/* Glowing Border Container */}
            <div className={`absolute -inset-1 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 ${isExecuting ? 'animate-pulse' : ''}`}></div>
            
            <div className="relative bg-slate-900 rounded-[2.5rem] p-4 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center gap-4 px-6 py-4">
                <Sparkles className="text-emerald-400 shrink-0" size={24} />
                <input 
                  ref={inputRef}
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePromptSubmission()}
                  placeholder={t.promptPlaceholder}
                  className="w-full bg-transparent border-none text-white font-bold text-xl outline-none placeholder:text-slate-600"
                  disabled={isExecuting}
                />
                <button 
                  onClick={handlePromptSubmission}
                  disabled={!prompt.trim() || isExecuting}
                  className="p-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-400 transition-all disabled:opacity-30 shadow-lg shadow-emerald-500/20"
                >
                  {isExecuting ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                </button>
              </div>

              {predictive && (
                <div className="px-6 pb-4 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.promptPredictive}</span>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{predictive}</span>
                </div>
              )}
            </div>
          </div>

          <div className="h-10 flex flex-col items-center justify-center">
            {status.type === 'success' && (
              <div className="flex items-center gap-3 text-emerald-500 animate-in slide-in-from-bottom-2 duration-300">
                <CheckCircle size={20} />
                <p className="text-sm font-black uppercase tracking-tight">{status.message}</p>
              </div>
            )}
            {status.type === 'error' && (
              <div className="flex items-center gap-3 text-rose-500 animate-in shake duration-300">
                <AlertCircle size={20} />
                <p className="text-sm font-black uppercase tracking-tight">{status.message}</p>
              </div>
            )}
            {isExecuting && (
              <div className="flex items-center gap-3 text-indigo-400">
                 <Zap className="animate-bounce" size={20} />
                 <p className="text-sm font-black uppercase tracking-tight">{t.promptExecuting}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sliding History Panel */}
      <div className={`absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-all duration-500 ease-in-out ${isHistoryOpen ? 'h-80' : 'h-14 hover:h-16'}`}>
        <button 
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="w-full h-14 flex items-center justify-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer border-b border-slate-100"
        >
           {isHistoryOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
           <span className="text-xs font-black uppercase tracking-widest">{t.historyLog}</span>
        </button>

        <div className="h-[calc(100%-3.5rem)] overflow-y-auto p-6">
           <div className="max-w-4xl mx-auto space-y-4">
             {history.length === 0 ? (
               <div className="text-center py-10 opacity-40">
                 <Clock size={48} className="mx-auto mb-4 text-slate-300" />
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Activity Recorded</p>
               </div>
             ) : (
               <>
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latest Events</span>
                    <button onClick={() => setHistory([])} className="text-[10px] font-bold text-rose-400 hover:text-rose-600 uppercase flex items-center gap-1">
                      <Trash2 size={12} /> {t.clearHistory}
                    </button>
                 </div>
                 <div className="space-y-3">
                   {history.map((item) => (
                     <div key={item.id} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between group hover:border-indigo-200 transition-all">
                        <div className="flex items-center gap-4">
                           <span className="text-xs font-mono font-black text-indigo-400 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">{item.id}</span>
                           <div>
                              <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{item.actionTaken}</p>
                              <p className="text-[10px] text-slate-500 font-medium">"{item.originalPrompt}"</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-[10px] font-mono font-bold text-slate-400">{item.timestamp}</span>
                           {item.status === 'success' ? (
                             <CheckCircle size={16} className="text-emerald-500" />
                           ) : (
                             <AlertCircle size={16} className="text-rose-500" />
                           )}
                        </div>
                     </div>
                   ))}
                 </div>
               </>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};
