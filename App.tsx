
import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ViewRenderer } from './components/ViewRenderer';
import { AIAssistant } from './components/AIAssistant';
import { ScenarioType, ViewID, FinancialInputs, Language } from './types';

const DEFAULT_INPUTS: FinancialInputs = {
  hotelRooms: 100,
  utilizationRate: 0.8,
  shiftsCount: 1,
  ownedWashers: 0,
  ownedDryers: 0,
  ownedCalendars: 0,
  hasAutoFolder: false,
  linenItems: [
    { id: '1', nameKa: 'ზეწარი', nameEn: 'Bed Sheet', weightG: 1000, qtyPerRoom: 2, active: true },
    { id: '2', nameKa: 'ბალიშის პირი', nameEn: 'Pillow Case', weightG: 200, qtyPerRoom: 4, active: true },
    { id: '3', nameKa: 'საბნის პირი', nameEn: 'Duvet Cover', weightG: 1350, qtyPerRoom: 1, active: true },
    { id: '4', nameKa: 'დიდი პირსახოცი', nameEn: 'Large Towel', weightG: 700, qtyPerRoom: 2, active: true },
    { id: '5', nameKa: 'ხელის პირსახოცი', nameEn: 'Hand Towel', weightG: 300, qtyPerRoom: 2, active: true },
    { id: '6', nameKa: 'ხალათი', nameEn: 'Bathrobe', weightG: 1200, qtyPerRoom: 1, active: true },
  ]
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewID>(() => {
    const saved = localStorage.getItem('laundrometric_active_view');
    return (saved as ViewID) || ViewID.DASHBOARD;
  });
  
  const [scenario, setScenario] = useState<ScenarioType>(() => {
    const saved = localStorage.getItem('laundrometric_scenario');
    return (saved as ScenarioType) || ScenarioType.BASE_CASE;
  });

  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('laundrometric_lang');
    return (saved as Language) || Language.EN;
  });

  const [inputs, setInputs] = useState<FinancialInputs>(() => {
    const saved = localStorage.getItem('laundrometric_global_inputs');
    return saved ? JSON.parse(saved) : DEFAULT_INPUTS;
  });
  
  const [viewData, setViewData] = useState<string>('');
  const [aiExpanded, setAiExpanded] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('laundrometric_active_view', activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem('laundrometric_scenario', scenario);
  }, [scenario]);

  useEffect(() => {
    localStorage.setItem('laundrometric_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('laundrometric_global_inputs', JSON.stringify(inputs));
  }, [inputs]);

  const handleViewChange = useCallback((view: ViewID) => {
    setActiveView(view);
    setViewData(''); 
  }, []);

  const handleScenarioChange = useCallback((newScenario: ScenarioType) => {
    setScenario(newScenario);
  }, []);

  const handleLangChange = useCallback((newLang: Language) => {
    setLang(newLang);
  }, []);

  const handleDataUpdate = useCallback((data: string) => {
    setViewData(data);
  }, []);

  const handleInputChange = useCallback((key: keyof FinancialInputs, value: any) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white selection:bg-slate-200">
      <Sidebar activeView={activeView} onViewChange={handleViewChange} lang={lang} />

      <div className="flex flex-col flex-1 min-w-0">
        <Header 
          scenario={scenario} 
          onScenarioChange={handleScenarioChange} 
          lang={lang}
          onLangChange={handleLangChange}
          activeViewLabel={activeView.replace('-', ' ').toUpperCase()} 
        />
        
        <div className="flex flex-1 overflow-hidden relative">
          <main className={`flex-1 p-8 overflow-y-auto bg-white transition-all duration-300 ${aiExpanded ? 'mr-0' : 'mr-0'}`}>
            <ViewRenderer 
              activeView={activeView} 
              scenario={scenario} 
              lang={lang}
              onScenarioChange={handleScenarioChange}
              onDataUpdate={handleDataUpdate}
              inputs={inputs}
              onInputChange={handleInputChange}
              aiExpanded={aiExpanded}
            />
          </main>

          <AIAssistant 
            activeView={activeView} 
            scenario={scenario} 
            contextData={viewData}
            isExpanded={aiExpanded}
            onToggle={() => setAiExpanded(!aiExpanded)}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
