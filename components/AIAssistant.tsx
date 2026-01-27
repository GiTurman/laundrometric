
import React, { useState } from 'react';
import { Sparkles, BarChart3, Lightbulb, MessageSquare, Loader2, Play, ChevronRight, ChevronLeft } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { ViewID, ScenarioType } from '../types';

interface AIAssistantProps {
  activeView: ViewID;
  scenario: ScenarioType;
  contextData: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ 
  activeView, 
  scenario, 
  contextData, 
  isExpanded, 
  onToggle 
}) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const analyzeData = async () => {
    if (!isExpanded) onToggle();
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        როგორც მსოფლიო დონის ფინანსური მრჩეველი, გააანალიზე მხოლოდ ქვემოთ მოცემული ინფორმაცია სამრეწველო სამრეცხაოს ბიზნეს მოდელისთვის:
        
        მენიუ: ${activeView}
        სცენარი: ${scenario}
        არსებული მონაცემები გვერდზე: ${contextData || "მონაცემები ჯერ არ არის შეყვანილი."}
        
        მოთხოვნები:
        1. გააკეთე მაქსიმალურად მოკლე და ინფორმაციული ანალიზი (მაქს 3 წინადადება).
        2. მოგვეცი 2 კონკრეტული სტრატეგიული რჩევა ამ მენიუსთვის.
        3. გამოიყენე პროფესიული, საქმიანი ქართული ენა.
        
        ნუ გამოიყენებ ზოგად ფრაზებს. ფოკუსირდი მხოლოდ ამ მენიუს კონტექსტზე.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAnalysis(response.text || 'ანალიზი ვერ მოხერხდა.');
    } catch (error) {
      console.error("AI Analysis Error:", error);
      setAnalysis('დაფიქსირდა შეცდომა მონაცემების დამუშავებისას.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className={`relative h-full border-l border-slate-200 bg-slate-50 transition-all duration-300 flex flex-col overflow-hidden ${isExpanded ? 'w-[320px]' : 'w-12'}`}>
      {/* Toggle Button */}
      <button 
        onClick={onToggle}
        className="absolute left-1 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 shadow-sm z-50 transition-all"
      >
        {isExpanded ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {isExpanded ? (
        <>
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between ml-8">
            <div className="flex items-center gap-2">
              <Sparkles className="text-indigo-600" size={18} />
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">AI მრჩეველი</h3>
            </div>
            <button 
              onClick={analyzeData}
              disabled={loading}
              className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors disabled:opacity-50"
              title="ანალიზის დაწყება"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 ml-8">
            {!analysis && !loading ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-400">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 mb-1">ანალიზი მზად არის</p>
                  <p className="text-[11px] text-slate-400">დააჭირეთ "Play" ღილაკს ზემოთ, რათა AI-მ გააანალიზოს მიმდინარე გვერდის მონაცემები.</p>
                </div>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center h-40 space-y-3 opacity-50">
                <Loader2 className="animate-spin text-slate-400" size={24} />
                <p className="text-xs font-medium text-slate-400">მონაცემების ანალიზი...</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 size={16} className="text-indigo-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">სიტუაციური ანალიზი</span>
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                    {analysis}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">ოპერატიული რჩევა</h4>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                    <div className="flex gap-3">
                      <Lightbulb className="text-indigo-600 shrink-0" size={18} />
                      <div>
                        <p className="text-[11px] font-bold text-indigo-900 mb-1">საკვანძო რეკომენდაცია</p>
                        <p className="text-[11px] text-indigo-700 leading-relaxed">
                          {activeView === ViewID.FOUNDERS 
                            ? "აკონტროლეთ დივიდენდების გაცემის დინამიკა საწყის ეტაპზე რეინვესტირების შესაძლებლობის შესანარჩუნებლად."
                            : "დარწმუნდით, რომ არჩეული სცენარი შეესაბამება მიმდინარე საბაზრო ტენდენციებს."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={analyzeData}
                  className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-[10px] font-bold text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-all uppercase tracking-widest"
                >
                  ანალიზის განახლება
                </button>
              </>
            )}
          </div>

          <div className="p-4 bg-slate-900 text-white ml-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Model Integrity</span>
              <span className="text-xs font-bold text-emerald-400">Stable</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1">
              <div className="bg-emerald-500 h-1 rounded-full w-[100%]"></div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center py-6 gap-8">
          <Sparkles className="text-indigo-600 opacity-30" size={20} />
          <div className="[writing-mode:vertical-lr] text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI მრჩეველი</div>
        </div>
      )}
    </aside>
  );
};
